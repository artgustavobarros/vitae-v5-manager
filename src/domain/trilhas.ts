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
export function avancarEstadoCaixa(estado: CaixaDano): CaixaDano {
  if (estado === 'vazio') return 'superficial'
  if (estado === 'superficial') return 'agravado'
  return 'vazio'
}

/** Clique direito numa caixa: agravado → superficial → vazio. */
export function retrocederEstadoCaixa(estado: CaixaDano): CaixaDano {
  if (estado === 'agravado') return 'superficial'
  return 'vazio'
}

export function contarCaixasDano(caixas: readonly CaixaDano[]): Dano {
  let superficial = 0
  let agravado = 0
  for (const caixa of caixas) {
    if (caixa === 'superficial') superficial += 1
    else if (caixa === 'agravado') agravado += 1
  }
  return { superficial, agravado }
}

/**
 * Preserva a posição exata das caixas clicadas enquanto o total de dano superficial
 * e agravado continuar compatível com `dano` e `max`.
 */
export function reconciliarCaixasDano(
  atual: readonly CaixaDano[],
  dano: Dano,
  max: number,
): CaixaDano[] {
  const agravadoEsperado = Math.min(Math.max(0, dano.agravado), max)
  const superficialEsperado = Math.min(
    Math.max(0, dano.superficial),
    max - agravadoEsperado,
  )
  if (atual.length === max) {
    const contagem = contarCaixasDano(atual)
    if (
      contagem.agravado === agravadoEsperado &&
      contagem.superficial === superficialEsperado
    ) {
      return [...atual]
    }
  }
  return caixasDano(dano, max)
}

export function alterarCaixaDanoNaPosicao(
  caixas: readonly CaixaDano[],
  indice: number,
  direcao: 'avancar' | 'retroceder' = 'avancar',
): { caixas: CaixaDano[]; dano: Dano } {
  const estadoAtual = caixas[indice]
  if (!estadoAtual) {
    return { caixas: [...caixas], dano: contarCaixasDano(caixas) }
  }
  const proximoEstado =
    direcao === 'avancar'
      ? avancarEstadoCaixa(estadoAtual)
      : retrocederEstadoCaixa(estadoAtual)
  const novasCaixas = caixas.map((caixa, i) => (i === indice ? proximoEstado : caixa))
  return { caixas: novasCaixas, dano: contarCaixasDano(novasCaixas) }
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
