import { describe, expect, it } from 'vitest'

import { condicaoDe } from './condicao'
import { fichaNeofito } from './ficha'

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
