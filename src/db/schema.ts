import { boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import type { EspecialAntagonista, ParadaExcepcional } from '#/domain/bestiario'
import type { ParticipanteCombate } from '#/domain/combate'
import type { EscolhaVantagem, Ficha } from '#/domain/ficha'
import type { ParadaPersonalizada } from '#/domain/paradas'
import { OPCOES_CRIACAO_CRONICA_PADRAO, type OpcoesCriacaoCronica } from '#/domain/cronica'
import { STATUS_PERSONAGEM } from '#/domain/permissoes-ficha'
import type { AlteracaoMarcas, ResultadoMarcacao } from '#/domain/sincronizacao-marcas'

import { user } from './auth-schema.ts'

export * from './auth-schema.ts'
export type { OpcoesCriacaoCronica } from '#/domain/cronica'

export type RessonanciaAtualPersonagem = {
  tipo: string
  intensidade: string
  discrasia?: { nome: string; descricao: string } | null
  manifestacaoSangueFraco?: {
    disciplinaId?: string
    disciplinaNome: string
    nivel: number
    poderes: Array<{ id?: string; nome: string; nivel: number; descricao: string }>
  } | null
}

export type CompulsaoAtivaPersonagem = {
  tipo: 'geral' | 'cla'
  nome: string
  descricao: string
}

/** Configurações da Crônica gerenciadas pelo Narrador (ex.: regras de criação da mesa). */
export const cronica = pgTable('cronica', {
  id: uuid().primaryKey().defaultRandom(),
  nome: text().notNull().default('Crônica'),
  opcoesCriacao: jsonb('opcoes_criacao')
    .$type<OpcoesCriacaoCronica>()
    .notNull()
    .default(OPCOES_CRIACAO_CRONICA_PADRAO),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

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
    /** Incrementada pelo banco sempre que a Ficha muda, inclusive nas ações sem fila. */
    revisaoMarcas: integer('revisao_marcas').notNull().default(0),
    /** Compartilhamento da Condição (Vitalidade + Força de Vontade + Fome) com quem divide Coterie. */
    compartilhaCondicao: boolean('compartilha_condicao').notNull().default(false),
    /** Ressonância Atual aplicada pelo Narrador a partir de um Sorteio. */
    ressonanciaAtual: jsonb('ressonancia_atual').$type<RessonanciaAtualPersonagem | null>(),
    /** Compulsão Ativa aplicada pelo Narrador que vale até ele encerrar. */
    compulsaoAtiva: jsonb('compulsao_ativa').$type<CompulsaoAtivaPersonagem | null>(),
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

/** Recibo da marcação: uma operação só altera a Ficha e gera notificações uma vez. */
export const operacaoMarcacao = pgTable('operacao_marcacao', {
  usuarioId: text('usuario_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  operacaoId: uuid('operacao_id').notNull(),
  personagemId: uuid('personagem_id').notNull().references(() => personagem.id, { onDelete: 'cascade' }),
  entrada: jsonb().$type<AlteracaoMarcas>().notNull(),
  resultado: jsonb().$type<ResultadoMarcacao>().notNull(),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.usuarioId, t.operacaoId] })])

/** Definições de Paradas compartilhadas pela mesa; os valores vêm da Ficha selecionada. */
export const paradaCompartilhada = pgTable('parada_compartilhada', {
  id: uuid().primaryKey().defaultRandom(),
  nome: text().notNull(),
  atributo: text().$type<ParadaPersonalizada['atributo']>().notNull(),
  habilidade: text().$type<ParadaPersonalizada['habilidade']>().notNull(),
  criadoPorId: text('criado_por_id').references(() => user.id, { onDelete: 'set null' }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [index('parada_compartilhada_criado_por_id_idx').on(t.criadoPorId)])

/** A ordem é pessoal, independente do Personagem que o usuário estiver consultando. */
export const preferenciaParadas = pgTable('preferencia_paradas', {
  usuarioId: text('usuario_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  ordem: jsonb().$type<string[]>().notNull().default([]),
})

/**
 * Coterie: grupo de Personagens que o Narrador gerencia.
 * A Coterie Padrão nasce com a Crônica e não pode ser apagada.
 * Domínio: Caça, Abrigo e Porte (0 a 5 cada). Tipo, Vantagens e Defeitos vêm do Catálogo, por id.
 */
export const coterie = pgTable('coterie', {
  id: uuid().primaryKey().defaultRandom(),
  nome: text().notNull(),
  conceito: text(),
  caca: integer().notNull().default(0),
  abrigo: integer().notNull().default(0),
  porte: integer().notNull().default(0),
  /** Tipo de Coterie (id do Catálogo), opcional e só descritivo. */
  tipo: text(),
  vantagens: jsonb().$type<EscolhaVantagem[]>().notNull().default([]),
  defeitos: jsonb().$type<EscolhaVantagem[]>().notNull().default([]),
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

export const statusRevisao = pgEnum('status_revisao', ['aprovado', 'sugerido'])

/**
 * Histórico da revisão de tradução do Catálogo, mantido para preservar decisões já gravadas.
 */
export const revisaoTraducao = pgTable(
  'revisao_traducao',
  {
    id: uuid().primaryKey().defaultRandom(),
    /** Id do item no Catálogo ou do termo da consulta rápida. */
    itemId: text('item_id').notNull(),
    status: statusRevisao().notNull(),
    sugestaoNome: text('sugestao_nome'),
    sugestaoDescricao: text('sugestao_descricao'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('revisao_traducao_item_id_idx').on(t.itemId)],
)

/**
 * Modelos de antagonistas do Bestiário privado do Narrador.
 * Ficha simplificada de V5: paradas, Vitalidade, Força de Vontade, paradas excepcionais, disciplinas e notas.
 */
export const modeloAntagonista = pgTable('modelo_antagonista', {
  id: uuid().primaryKey().defaultRandom(),
  nome: text().notNull(),
  categoria: text().notNull().default('Geral'),
  paradaFisico: integer('parada_fisico').notNull().default(1),
  paradaSocial: integer('parada_social').notNull().default(1),
  paradaMental: integer('parada_mental').notNull().default(1),
  vitalidade: integer().notNull().default(3),
  vontade: integer().notNull().default(3),
  paradasExcepcionais: jsonb('paradas_excepcionais')
    .$type<ParadaExcepcional[]>()
    .notNull()
    .default([]),
  especiais: jsonb('especiais')
    .$type<EspecialAntagonista[]>()
    .notNull()
    .default([]),
  notas: text().notNull().default(''),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

/**
 * Gerenciador de Combate: apenas 1 combate ativo por vez na Crônica.
 * Descartável ao encerrar (ou marcado inativo).
 */
export const combate = pgTable('combate', {
  id: uuid().primaryKey().defaultRandom(),
  rodada: integer().notNull().default(1),
  turnoAtual: integer('turno_atual').notNull().default(0),
  participantes: jsonb().$type<ParticipanteCombate[]>().notNull().default([]),
  ativo: boolean().notNull().default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})
