import { describe, expect, it } from 'vitest'

import { tipoPredador } from '../catalogo'
import { potenciaSangueCriacao } from './potencia-sangue'

describe('Potência do Sangue na criação', () => {
  it.each([
    ['sangue-ralo', 'neofito', null, 0],
    ['sangue-ralo', 'ancillae', 'tipo-predador-sanguessuga', 0],
    ['brujah', 'neofito', null, 1],
    ['brujah', 'neonato', null, 1],
    ['brujah', 'ancillae', null, 2],
    ['brujah', 'neofito', 'tipo-predador-sanguessuga', 2],
    ['brujah', 'ancillae', 'tipo-predador-sanguessuga', 3],
  ] as const)('%s, %s, %s resulta em Potência %i', (cla, idade, predadorId, esperada) => {
    expect(potenciaSangueCriacao(cla, idade, predadorId ? tipoPredador(predadorId) : null)).toBe(esperada)
  })
})
