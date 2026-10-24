import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import type { Ficha } from '#/domain/ficha'
import { STATUS_PERSONAGEM } from '#/domain/permissoes-ficha'

import { user } from './auth-schema.ts'

export * from './auth-schema.ts'

/** Convite para a Crônica: link de uso único; `usadoEm` e `usadoPor` marcam o cadastro que o consumiu. */
export const conviteCronica = pgTable('convite_cronica', {
  id: uuid().primaryKey().defaultRandom(),
  token: text().notNull().unique(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  usadoEm: timestamp('usado_em', { withTimezone: true }),
  usadoPor: text('usado_por').references(() => user.id, { onDelete: 'set null' }),
})

export const statusPersonagem = pgEnum('status_personagem', STATUS_PERSONAGEM)

/**
 * Personagem da Crônica. O dono é o Jogador ou, se for PdN, o Narrador.
 * A Ficha fica em JSONB, validada por `fichaSchema` em `src/domain/ficha.ts`.
 */
export const personagem = pgTable(
  'personagem',
  {
    id: uuid().primaryKey().defaultRandom(),
    donoId: text('dono_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    status: statusPersonagem().notNull().default('rascunho'),
    /** Personagem atribuído: o Jogador que ainda vai aceitar ou recusar o Rascunho do Narrador. */
    atribuidoA: text('atribuido_a').references(() => user.id, { onDelete: 'set null' }),
    nome: text().notNull().default(''),
    ficha: jsonb().$type<Ficha>().notNull(),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index('personagem_dono_id_idx').on(t.donoId)],
)
