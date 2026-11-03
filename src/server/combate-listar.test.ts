import { describe, expect, it, vi } from 'vitest'

const dadosBanco = vi.hoisted(() => ({
  linhas: [
    {
      id: 'p1',
      nome: 'Helena',
      status: 'ativo' as const,
      atribuidoA: null,
      jogadorNome: null,
      ficha: { cla: 'toreador' },
      donoNome: 'Jogador 1',
      donoPapel: 'jogador',
    },
    {
      id: 'p2',
      nome: 'Geovane',
      status: 'ativo' as const,
      atribuidoA: null,
      jogadorNome: 'Geovane',
      ficha: { cla: 'sangue-ralo' },
      donoNome: 'Narrador',
      donoPapel: 'narrador',
    },
    {
      id: 'p3',
      nome: 'Rodolfo',
      status: 'rascunho' as const,
      atribuidoA: 'jogador-1',
      jogadorNome: null,
      ficha: { cla: 'sangue-ralo' },
      donoNome: 'Narrador',
      donoPapel: 'narrador',
    },
    {
      id: 'p4',
      nome: 'Vilão PdN',
      status: 'ativo' as const,
      atribuidoA: null,
      jogadorNome: null,
      ficha: { cla: 'lasombra' },
      donoNome: 'Narrador',
      donoPapel: 'narrador',
    },
  ],
}))

vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      validator: () => builder,
      handler: (executar: () => unknown) => () => executar(),
    }
    return builder
  },
}))

vi.mock('#/server/sessao', () => ({ exigirUsuario: {}, exigirNarrador: {} }))
vi.mock('#/server/enviar-notificacao', () => ({ enviarNotificacao: async () => {} }))
vi.mock('#/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            orderBy: async () => dadosBanco.linhas,
          }),
        }),
      }),
    }),
  },
}))

import { listarPersonagensParaCombate } from './combate'

describe('listarPersonagensParaCombate', () => {
  it('retorna personagens ativos e rascunhos do narrador com identificação correta', async () => {
    const resultado = await listarPersonagensParaCombate()

    expect(resultado).toHaveLength(4)
    expect(resultado).toEqual([
      {
        id: 'p1',
        nome: 'Helena',
        cla: 'toreador',
        status: 'ativo',
        atribuidoA: null,
        jogadorNome: null,
        donoNome: 'Jogador 1',
        ehPdN: false,
        ehPdn: false,
      },
      {
        id: 'p2',
        nome: 'Geovane',
        cla: 'sangue-ralo',
        status: 'ativo',
        atribuidoA: null,
        jogadorNome: 'Geovane',
        donoNome: 'Narrador',
        ehPdN: false,
        ehPdn: false,
      },
      {
        id: 'p3',
        nome: 'Rodolfo',
        cla: 'sangue-ralo',
        status: 'rascunho',
        atribuidoA: 'jogador-1',
        jogadorNome: null,
        donoNome: 'Narrador',
        ehPdN: false,
        ehPdn: false,
      },
      {
        id: 'p4',
        nome: 'Vilão PdN',
        cla: 'lasombra',
        status: 'ativo',
        atribuidoA: null,
        jogadorNome: null,
        donoNome: 'Narrador',
        ehPdN: true,
        ehPdn: true,
      },
    ])
  })
})
