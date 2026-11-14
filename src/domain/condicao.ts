import type { Papel } from './acesso'
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

type Usuario = { id: string; papel: Papel }

/** O Narrador vê toda Condição; Jogadores veem apenas o que foi compartilhado. */
export function podeVerCondicao(
  usuario: Usuario,
  personagem: { donoId: string; compartilhaCondicao: boolean },
): boolean {
  return usuario.papel === 'narrador' || personagem.compartilhaCondicao
}

/** Só o Narrador decide quais Condições aparecem nas visões compartilhadas. */
export function podeAlternarCompartilharCondicao(
  usuario: Usuario,
  _personagem: { donoId: string; pdn: boolean },
): boolean {
  return usuario.papel === 'narrador'
}
