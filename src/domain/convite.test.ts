import { describe, expect, it } from 'vitest'

import { estadoConvite, podeRemoverJogador } from './convite'

describe('estadoConvite', () => {
  it('link que não existe é inexistente', () => {
    expect(estadoConvite(undefined)).toBe('inexistente')
  })

  it('o link atual da Crônica vale para quantas pessoas o Narrador quiser', () => {
    expect(estadoConvite({ substituidoEm: null })).toBe('valido')
  })

  it('gerar um link novo faz o anterior parar de valer', () => {
    expect(estadoConvite({ substituidoEm: new Date('2026-10-24T21:00:00') })).toBe('substituido')
  })
})

describe('podeRemoverJogador', () => {
  it('só o Narrador remove, e só Jogadores', () => {
    expect(podeRemoverJogador({ papel: 'narrador' }, { papel: 'jogador' })).toBe(true)
    expect(podeRemoverJogador({ papel: 'narrador' }, { papel: 'narrador' })).toBe(false)
    expect(podeRemoverJogador({ papel: 'jogador' }, { papel: 'jogador' })).toBe(false)
  })
})
