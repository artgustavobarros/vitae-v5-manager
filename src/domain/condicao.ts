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

/** O Narrador vê toda Condição; o Jogador vê a dos próprios Personagens e a de quem compartilha. */
export function podeVerCondicao(
  usuario: Usuario,
  personagem: { donoId: string; compartilhaCondicao: boolean },
): boolean {
  return usuario.papel === 'narrador' || personagem.donoId === usuario.id || personagem.compartilhaCondicao
}

/** Compartilhar a Condição é decisão do Jogador no próprio Personagem; o Narrador só decide pelos PdNs. */
export function podeAlternarCompartilharCondicao(
  usuario: Usuario,
  personagem: { donoId: string; pdn: boolean },
): boolean {
  if (personagem.pdn) return usuario.papel === 'narrador'
  return usuario.papel === 'jogador' && personagem.donoId === usuario.id
}
