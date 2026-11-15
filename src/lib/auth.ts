import { betterAuth } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { db } from '#/db'
import * as schema from '#/db/schema'
import { decidirPapel, nomeCurto, normalizarEmail } from '#/domain/acesso'

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
      if (user.papel === 'narrador' &&
        normalizarEmail(user.email) === normalizarEmail(process.env.NARRADOR_EMAIL ?? '') &&
        contas.some((conta) => conta.providerId === 'google')) return
      // Contas legadas permanecem no banco, mas só o Narrador configurado mantém sessão.
      await ctx.context.internalAdapter.deleteSession(session.token)
      return ctx.json(null)
    }),
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session, ctx) => {
          const user = await ctx?.context.internalAdapter.findUserById(session.userId)
          if (!user || !('papel' in user) || user.papel !== 'narrador' ||
            decidirPapel({ email: user.email, narradorEmail: process.env.NARRADOR_EMAIL ?? '' }) !== 'narrador') {
            throw new APIError('FORBIDDEN', { message: 'somente_narrador' })
          }
          return { data: session }
        },
      },
    },
    user: {
      create: {
        before: async (user) => {
          const email = normalizarEmail(user.email)
          const papel = decidirPapel({
            email,
            narradorEmail: process.env.NARRADOR_EMAIL ?? '',
          })
          if (!papel) {
            throw new APIError('FORBIDDEN', { message: 'somente_narrador' })
          }
          // Com Google, o nome na Crônica começa com os dois primeiros nomes; a pessoa troca em /conta.
          const name = nomeCurto(user.name)
          return { data: { ...user, email, papel, name } }
        },
      },
    },
  },
  plugins: [tanstackStartCookies()],
})
