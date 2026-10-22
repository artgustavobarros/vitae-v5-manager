import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { eq } from 'drizzle-orm'

import { db } from '#/db'
import * as schema from '#/db/schema'
import { decidirPapel, normalizarEmail } from '#/domain/acesso'

export const auth = betterAuth({
  appName: 'Umbra',
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  // Login de desenvolvimento: e-mail e senha só existem em `pnpm dev`.
  emailAndPassword: { enabled: import.meta.env?.DEV ?? false },
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
        // Só o Narrador e quem tem Convite para a Crônica conseguem criar conta.
        before: async (user) => {
          const email = normalizarEmail(user.email)
          const convite = await db.query.conviteCronica.findFirst({
            where: eq(schema.conviteCronica.email, email),
          })
          const papel = decidirPapel({
            email,
            narradorEmail: process.env.NARRADOR_EMAIL ?? '',
            temConvite: convite !== undefined,
          })
          if (!papel) {
            throw new APIError('FORBIDDEN', { message: 'sem_convite' })
          }
          return { data: { ...user, email, papel } }
        },
      },
    },
  },
  plugins: [tanstackStartCookies()],
})
