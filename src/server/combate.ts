import { createServerFn } from '@tanstack/react-start'
import { eq, inArray } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import {
  combate,
  membroCoterie,
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
  filtrarCombateParaJogador,
  iniciarCombate,
  participanteCombateSchema,
  removerParticipante,
  reordenarParticipantes,
  voltarTurno,
  type AtualizacaoInimigo,
  type Combate,
  type CombateVisivel,
  type InfoVisibilidadeJogador,
  type ParticipanteCombate,
} from '#/domain/combate'
import { vitalidadeMax, vontadeMax } from '#/domain/ficha'
import { notificacoesEventos } from '#/domain/notificacoes'
import type { Dano } from '#/domain/trilhas'
import { enviarNotificacao } from '#/server/enviar-notificacao'
import { barramento } from '#/server/eventos'
import { exigirNarrador, exigirUsuario } from '#/server/sessao'

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
      compartilhaCondicao: boolean
    }
  })[]
  ativo: boolean
}

export type RespostaCarregarCombate =
  | { papel: 'narrador'; combate: EstadoCombateNarrador | null }
  | { papel: 'jogador'; combate: CombateVisivel | null }

export const carregarCombate = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .handler(async ({ context }): Promise<RespostaCarregarCombate> => {
    const usuario = context.usuario

    const [combateAtivo] = await db
      .select()
      .from(combate)
      .where(eq(combate.ativo, true))
      .limit(1)

    if (!combateAtivo) {
      return usuario.papel === 'narrador'
        ? { papel: 'narrador', combate: null }
        : { papel: 'jogador', combate: null }
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
            donoId: personagem.donoId,
            ficha: personagem.ficha,
            compartilhaCondicao: personagem.compartilhaCondicao,
          })
          .from(personagem)
          .where(inArray(personagem.id, idsPersonagens))
      : []

    if (usuario.papel === 'narrador') {
      const mapaPersonagens = new Map(personagensNoBanco.map((p) => [p.id, p]))

      const participantesNarrador = combateEntidade.participantes.map((part) => {
        if (part.tipo === 'personagem') {
          const p = mapaPersonagens.get(part.personagemId)
          if (p) {
            return {
              ...part,
              condicaoPersonagem: {
                vitalidadeMax: vitalidadeMax(p.ficha),
                vontadeMax: vontadeMax(p.ficha),
                danoVitalidade: p.ficha.danoVitalidade,
                danoVontade: p.ficha.danoVontade,
                fome: p.ficha.fome,
                compartilhaCondicao: p.compartilhaCondicao,
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
    }

    // Papel Jogador
    // Buscar personagens do usuário
    const meusPersonagens = await db
      .select({ id: personagem.id })
      .from(personagem)
      .where(eq(personagem.donoId, usuario.id))
    const meusPersonagemIds = meusPersonagens.map((p) => p.id)

    // Buscar coteries onde o usuário tem personagem
    const coteriesDoUsuario = meusPersonagemIds.length > 0
      ? await db
          .select({ coterieId: membroCoterie.coterieId })
          .from(membroCoterie)
          .where(inArray(membroCoterie.personagemId, meusPersonagemIds))
      : []
    const coterieIdsDoJogador = coteriesDoUsuario.map((c) => c.coterieId)

    // Buscar coteries de cada personagem no combate
    const coteriesDosPersonagensNoCombate = idsPersonagens.length > 0
      ? await db
          .select({
            personagemId: membroCoterie.personagemId,
            coterieId: membroCoterie.coterieId,
          })
          .from(membroCoterie)
          .where(inArray(membroCoterie.personagemId, idsPersonagens))
      : []

    const coteriesPorPersonagem: Record<string, string[]> = {}
    for (const c of coteriesDosPersonagensNoCombate) {
      if (!coteriesPorPersonagem[c.personagemId]) {
        coteriesPorPersonagem[c.personagemId] = []
      }
      coteriesPorPersonagem[c.personagemId].push(c.coterieId)
    }

    const condicoesPersonagens: InfoVisibilidadeJogador['condicoesPersonagens'] = {}
    for (const p of personagensNoBanco) {
      condicoesPersonagens[p.id] = {
        compartilhaCondicao: p.compartilhaCondicao,
        vitalidadeMax: vitalidadeMax(p.ficha),
        vontadeMax: vontadeMax(p.ficha),
        danoVitalidade: p.ficha.danoVitalidade,
        danoVontade: p.ficha.danoVontade,
        fome: p.ficha.fome,
      }
    }

    const combateVisivel = filtrarCombateParaJogador(combateEntidade, {
      jogadorId: usuario.id,
      meusPersonagemIds,
      coterieIdsDoJogador,
      coteriesPorPersonagem,
      condicoesPersonagens,
    })

    return {
      papel: 'jogador',
      combate: combateVisivel,
    }
  })

export const iniciarCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ participantes: z.array(participanteCombateSchema) }))
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

    // Notificar jogadores cujos personagens estão no combate
    const idsPersonagens = novo.participantes
      .filter((p) => p.tipo === 'personagem')
      .map((p) => (p as { personagemId: string }).personagemId)

    if (idsPersonagens.length > 0) {
      const donosJogadores = await db
        .select({
          personagemId: personagem.id,
          nomePersonagem: personagem.nome,
          donoId: personagem.donoId,
          papel: user.papel,
        })
        .from(personagem)
        .innerJoin(user, eq(personagem.donoId, user.id))
        .where(inArray(personagem.id, idsPersonagens))

      for (const pj of donosJogadores) {
        if (pj.papel === 'jogador') {
          const evento = notificacoesEventos.combateIniciado(pj.nomePersonagem)
          await enviarNotificacao({
            usuarioId: pj.donoId,
            texto: evento.texto,
            destino: evento.destino,
          })
        }
      }
    }

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
  .middleware([exigirUsuario])
  .handler(async ({ context }) => {
    const usuario = context.usuario

    const [combateAtivo] = await db
      .select()
      .from(combate)
      .where(eq(combate.ativo, true))
      .limit(1)

    if (!combateAtivo) throw new Error('Nenhum combate ativo')

    // Se for jogador, só pode passar o turno se for a vez do seu próprio personagem
    if (usuario.papel === 'jogador') {
      const participanteAtual = combateAtivo.participantes[combateAtivo.turnoAtual]
      if (!participanteAtual || participanteAtual.tipo !== 'personagem') {
        throw new Error('Apenas o Narrador pode passar o turno de inimigos')
      }

      const [pj] = await db
        .select({ id: personagem.id, donoId: personagem.donoId })
        .from(personagem)
        .where(eq(personagem.id, participanteAtual.personagemId))
        .limit(1)

      if (!pj || pj.donoId !== usuario.id) {
        throw new Error('Você só pode passar o turno quando for a vez do seu próprio personagem')
      }
    }

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
    return atualizado
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
  .validator(z.object({ ordemIds: z.array(z.string()) }))
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

    if (data.participante.tipo === 'personagem') {
      const [p] = await db
        .select({
          nome: personagem.nome,
          donoId: personagem.donoId,
          papel: user.papel,
        })
        .from(personagem)
        .innerJoin(user, eq(personagem.donoId, user.id))
        .where(eq(personagem.id, data.participante.personagemId))

      if (p && p.papel === 'jogador') {
        const evento = notificacoesEventos.combateIniciado(p.nome)
        await enviarNotificacao({
          usuarioId: p.donoId,
          texto: evento.texto,
          destino: evento.destino,
        })
      }
    }

    barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
    return atualizado
  })

export const removerParticipanteCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ participanteId: z.string() }))
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
      participanteId: z.string(),
      tipoTrilha: z.enum(['vitalidade', 'vontade']),
      dano: z.object({
        superficial: z.number().int().min(0),
        agravado: z.number().int().min(0),
      }),
      condicaoAdicionar: z.string().optional(),
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
        .set({ participantes: atualizado.participantes })
        .where(eq(combate.id, combateAtivo.id))

      barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
      return atualizado
    },
  )

export const alternarRevelarVitalidadeCombateServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(
    z.object({
      participanteId: z.string(),
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

export const atualizarParticipanteInimigoServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(
    z.object({
      participanteId: z.string(),
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
  .middleware([exigirUsuario])
  .validator(
    z.object({
      participanteId: z.string(),
      condicaoId: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    const usuario = context.usuario

    const [combateAtivo] = await db
      .select()
      .from(combate)
      .where(eq(combate.ativo, true))
      .limit(1)

    if (!combateAtivo) throw new Error('Nenhum combate ativo')

    const participante = combateAtivo.participantes.find((p) => p.id === data.participanteId)
    if (!participante) throw new Error('Participante não encontrado no combate')

    if (usuario.papel === 'jogador') {
      if (participante.tipo !== 'personagem') {
        throw new Error('Jogadores só podem alterar condições do seu próprio personagem')
      }

      const [pj] = await db
        .select({ id: personagem.id, donoId: personagem.donoId })
        .from(personagem)
        .where(eq(personagem.id, participante.personagemId))
        .limit(1)

      if (!pj || pj.donoId !== usuario.id) {
        throw new Error('Você só pode alterar condições do seu próprio personagem')
      }
    }

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
      .set({ participantes: atualizado.participantes })
      .where(eq(combate.id, combateAtivo.id))

    barramento.emitir({ tipo: 'mudanca', escopo: 'combate' })
    return atualizado
  })
