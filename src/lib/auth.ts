import { betterAuth } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { eq } from 'drizzle-orm'

import { db } from '#/db'
import * as schema from '#/db/schema'
import { decidirPapel, nomeCurto, normalizarEmail } from '#/domain/acesso'
import { estadoConvite } from '#/domain/convite'
import { COOKIE_CONVITE } from '#/lib/cadastro'
import { notificacoesEventos } from '#/domain/notificacoes'
import { notificarNarradores } from '#/server/enviar-notificacao'

export const auth = betterAuth({
  appName: 'Vitae',
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  // A origem de BETTER_AUTH_URL já é confiável; outras (ex.: http://127.0.0.1:3005) vêm de
  // BETTER_AUTH_TRUSTED_ORIGINS, separadas por vírgula, que o better-auth lê do ambiente.
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: false },
  // Bloqueia também chamadas diretas às antigas rotas e impede remover o único meio de entrada.
  disabledPaths: [
    '/sign-up/email', '/sign-in/email', '/sign-in/username',
    '/change-password', '/request-password-reset', '/reset-password', '/unlink-account',
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: { enabled: false },
  },
  user: {
    additionalFields: {
      // Preenchido pelo hook de criação; a coluna continua NOT NULL.
      papel: { type: 'string', required: false, input: false },
    },
  },
  advanced: { ipAddress: { ipAddressHeaders: ['x-real-ip'] } },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/get-session' || !ctx.context.session) return
      const { session, user } = ctx.context.session
      const contas = await ctx.context.internalAdapter.findAccounts(user.id)
      if (contas.some((conta) => conta.providerId === 'google')) return
      // Sessões anteriores à entrada exclusiva pelo Google também precisam respeitar o corte.
      await ctx.context.internalAdapter.deleteSession(session.token)
      return ctx.json(null)
    }),
  },
  databaseHooks: {
    user: {
      create: {
        // Só o Narrador e quem chega pelo link atual da Crônica conseguem criar conta.
        before: async (user, ctx) => {
          const token = ctx?.getCookie(COOKIE_CONVITE) ?? null
          const convite = token
            ? await db.query.conviteCronica.findFirst({ where: eq(schema.conviteCronica.token, token) })
            : undefined
          const email = normalizarEmail(user.email)
          const papel = decidirPapel({
            email,
            narradorEmail: process.env.NARRADOR_EMAIL ?? '',
            temConvite: estadoConvite(convite) === 'valido',
          })
          if (!papel) {
            throw new APIError('FORBIDDEN', { message: 'sem_convite' })
          }
          // Com Google, o nome na Crônica começa com os dois primeiros nomes; a pessoa troca em /conta.
          const name = nomeCurto(user.name)
          return { data: { ...user, email, papel, name } }
        },
        // O link da mesa continua valendo para os próximos; só limpa o cookie de quem acabou de entrar.
        after: async (user, ctx) => {
          if (ctx?.getCookie(COOKIE_CONVITE)) ctx.setCookie(COOKIE_CONVITE, '', { path: '/', maxAge: 0 })
          if (user.papel === 'jogador') {
            const notif = notificacoesEventos.novoJogador(user.name)
            await notificarNarradores({ texto: notif.texto, destino: notif.destino })
          }
        },
      },
    },
  },
  plugins: [tanstackStartCookies()],
})
