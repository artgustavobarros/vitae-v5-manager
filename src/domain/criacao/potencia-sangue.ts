import type { TipoPredador } from '../catalogo/tipos'
import type { IdadeCriacao } from '../cronica'
import type { Cla } from '../ficha'

/** Potência final da criação, incluindo o Tipo de Predador uma única vez. */
export function potenciaSangueCriacao(
  cla: Cla | null,
  idade: IdadeCriacao = 'neofito',
  predador: TipoPredador | null = null,
): number {
  if (cla === 'sangue-ralo') return 0
  return (idade === 'ancillae' ? 2 : 1) + (predador?.modificadorPotenciaSangue ?? 0)
}
