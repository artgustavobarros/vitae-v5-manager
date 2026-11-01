export function separarEspecialidadeParada(nome: string): { nome: string; especialidade: string | null } {
  const texto = nome.trim()
  const partes = /^([^()]+?)\s*\(([^()]+)\)$/.exec(texto)
  const especialidade = partes?.[2].trim()
  return partes && especialidade
    ? { nome: partes[1].trim(), especialidade }
    : { nome: texto, especialidade: null }
}
