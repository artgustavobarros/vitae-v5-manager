import { createServerFn } from '@tanstack/react-start'
import { asc, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import {
  combate,
  personagem,
  user,
} from '#/db/schema'
import {
  adicionarParticipante,
  alternarCondicaoParticipante,
  alternarRevelarVitalidade,
  aplicarDanoInimigo,
  atualizarParticipanteInimigo,
  atualizacaoInimigoSchema,
  avancarTurno,
  definirRevelarCondicao,
  iniciarCombate,
  participanteCombateSchema,
  removerParticipante,
  reordenarParticipantes,
  voltarTurno,
  type AtualizacaoInimigo,
  type Combate,
  type ParticipanteCombate,
} from '#/domain/combate'
import type { Papel } from '#/domain/acesso'
import { ehPdN } from '#/domain/permissoes-ficha'
import { vitalidadeMax, vontadeMax } from '#/domain/ficha'
import { identificadorSchema, LIMITE_ITENS } from '#/domain/limites-entrada'
import type { Dano } from '#/domain/trilhas'
import { barramento } from '#/server/eventos'
import { exigirNarrador } from '#/server/sessao'

export type EstadoCombateNarrador = {
  id: string
  rodada: number
  turnoAtual: number
  participantes: (ParticipanteCombate & {
    condicaoPersonagem?: {
      vitalidadeMax: number
      vontadeMax: number
      danoVitalidade: Dano
      danoVontade: Dano
      fome: number
    }
  })[]
  ativo: boolean
}

export type RespostaCarregarCombate =
  | { papel: 'narrador'; combate: EstadoCombateNarrador | null }

export type PersonagemCombateOpcao = {
  id: string
  nome: string
  cla: string | null
  status: 'rascunho' | 'ativo' | 'arquivado'
  jogadorNome: string | null
  ehPdN: boolean
  ehPdn: boolean
  donoNome: string
}

export const listarPersonagensParaCombate = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async (): Promise<PersonagemCombateOpcao[]> => {
    const linhas = await db
      .select({
        id: personagem.id,
        nome: personagem.nome,
        status: personagem.status,
        tipo: personagem.tipo,
        jogadorNome: personagem.jogadorNome,
        ficha: personagem.ficha,
        donoNome: user.name,
        donoPapel: user.papel,
      })
      .from(personagem)
      .innerJoin(user, eq(personagem.donoId, user.id))
      .where(eq(personagem.status, 'ativo'))
      .orderBy(asc(personagem.nome), asc(personagem.criadoEm))

    return linhas.map((l) => {
      const pdn = ehPdN({
        papelDono: l.donoPapel as Papel, status: l.status, jogadorNome: l.jogadorNome, tipo: l.tipo,
      })
      return {
        id: l.id,
        nome: l.nome,
        cla: l.ficha.cla,
        status: l.status,
        jogadorNome: l.jogadorNome,
        donoNome: l.donoNome,
        ehPdN: pdn,
        ehPdn: pdn,
      }
    })
  })

export const carregarCombate = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async (): Promise<RespostaCarregarCombate> => {
    const [combateAtivo] = await db
      .select()
      .from(combate)
      .where(eq(combate.ativo, true))
      .limit(1)

    if (!combateAtivo) {
      return { papel: 'narrador', combate: null }
    }

    const combateEntidade: Combate = {
      id: combateAtivo.id,
      rodada: combateAtivo.rodada,
      turnoAtual: combateAtivo.turnoAtual,
      participantes: combateAtivo.participantes,
      ativo: combateAtivo.ativo,
    }

    const idsPersonagens = combateEntidade.participantes
      .filter((p) => p.tipo === 'personagem')
      .map((p) => (p as { personagemId: string }).personagemId)

    const personagensNoBanco = idsPersonagens.length > 0
      ? await db
          .select({
            id: personagem.id,
            jogadorNome: personagem.jogadorNome,
            ficha: personagem.ficha,
          })
          .from(personagem)
          .where(inArray(personagem.id, idsPersonagens))
      : []

    const mapaPersonagens = new Map(personagensNoBanco.map((p) => [p.id, p]))

    const participantesNarrador = combateEntidade.participantes.map((part) => {
      if (part.tipo === 'personagem') {
        const p = mapaPersonagens.get(part.personagemId)
        if (p) {
          return {
            ...part,
            jogadorNome: part.jogadorNome ?? p.jogadorNome ?? null,
            condicaoPersonagem: {
              vitalidadeMax: vitalidadeMax(p.ficha),
              vontadeMax: vontadeMax(p.ficha),
              danoVitalidade: p.ficha.danoVitalidade,
              danoVontade: p.ficha.danoVontade,
              fome: p.ficha.fome,
            },
          }
        }
      }
      return part
    })

    return {
      papel: 'narrador',
      combate: {
        ...combateEntidade,
        participantes: participantesNarrador,
      },
    }
  })

export const iniciarCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ participantes: z.array(participanteCombateSchema).max(LIMITE_ITENS) }))
  .handler(async ({ data }: { data: { participantes: ParticipanteCombate[] } }) => {
    // Desativa combate anterior
    await db.update(combate).set({ ativo: false }).where(eq(combate.ativo, true))

    const novo = iniciarCombate(data.participantes)
    const [salvo] = await db
      .insert(combate)
      .values({
        id: novo.id,
        rodada: novo.rodada,
        turnoAtual: novo.turnoAtual,
        participantes: novo.participantes,
        ativo: true,
      })
      .returning()

    barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
    return salvo
  })

export const encerrarCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .handler(async () => {
    await db.update(combate).set({ ativo: false }).where(eq(combate.ativo, true))
    barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
    return { ok: true }
  })

export const avancarTurnoCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .handler(async () => {
    const [combateAtivo] = await db
      .select()
      .from(combate)
      .where(eq(combate.ativo, true))
      .limit(1)

    if (!combateAtivo) throw new Error('Nenhum combate ativo')

    const atualizado = avancarTurno({
      id: combateAtivo.id,
      rodada: combateAtivo.rodada,
      turnoAtual: combateAtivo.turnoAtual,
      participantes: combateAtivo.participantes,
      ativo: combateAtivo.ativo,
    })

    await db
      .update(combate)
      .set({
        rodada: atualizado.rodada,
        turnoAtual: atualizado.turnoAtual,
      })
      .where(eq(combate.id, combateAtivo.id))

    barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
    return { ok: true }
  })

export const voltarTurnoCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .handler(async () => {
    const [combateAtivo] = await db
      .select()
      .from(combate)
      .where(eq(combate.ativo, true))
      .limit(1)

    if (!combateAtivo) throw new Error('Nenhum combate ativo')

    const atualizado = voltarTurno({
      id: combateAtivo.id,
      rodada: combateAtivo.rodada,
      turnoAtual: combateAtivo.turnoAtual,
      participantes: combateAtivo.participantes,
      ativo: combateAtivo.ativo,
    })

    await db
      .update(combate)
      .set({
        rodada: atualizado.rodada,
        turnoAtual: atualizado.turnoAtual,
      })
      .where(eq(combate.id, combateAtivo.id))

    barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
    return atualizado
  })

export const reordenarParticipantesCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ ordemIds: z.array(identificadorSchema).max(LIMITE_ITENS) }))
  .handler(async ({ data }: { data: { ordemIds: string[] } }) => {
    const [combateAtivo] = await db
      .select()
      .from(combate)
      .where(eq(combate.ativo, true))
      .limit(1)

    if (!combateAtivo) throw new Error('Nenhum combate ativo')

    const atualizado = reordenarParticipantes(
      {
        id: combateAtivo.id,
        rodada: combateAtivo.rodada,
        turnoAtual: combateAtivo.turnoAtual,
        participantes: combateAtivo.participantes,
        ativo: combateAtivo.ativo,
      },
      data.ordemIds,
    )

    await db
      .update(combate)
      .set({
        participantes: atualizado.participantes,
        turnoAtual: atualizado.turnoAtual,
      })
      .where(eq(combate.id, combateAtivo.id))

    barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
    return atualizado
  })

export const adicionarParticipanteCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ participante: participanteCombateSchema }))
  .handler(async ({ data }: { data: { participante: ParticipanteCombate } }) => {
    const [combateAtivo] = await db
      .select()
      .from(combate)
      .where(eq(combate.ativo, true))
      .limit(1)

    if (!combateAtivo) throw new Error('Nenhum combate ativo')

    const atualizado = adicionarParticipante(
      {
        id: combateAtivo.id,
        rodada: combateAtivo.rodada,
        turnoAtual: combateAtivo.turnoAtual,
        participantes: combateAtivo.participantes,
        ativo: combateAtivo.ativo,
      },
      data.participante,
    )

    await db
      .update(combate)
      .set({ participantes: atualizado.participantes })
      .where(eq(combate.id, combateAtivo.id))

    barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
    return atualizado
  })

export const removerParticipanteCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ participanteId: identificadorSchema }))
  .handler(async ({ data }: { data: { participanteId: string } }) => {
    const [combateAtivo] = await db
      .select()
      .from(combate)
      .where(eq(combate.ativo, true))
      .limit(1)

    if (!combateAtivo) throw new Error('Nenhum combate ativo')

    const atualizado = removerParticipante(
      {
        id: combateAtivo.id,
        rodada: combateAtivo.rodada,
        turnoAtual: combateAtivo.turnoAtual,
        participantes: combateAtivo.participantes,
        ativo: combateAtivo.ativo,
      },
      data.participanteId,
    )

    await db
      .update(combate)
      .set({
        participantes: atualizado.participantes,
        turnoAtual: atualizado.turnoAtual,
      })
      .where(eq(combate.id, combateAtivo.id))

    barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
    return atualizado
  })

export const aplicarDanoInimigoCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(
    z.object({
      participanteId: identificadorSchema,
      tipoTrilha: z.enum(['vitalidade', 'vontade']),
      dano: z.object({
        superficial: z.number().int().min(0),
        agravado: z.number().int().min(0),
      }),
      condicaoAdicionar: identificadorSchema.optional(),
    }),
  )
  .handler(
    async ({
      data,
    }: {
      data: {
        participanteId: string
        tipoTrilha: 'vitalidade' | 'vontade'
        dano: Dano
        condicaoAdicionar?: string
      }
    }) => {
      const [combateAtivo] = await db
        .select()
        .from(combate)
        .where(eq(combate.ativo, true))
        .limit(1)

      if (!combateAtivo) throw new Error('Nenhum combate ativo')

      const atualizado = aplicarDanoInimigo(
        {
          id: combateAtivo.id,
          rodada: combateAtivo.rodada,
          turnoAtual: combateAtivo.turnoAtual,
          participantes: combateAtivo.participantes,
          ativo: combateAtivo.ativo,
        },
        data.participanteId,
        data.tipoTrilha,
        data.dano,
        data.condicaoAdicionar,
      )

      await db
        .update(combate)
        .set({ participantes: atualizado.participantes, turnoAtual: atualizado.turnoAtual })
        .where(eq(combate.id, combateAtivo.id))

      barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
      return atualizado
    },
  )

export const alternarRevelarVitalidadeCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(
    z.object({
      participanteId: identificadorSchema,
      revelar: z.boolean().optional(),
    }),
  )
  .handler(
    async ({
      data,
    }: {
      data: {
        participanteId: string
        revelar?: boolean
      }
    }) => {
      const [combateAtivo] = await db
        .select()
        .from(combate)
        .where(eq(combate.ativo, true))
        .limit(1)

      if (!combateAtivo) throw new Error('Nenhum combate ativo')

      const atualizado = alternarRevelarVitalidade(
        {
          id: combateAtivo.id,
          rodada: combateAtivo.rodada,
          turnoAtual: combateAtivo.turnoAtual,
          participantes: combateAtivo.participantes,
          ativo: combateAtivo.ativo,
        },
        data.participanteId,
        data.revelar,
      )

      await db
        .update(combate)
        .set({ participantes: atualizado.participantes })
        .where(eq(combate.id, combateAtivo.id))

      barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
      return atualizado
    },
  )

export const definirRevelarCondicaoCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ participanteId: identificadorSchema, revelar: z.boolean() }))
  .handler(async ({ data }) => {
    await db.transaction(async (tx) => {
      const [ativo] = await tx.select().from(combate).where(eq(combate.ativo, true)).for('update').limit(1)
      if (!ativo) throw new Error('Nenhum combate ativo')
      const atualizado = definirRevelarCondicao(ativo, data.participanteId, data.revelar)
      await tx.update(combate).set({ participantes: atualizado.participantes }).where(eq(combate.id, ativo.id))
    })
    barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
    return { ok: true }
  })

export const atualizarParticipanteInimigoServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(
    z.object({
      participanteId: identificadorSchema,
      atualizacao: atualizacaoInimigoSchema,
    }),
  )
  .handler(
    async ({
      data,
    }: {
      data: {
        participanteId: string
        atualizacao: AtualizacaoInimigo
      }
    }) => {
      const [combateAtivo] = await db
        .select()
        .from(combate)
        .where(eq(combate.ativo, true))
        .limit(1)

      if (!combateAtivo) throw new Error('Nenhum combate ativo')

      const atualizado = atualizarParticipanteInimigo(
        {
          id: combateAtivo.id,
          rodada: combateAtivo.rodada,
          turnoAtual: combateAtivo.turnoAtual,
          participantes: combateAtivo.participantes,
          ativo: combateAtivo.ativo,
        },
        data.participanteId,
        data.atualizacao,
      )

      await db
        .update(combate)
        .set({ participantes: atualizado.participantes })
        .where(eq(combate.id, combateAtivo.id))

      barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
      return atualizado
    },
  )

export const alternarCondicaoParticipanteCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(
    z.object({
      participanteId: identificadorSchema,
      condicaoId: identificadorSchema,
    }),
  )
  .handler(async ({ data }) => {
    const [combateAtivo] = await db
      .select()
      .from(combate)
      .where(eq(combate.ativo, true))
      .limit(1)

    if (!combateAtivo) throw new Error('Nenhum combate ativo')

    const participante = combateAtivo.participantes.find((p) => p.id === data.participanteId)
    if (!participante) throw new Error('Participante não encontrado no combate')

    const atualizado = alternarCondicaoParticipante(
      {
        id: combateAtivo.id,
        rodada: combateAtivo.rodada,
        turnoAtual: combateAtivo.turnoAtual,
        participantes: combateAtivo.participantes,
        ativo: combateAtivo.ativo,
      },
      data.participanteId,
      data.condicaoId,
    )

    await db
      .update(combate)
      .set({ participantes: atualizado.participantes, turnoAtual: atualizado.turnoAtual })
      .where(eq(combate.id, combateAtivo.id))

    barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
    return { ok: true }
  })
