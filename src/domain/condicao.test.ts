import { describe, expect, it } from 'vitest'

import { condicaoDe, podeAlternarCompartilharCondicao, podeVerCondicao } from './condicao'
import { fichaNeofito } from './ficha'

const jogador = { id: 'j1', papel: 'jogador' as const }
const outroJogador = { id: 'j2', papel: 'jogador' as const }
const narrador = { id: 'n1', papel: 'narrador' as const }

describe('condicaoDe', () => {
  it('pega dano e Fome da Ficha e calcula os máximos', () => {
    const ficha = {
      ...fichaNeofito(),
      fome: 3,
      danoVitalidade: { superficial: 1, agravado: 1 },
      danoVontade: { superficial: 2, agravado: 0 },
    }
    ficha.atributos = { ...ficha.atributos, vigor: 3, autocontrole: 2, determinacao: 4 }

    expect(condicaoDe(ficha)).toEqual({
      danoVitalidade: { superficial: 1, agravado: 1 },
      danoVontade: { superficial: 2, agravado: 0 },
      fome: 3,
      vitalidadeMax: 6,
      vontadeMax: 6,
    })
  })
})

describe('podeVerCondicao', () => {
  const doJogador = { donoId: 'j1', compartilhaCondicao: false }

  it('o Narrador vê a Condição de qualquer Personagem', () => {
    expect(podeVerCondicao(narrador, doJogador)).toBe(true)
  })

  it('o Jogador só vê a Condição quando o Narrador compartilha', () => {
    expect(podeVerCondicao(jogador, doJogador)).toBe(false)
    expect(podeVerCondicao(jogador, { ...doJogador, compartilhaCondicao: true })).toBe(true)
  })

  it('outro Jogador só vê quando a Condição é compartilhada', () => {
    expect(podeVerCondicao(outroJogador, doJogador)).toBe(false)
    expect(podeVerCondicao(outroJogador, { ...doJogador, compartilhaCondicao: true })).toBe(true)
  })
})

describe('podeAlternarCompartilharCondicao', () => {
  const doJogador = { donoId: 'j1', pdn: false }
  const pdn = { donoId: 'n1', pdn: true }

  it('o Jogador não decide nem no antigo Personagem próprio', () => {
    expect(podeAlternarCompartilharCondicao(jogador, doJogador)).toBe(false)
  })

  it('outro Jogador não decide', () => {
    expect(podeAlternarCompartilharCondicao(outroJogador, doJogador)).toBe(false)
  })

  it('o Narrador decide pelo Personagem de Jogador', () => {
    expect(podeAlternarCompartilharCondicao(narrador, doJogador)).toBe(true)
  })

  it('o Narrador decide pelos PdNs, e o Jogador não', () => {
    expect(podeAlternarCompartilharCondicao(narrador, pdn)).toBe(true)
    expect(podeAlternarCompartilharCondicao(jogador, pdn)).toBe(false)
  })

  it('o Narrador decide mesmo antes de ativar o Personagem', () => {
    expect(podeAlternarCompartilharCondicao(narrador, { donoId: 'n1', pdn: false })).toBe(true)
  })
})
