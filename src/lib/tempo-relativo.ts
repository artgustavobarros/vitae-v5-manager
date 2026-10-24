const formato = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

const PASSOS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 24 * 60 * 60_000],
  ['hour', 60 * 60_000],
  ['minute', 60_000],
]

/** "agora", "há 5 minutos", "ontem": quanto tempo passou desde `data`. */
export function tempoRelativo(data: Date, agora = new Date()): string {
  const passou = agora.getTime() - data.getTime()
  for (const [unidade, ms] of PASSOS) {
    if (passou >= ms) return formato.format(-Math.floor(passou / ms), unidade)
  }
  return 'agora'
}
