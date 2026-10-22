import { describe, expect, it } from 'vitest'

import {
  alternarCaixaDano,
  alternarFome,
  alternarMancha,
  caixasDano,
  type Dano,
} from './trilhas'

describe('caixasDano', () => {
  it('desenha agravado primeiro, depois superficial, depois vazio', () => {
    expect(caixasDano({ superficial: 2, agravado: 1 }, 6)).toEqual([
      'agravado',
      'superficial',
      'superficial',
      'vazio',
      'vazio',
      'vazio',
    ])
  })

  it('nunca desenha mais caixas que o máximo', () => {
    expect(caixasDano({ superficial: 5, agravado: 3 }, 6)).toHaveLength(6)
  })
})

describe('alternarCaixaDano', () => {
  const sem: Dano = { superficial: 0, agravado: 0 }

  it('caixa vazia vira superficial', () => {
    expect(alternarCaixaDano(sem, 6, 3)).toEqual({ superficial: 1, agravado: 0 })
  })

  it('caixa superficial vira agravado', () => {
    expect(alternarCaixaDano({ superficial: 2, agravado: 0 }, 6, 1)).toEqual({
      superficial: 1,
      agravado: 1,
    })
  })

  it('caixa agravada volta a vazia', () => {
    expect(alternarCaixaDano({ superficial: 1, agravado: 1 }, 6, 0)).toEqual({
      superficial: 1,
      agravado: 0,
    })
  })

  it('trilha cheia de agravado não aceita mais dano numa caixa vazia', () => {
    expect(alternarCaixaDano({ superficial: 0, agravado: 6 }, 6, 5)).toEqual({
      superficial: 0,
      agravado: 5,
    })
  })
})

describe('alternarFome', () => {
  it('tocar numa bolinha acima do valor sobe a Fome até ela', () => {
    expect(alternarFome(1, 3)).toBe(4)
  })

  it('tocar na última bolinha marcada desmarca só ela', () => {
    expect(alternarFome(3, 2)).toBe(2)
  })

  it('tocar numa bolinha abaixo do valor desce até ela', () => {
    expect(alternarFome(4, 1)).toBe(2)
  })
})

describe('alternarMancha', () => {
  it('marca uma Mancha nas caixas acima da Humanidade', () => {
    expect(alternarMancha({ humanidade: 7, manchas: 0 }, 9)).toEqual({ humanidade: 7, manchas: 1 })
  })

  it('tocar numa Mancha marcada remove uma', () => {
    expect(alternarMancha({ humanidade: 7, manchas: 2 }, 9)).toEqual({ humanidade: 7, manchas: 1 })
  })

  it('não mexe nas caixas de Humanidade', () => {
    expect(alternarMancha({ humanidade: 7, manchas: 1 }, 3)).toEqual({ humanidade: 7, manchas: 1 })
  })

  it('não passa do espaço livre acima da Humanidade', () => {
    expect(alternarMancha({ humanidade: 9, manchas: 1 }, 9)).toEqual({ humanidade: 9, manchas: 0 })
  })
})
