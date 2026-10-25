import { beforeEach, describe, expect, it, vi } from 'vitest'

import { iniciarCombate, type Combate, type ParticipanteInimigo } from '#/domain/combate'
import { fichaNeofito, type Ficha } from '#/domain/ficha'
import { sortearRessonancia } from '#/domain/sorteios'
import type { RessonanciaAtualPersonagem } from '#/db/schema'

// O transporte e o banco são externos; os handlers e o domínio são executados de verdade.
const memoria = vi.hoisted(() => {
  const estado: {
    combate?: Combate
    personagem?: {
      id: string
      nome: string
      donoId: string
      papelDono: string
      ficha: Ficha
      ressonanciaAtual: RessonanciaAtualPersonagem | null
    }
    usuario: { id: string; papel: 'narrador' | 'jogador' }
  } = { usuario: { id: 'jogador-1', papel: 'jogador' } }
  return estado
})

vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      validator: () => builder,
      handler: (executar: (entrada: unknown) => unknown) =>
        (entrada: { data?: unknown } = {}) => executar({
          ...entrada,
          context: { usuario: memoria.usuario },
        }),
    }
    return builder
  },
}))

vi.mock('#/server/sessao', () => ({ exigirUsuario: {}, exigirNarrador: {} }))
vi.mock('#/server/enviar-notificacao', () => ({ enviarNotificacao: async () => {} }))
vi.mock('#/db', async () => {
  const schema = await import('#/db/schema')
  return {
    db: {
      select: () => ({
        from: (tabela: unknown) => {
          const linhas = tabela === schema.combate ? [memoria.combate] : [memoria.personagem]
          const consulta = {
            innerJoin: () => consulta,
            where: () => Object.assign(Promise.resolve(linhas), { limit: async () => linhas }),
          }
          return consulta
        },
      }),
      update: (tabela: unknown) => ({
        set: (valores: object) => ({
          where: async () => Object.assign(
            tabela === schema.combate ? memoria.combate! : memoria.personagem!,
            valores,
          ),
        }),
      }),
    },
  }
})

import {
  alternarCondicaoParticipanteCombateServer,
  aplicarDanoInimigoCombateServer,
  avancarTurnoCombateServer,
} from './combate'
import { aplicarRessonanciaPersonagemServer } from './sorteios'

const inimigo: ParticipanteInimigo = {
  id: 'inimigo-1', tipo: 'inimigo', nome: 'Carniçal', categoria: 'Carniçal',
  vitalidadeMax: 6, danoVitalidade: { superficial: 0, agravado: 0 },
  vontadeMax: 4, danoVontade: { superficial: 0, agravado: 0 },
  paradas: { fisico: 4, social: 2, mental: 3, excepcionais: [] },
  especiais: [], notas: 'Tática privada do Narrador', revelarVitalidade: false, condicoes: [],
}
const participante = {
  id: 'participante-1', tipo: 'personagem' as const, nome: 'Lucas',
  personagemId: '123e4567-e89b-12d3-a456-426614174000', ehPdn: false, condicoes: [],
}

beforeEach(() => {
  memoria.usuario = { id: 'jogador-1', papel: 'jogador' }
  memoria.combate = iniciarCombate([participante, structuredClone(inimigo)])
  memoria.personagem = {
    id: participante.personagemId, nome: 'Lucas', donoId: 'jogador-1', papelDono: 'jogador',
    ficha: { ...fichaNeofito(), cla: 'brujah' }, ressonanciaAtual: null,
  }
})

describe('Ações de Combate no servidor', () => {
  it('passa o próprio turno sem enviar os dados privados dos inimigos', async () => {
    const resposta = await avancarTurnoCombateServer()
    expect(resposta).toEqual({ ok: true })
    expect(memoria.combate?.turnoAtual).toBe(1)
  })

  it('altera a própria condição sem enviar os dados privados dos inimigos', async () => {
    const resposta = await alternarCondicaoParticipanteCombateServer({
      data: { participanteId: participante.id, condicaoId: 'agarrado' },
    })
    expect(resposta).toEqual({ ok: true })
    expect(memoria.combate?.participantes[0].condicoes).toEqual(['agarrado'])
  })

  it.each(['dano', 'condicao'])('persiste o próximo turno ao incapacitar por %s', async (acao) => {
    memoria.usuario.papel = 'narrador'
    memoria.combate = iniciarCombate([structuredClone(inimigo), participante])
    if (acao === 'dano') {
      await aplicarDanoInimigoCombateServer({
        data: { participanteId: inimigo.id, tipoTrilha: 'vitalidade', dano: { superficial: 0, agravado: 6 } },
      })
    } else {
      await alternarCondicaoParticipanteCombateServer({
        data: { participanteId: inimigo.id, condicaoId: 'desacordado' },
      })
    }
    expect(memoria.combate.turnoAtual).toBe(1)
  })

  it('recusa passar o turno de outro Jogador', async () => {
    memoria.usuario.id = 'outro-jogador'
    await expect(avancarTurnoCombateServer()).rejects.toThrow('seu próprio personagem')
    expect(memoria.combate?.turnoAtual).toBe(0)
  })
})

describe('Aplicação de Ressonância no servidor', () => {
  it.each(['brujah', 'sangue-ralo'] as const)('aplica Ressonância ao clã %s com a manifestação adequada', async (cla) => {
    memoria.usuario.papel = 'narrador'
    memoria.personagem!.ficha.cla = cla
    const resultado = sortearRessonancia(() => 0, 9)
    await aplicarRessonanciaPersonagemServer({
      data: {
        personagemId: participante.personagemId,
        ressonancia: {
          tipo: resultado.tipo.nome, intensidade: resultado.intensidade.nome,
          discrasia: null, manifestacaoSangueFraco: resultado.manifestacaoSangueFraco,
        },
      },
    })
    expect(memoria.personagem!.ressonanciaAtual?.tipo).toBe('Colérico')
    expect(memoria.personagem!.ressonanciaAtual?.manifestacaoSangueFraco)
      .toEqual(cla === 'sangue-ralo' ? resultado.manifestacaoSangueFraco : null)
  })
})
