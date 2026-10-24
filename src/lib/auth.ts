import { randomUUID } from 'node:crypto'

import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { eq } from 'drizzle-orm'

import { db } from '#/db'
import * as schema from '#/db/schema'
import { decidirPapel, nomeCurto, normalizarEmail } from '#/domain/acesso'
import { estadoConvite, validarNomeUsuario } from '#/domain/convite'
import { COOKIE_CONVITE, DOMINIO_EMAIL_SINTETICO } from '#/lib/cadastro'

const DEV = import.meta.env?.DEV ?? false

export const auth = betterAuth({
  appName: 'Umbra',
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  // Jogadores entram por nome de usuário e senha; quem cria a conta é o hook abaixo, com Convite para a Crônica.
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
  user: {
    additionalFields: {
      // Preenchido pelo hook de criação; a coluna continua NOT NULL.
      papel: { type: 'string', required: false, input: false },
    },
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
          const porSenha = ctx?.path === '/sign-up/email'
          const sintetico = user.email.endsWith(`@${DOMINIO_EMAIL_SINTETICO}`)
          const email = sintetico ? `${randomUUID()}@${DOMINIO_EMAIL_SINTETICO}` : normalizarEmail(user.email)
          const papel = decidirPapel({
            email,
            narradorEmail: process.env.NARRADOR_EMAIL ?? '',
            temConvite: estadoConvite(convite) === 'valido',
            metodo: porSenha ? 'senha' : 'google',
            dev: DEV,
          })
          if (!papel) {
            throw new APIError('FORBIDDEN', { message: 'sem_convite' })
          }
          // Com Google, o nome na Crônica começa com os dois primeiros nomes; a pessoa troca em /conta.
          const name = porSenha ? user.name : nomeCurto(user.name)
          return { data: { ...user, email, papel, name } }
        },
        // O link da mesa continua valendo para os próximos; só limpa o cookie de quem acabou de entrar.
        after: async (_user, ctx) => {
          if (ctx?.getCookie(COOKIE_CONVITE)) ctx.setCookie(COOKIE_CONVITE, '', { path: '/', maxAge: 0 })
        },
      },
    },
  },
  plugins: [
    username({ usernameValidator: (nome) => validarNomeUsuario(nome) === null }),
    tanstackStartCookies(),
  ],
})
