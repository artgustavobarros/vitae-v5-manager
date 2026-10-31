export type DificuldadeGeral = { forte: number; normal: number | null }

/** Separa a anotação para exibição; o texto original permanece editável no Modelo. */
export function separarDificuldadeGeral(notas: string): { dificuldade: DificuldadeGeral | null; notas: string } {
  const trecho = /(?:^|\s)Dificuldade\s+geral\s*:\s*(\d+)(?:\s*\/\s*(\d+))?(?:\.(?=\s|$)|(?=\s|$))(?!\s*\/)/i.exec(notas)
  if (!trecho) return { dificuldade: null, notas }
  const forte = Number(trecho[1])
  const normal = trecho[2] === undefined ? null : Number(trecho[2])
  if (!Number.isSafeInteger(forte) || (normal !== null && !Number.isSafeInteger(normal))) return { dificuldade: null, notas }
  return {
    dificuldade: { forte, normal },
    notas: (notas.slice(0, trecho.index) + notas.slice(trecho.index + trecho[0].length)).trim(),
  }
}
