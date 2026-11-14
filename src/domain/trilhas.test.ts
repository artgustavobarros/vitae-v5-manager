import { describe, expect, it } from 'vitest'

import {
  alterarCaixaDanoNaPosicao,
  alternarCaixaDano,
  alternarFome,
  alternarMancha,
  alternarPontos,
  caixasDano,
  reconciliarCaixasDano,
  type CaixaDano,
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

describe('alterarCaixaDanoNaPosicao e reconciliarCaixasDano', () => {
  it('marca exatamente a caixa clicada no meio como superficial -> agravado -> vazio', () => {
    const inicial: CaixaDano[] = ['vazio', 'vazio', 'vazio', 'vazio', 'vazio', 'vazio']

    const passo1 = alterarCaixaDanoNaPosicao(inicial, 3, 'avancar')
    expect(passo1.caixas).toEqual(['vazio', 'vazio', 'vazio', 'superficial', 'vazio', 'vazio'])
    expect(passo1.dano).toEqual({ superficial: 1, agravado: 0 })

    // Reconciliar com o dano persistido preserva a caixa 3 marcada no meio
    expect(reconciliarCaixasDano(passo1.caixas, passo1.dano, 6)).toEqual([
      'vazio',
      'vazio',
      'vazio',
      'superficial',
      'vazio',
      'vazio',
    ])

    const passo2 = alterarCaixaDanoNaPosicao(passo1.caixas, 3, 'avancar')
    expect(passo2.caixas).toEqual(['vazio', 'vazio', 'vazio', 'agravado', 'vazio', 'vazio'])
    expect(passo2.dano).toEqual({ superficial: 0, agravado: 1 })

    const passo3 = alterarCaixaDanoNaPosicao(passo2.caixas, 3, 'avancar')
    expect(passo3.caixas).toEqual(['vazio', 'vazio', 'vazio', 'vazio', 'vazio', 'vazio'])
    expect(passo3.dano).toEqual({ superficial: 0, agravado: 0 })
  })

  it('retrocede com clique direito: agravado volta para superficial e superficial limpa para vazio', () => {
    const comAgravadoNoMeio: CaixaDano[] = ['vazio', 'vazio', 'agravado', 'vazio', 'vazio']

    const paraSuperficial = alterarCaixaDanoNaPosicao(comAgravadoNoMeio, 2, 'retroceder')
    expect(paraSuperficial.caixas).toEqual(['vazio', 'vazio', 'superficial', 'vazio', 'vazio'])
    expect(paraSuperficial.dano).toEqual({ superficial: 1, agravado: 0 })

    const paraVazio = alterarCaixaDanoNaPosicao(paraSuperficial.caixas, 2, 'retroceder')
    expect(paraVazio.caixas).toEqual(['vazio', 'vazio', 'vazio', 'vazio', 'vazio'])
    expect(paraVazio.dano).toEqual({ superficial: 0, agravado: 0 })
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

describe('alternarPontos', () => {
  it('tocar numa bolinha leva o valor até ela', () => {
    expect(alternarPontos(1, 3)).toBe(4)
  })

  it('tocar na última bolinha marcada desce um', () => {
    expect(alternarPontos(3, 2)).toBe(2)
  })

  it('não desce abaixo do mínimo', () => {
    expect(alternarPontos(1, 0, 1)).toBe(1)
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
