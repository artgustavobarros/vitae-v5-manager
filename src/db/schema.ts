import { boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import type { Ficha } from '#/domain/ficha'
import { STATUS_PERSONAGEM } from '#/domain/permissoes-ficha'

import { user } from './auth-schema.ts'

export * from './auth-schema.ts'

/** Convite para a Crônica: o link que o Narrador compartilha com a mesa; só o mais novo vale. */
export const conviteCronica = pgTable('convite_cronica', {
  id: uuid().primaryKey().defaultRandom(),
  token: text().notNull().unique(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  /** Preenchido quando o Narrador gera um link novo; o anterior para de valer. */
  substituidoEm: timestamp('substituido_em', { withTimezone: true }),
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
    /** Compartilhamento da Condição (Vitalidade + Força de Vontade + Fome) com quem divide Coterie. */
    compartilhaCondicao: boolean('compartilha_condicao').notNull().default(false),
    /** PdN fixado no Painel do Narrador. */
    fixado: boolean().notNull().default(false),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index('personagem_dono_id_idx').on(t.donoId)],
)

/**
 * Coterie: grupo de Personagens que o Narrador gerencia.
 * A Coterie Padrão nasce com a Crônica e não pode ser apagada.
 * Domínio: Caça, Abrigo e Porte (0 a 5 cada).
 */
export const coterie = pgTable('coterie', {
  id: uuid().primaryKey().defaultRandom(),
  nome: text().notNull(),
  conceito: text(),
  caca: integer().notNull().default(0),
  abrigo: integer().notNull().default(0),
  porte: integer().notNull().default(0),
  ehPadrao: boolean('eh_padrao').notNull().default(false),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

/** Associação entre Personagem e Coterie. */
export const membroCoterie = pgTable(
  'membro_coterie',
  {
    coterieId: uuid('coterie_id')
      .notNull()
      .references(() => coterie.id, { onDelete: 'cascade' }),
    personagemId: uuid('personagem_id')
      .notNull()
      .references(() => personagem.id, { onDelete: 'cascade' }),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.coterieId, t.personagemId] }),
    index('membro_coterie_personagem_id_idx').on(t.personagemId),
  ],
)

/** Convite de Coterie: proposta do Narrador para um Personagem entrar numa Coterie. */
export const conviteCoterie = pgTable(
  'convite_coterie',
  {
    id: uuid().primaryKey().defaultRandom(),
    coterieId: uuid('coterie_id')
      .notNull()
      .references(() => coterie.id, { onDelete: 'cascade' }),
    personagemId: uuid('personagem_id')
      .notNull()
      .references(() => personagem.id, { onDelete: 'cascade' }),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('convite_coterie_coterie_id_idx').on(t.coterieId),
    index('convite_coterie_personagem_id_idx').on(t.personagemId),
  ],
)

export type DestinoNotificacao = {
  to: string
  params?: Record<string, string>
  search?: Record<string, string | number | boolean>
}

/** Notificações no sino e toasts enviados via SSE. */
export const notificacao = pgTable(
  'notificacao',
  {
    id: uuid().primaryKey().defaultRandom(),
    usuarioId: text('usuario_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    texto: text().notNull(),
    linkJson: jsonb('link_json').$type<DestinoNotificacao>(),
    lida: boolean().notNull().default(false),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('notificacao_usuario_id_idx').on(t.usuarioId),
    index('notificacao_criado_em_idx').on(t.criadoEm),
  ],
)
