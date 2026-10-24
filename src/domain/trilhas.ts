/**
 * Trilhas da Ficha que o Jogador marca durante a sessão.
 * Segue a ficha oficial do V5: "/" é dano superficial, "X" é dano agravado,
 * e as Manchas ocupam as caixas de Humanidade a partir da direita.
 */

export type Dano = { superficial: number; agravado: number }
export type CaixaDano = 'vazio' | 'superficial' | 'agravado'
export type TrilhaHumanidade = { humanidade: number; manchas: number }

export const TOTAL_HUMANIDADE = 10
export const MAX_FOME = 5

export function caixasDano(dano: Dano, max: number): CaixaDano[] {
  const agravado = Math.min(dano.agravado, max)
  const superficial = Math.min(dano.superficial, max - agravado)
  return Array.from({ length: max }, (_, i) =>
    i < agravado ? 'agravado' : i < agravado + superficial ? 'superficial' : 'vazio',
  )
}

/** Um toque numa caixa: vazio → superficial → agravado → vazio. */
export function alternarCaixaDano(dano: Dano, max: number, indice: number): Dano {
  const caixa = caixasDano(dano, max)[indice]
  if (caixa === 'vazio') return { ...dano, superficial: dano.superficial + 1 }
  if (caixa === 'superficial') {
    return { superficial: dano.superficial - 1, agravado: dano.agravado + 1 }
  }
  return { ...dano, agravado: Math.min(dano.agravado, max) - 1 }
}

/** Tocar numa bolinha leva o valor até ela; tocar na última marcada desmarca só ela. */
export function alternarPontos(atual: number, indice: number, min = 0): number {
  const alvo = indice + 1
  return Math.max(min, alvo === atual ? atual - 1 : alvo)
}

/** Tocar numa bolinha leva a Fome até ela; tocar na última marcada desmarca só ela. */
export function alternarFome(atual: number, indice: number): number {
  return alternarPontos(atual, indice)
}

export function ehMancha(trilha: TrilhaHumanidade, indice: number): boolean {
  return indice >= TOTAL_HUMANIDADE - trilha.manchas
}

/** Só as caixas acima da Humanidade recebem Mancha; tocar numa Mancha remove uma. */
export function alternarMancha(trilha: TrilhaHumanidade, indice: number): TrilhaHumanidade {
  if (ehMancha(trilha, indice)) return { ...trilha, manchas: trilha.manchas - 1 }
  if (indice < trilha.humanidade) return trilha
  const espaco = TOTAL_HUMANIDADE - trilha.humanidade
  return { ...trilha, manchas: Math.min(trilha.manchas + 1, espaco) }
}
