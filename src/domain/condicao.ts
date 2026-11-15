import { vitalidadeMax, vontadeMax, type Ficha } from './ficha'
import type { Dano } from './trilhas'

/** Condição: Vitalidade, Força de Vontade e Fome de um Personagem, com os máximos já calculados. */
export type Condicao = {
  danoVitalidade: Dano
  danoVontade: Dano
  fome: number
  vitalidadeMax: number
  vontadeMax: number
}

export function condicaoDe(ficha: Ficha): Condicao {
  return {
    danoVitalidade: ficha.danoVitalidade,
    danoVontade: ficha.danoVontade,
    fome: ficha.fome,
    vitalidadeMax: vitalidadeMax(ficha),
    vontadeMax: vontadeMax(ficha),
  }
}
