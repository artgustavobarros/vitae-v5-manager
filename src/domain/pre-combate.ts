import { z } from 'zod'

import { recursosSobrenaturaisSchema } from './poderes-antagonista'
import { identificadorSchema, LIMITE_ITENS, nomeSchema } from './limites-entrada'

/**
 * Pré-Combate: um grupo de Inimigos salvo para reuso. Ao iniciar um Combate,
 * o Narrador pode carregar um Pré-Combate em vez de escolher os modelos na hora.
 */
export const inimigoPreCombateSchema = z.object({
  id: identificadorSchema,
  modeloId: z.string().uuid(),
  nome: nomeSchema.min(1, 'Nome é obrigatório'),
  recursosSobrenaturais: recursosSobrenaturaisSchema.optional(),
})

export type InimigoPreCombate = z.infer<typeof inimigoPreCombateSchema>

export const preCombateSchema = z.object({
  id: z.string().uuid().optional(),
  nome: nomeSchema.min(1, 'Nome do Pré-Combate é obrigatório'),
  inimigos: z.array(inimigoPreCombateSchema).max(LIMITE_ITENS).default([]),
})

export type PreCombate = z.infer<typeof preCombateSchema>
