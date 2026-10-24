/** Minúsculas e sem acento, para a busca dos combobox. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

/** A busca casa quando algum dos textos (nome, nome original...) contém o termo, ignorando acento e caixa. */
export function casaBusca(termo: string, textos: readonly (string | undefined)[]): boolean {
  const alvo = normalizar(termo)
  if (alvo === '') return true
  return textos.some((t) => t !== undefined && normalizar(t).includes(alvo))
}
