import { z } from 'zod'

import { marcasSchema, type Marcas } from './ficha'

export const alteracaoMarcasSchema = z.object({
  operacaoId: z.uuid(),
  usuarioId: z.string().min(1),
  id: z.uuid(),
  base: marcasSchema.strict(),
  marcas: marcasSchema.partial().strict().refine((marcas) => {
    const valores = Object.values(marcas)
    return valores.length > 0 && valores.every((valor) => valor !== undefined)
  }),
}).strict()

export type AlteracaoMarcas = z.infer<typeof alteracaoMarcasSchema>
export type ResultadoMarcacao =
  | { tipo: 'salvo'; marcas: Marcas; revisao: number }
  | { tipo: 'conflito'; marcas: Marcas; revisao: number }
  | { tipo: 'recusado'; mensagem: string }

/** Compara apenas os campos alterados; mudanças independentes podem sincronizar normalmente. */
export function temConflitoMarcas(atual: Marcas, base: Marcas, marcas: Partial<Marcas>): boolean {
  return (['fome', 'manchas', 'danoVitalidade', 'danoVontade'] as const).some((campo) => {
    if (marcas[campo] === undefined) return false
    const a = atual[campo]
    const b = base[campo]
    return typeof a === 'number' || typeof b === 'number'
      ? a !== b
      : a.superficial !== b.superficial || a.agravado !== b.agravado
  })
}
