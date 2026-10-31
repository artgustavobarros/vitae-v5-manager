import { z } from 'zod'
import { normalizar } from './catalogo/busca'

export const TIPOS_ANTAGONISTA = ['Animal', 'Carniçal', 'Criatura sobrenatural', 'Lobisomem', 'Mortal', 'Vampiro', 'Outros'] as const
export type TipoAntagonista = typeof TIPOS_ANTAGONISTA[number]

export function normalizarEtiquetas(etiquetas: readonly string[]) {
  const unicas = new Map<string, string>()
  for (const etiqueta of etiquetas) {
    const texto = etiqueta.trim()
    const chave = normalizar(texto)
    if (chave && !unicas.has(chave)) unicas.set(chave, texto)
  }
  return [...unicas.values()]
}

export const etiquetasAntagonistaSchema = z.array(z.string().trim().min(1, 'Etiqueta não pode ficar vazia.')).transform(normalizarEtiquetas)
type Classificacao = { categoria: string; etiquetas?: string[] }

export function etiquetasDoTipo(modelos: readonly Classificacao[], tipo: string | null) {
  if (!tipo) return []
  return normalizarEtiquetas(modelos.filter(m => m.categoria === tipo).flatMap(m => m.etiquetas ?? []))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export function filtrarClassificacao<T extends Classificacao>(modelos: readonly T[], tipo: string | null, etiquetas: readonly string[]) {
  const exigidas = etiquetas.map(normalizar)
  return modelos.filter(modelo => {
    if (tipo && modelo.categoria !== tipo) return false
    const existentes = new Set((modelo.etiquetas ?? []).map(normalizar))
    return exigidas.every(etiqueta => existentes.has(etiqueta))
  })
}
