import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export * from './auth-schema.ts'

/** Convite para a Crônica: libera o login de um Jogador pelo e-mail Google. */
export const conviteCronica = pgTable('convite_cronica', {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
})
