import { z } from 'zod'

import { ATRIBUTOS } from './ficha'
import { identificadorSchema, LIMITE_ITENS } from './limites-entrada'

const valorCaracteristica = z.int().min(0).max(15)
export const fichaAntagonistaCompletaSchema = z.object({
  atributos: z.record(z.enum(ATRIBUTOS.map((a) => a.id)), valorCaracteristica),
  habilidades: z.record(identificadorSchema, valorCaracteristica).refine((valores) => Object.keys(valores).length <= LIMITE_ITENS),
  disciplinas: z.record(identificadorSchema, z.int().min(1).max(5)).refine((valores) => Object.keys(valores).length <= LIMITE_ITENS),
  humanidade: z.int().min(0).max(10).nullable(),
  potenciaSangue: z.int().min(0).max(10).nullable(),
  fome: z.int().min(0).max(5).nullable(),
})
export type FichaAntagonistaCompleta = z.infer<typeof fichaAntagonistaCompletaSchema>

export function criarFichaAntagonistaCompleta(): FichaAntagonistaCompleta {
  return {
    atributos: { forca: 1, destreza: 1, vigor: 1, carisma: 1, manipulacao: 1, autocontrole: 1, inteligencia: 1, raciocinio: 1, determinacao: 1 },
    habilidades: {}, disciplinas: {}, humanidade: null, potenciaSangue: null, fome: null,
  }
}
