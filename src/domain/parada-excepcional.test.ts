import { describe, expect, it } from 'vitest'

import { separarEspecialidadeParada } from './parada-excepcional'

describe('especialidade na apresentação da Parada Excepcional', () => {
  it.each([
    ['Briga (Golpe Espectral; após liberação)', { nome: 'Briga', especialidade: 'Golpe Espectral; após liberação' }],
    ['Armas de Fogo (Submetralhadora)', { nome: 'Armas de Fogo', especialidade: 'Submetralhadora' }],
    ['  Sagacidade ( Ponto Fraco )  ', { nome: 'Sagacidade', especialidade: 'Ponto Fraco' }],
    ['Intimidação', { nome: 'Intimidação', especialidade: null }],
    ['Briga (Golpe Espectral', { nome: 'Briga (Golpe Espectral', especialidade: null }],
    ['Briga ()', { nome: 'Briga ()', especialidade: null }],
    ['Briga (Golpe (Espectral))', { nome: 'Briga (Golpe (Espectral))', especialidade: null }],
  ])('apresenta %s sem perder informações', (entrada, esperado) => {
    expect(separarEspecialidadeParada(entrada)).toEqual(esperado)
  })
})
