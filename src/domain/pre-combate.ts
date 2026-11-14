import { z } from 'zod'

import { especialAntagonistaSchema, paradaExcepcionalSchema, type ModeloAntagonista } from './bestiario'
import { fichaAntagonistaCompletaSchema } from './ficha-antagonista'
import { recursosSobrenaturaisSchema } from './poderes-antagonista'
import { identificadorSchema, LIMITE_ITENS, nomeSchema, textoLongoSchema } from './limites-entrada'

export const paradasCustomizadasPreCombateSchema = z.object({
  fisico: z.int().min(0).nullable(),
  social: z.int().min(0).nullable(),
  mental: z.int().min(0).nullable(),
  excepcionais: z.array(paradaExcepcionalSchema).max(LIMITE_ITENS).default([]),
})

/**
 * Pré-Combate: um grupo de Inimigos salvo para reuso. Ao iniciar um Combate,
 * o Narrador pode carregar um Pré-Combate em vez de escolher os modelos na hora.
 */
export const inimigoPreCombateSchema = z.object({
  id: identificadorSchema,
  modeloId: z.string().uuid(),
  nome: nomeSchema.min(1, 'Nome é obrigatório'),
  recursosSobrenaturais: recursosSobrenaturaisSchema.optional(),
  vitalidadeMax: z.int().min(1).optional(),
  vontadeMax: z.int().min(1).optional(),
  paradas: paradasCustomizadasPreCombateSchema.optional(),
  fichaCompleta: fichaAntagonistaCompletaSchema.nullish(),
  especiais: z.array(especialAntagonistaSchema).max(LIMITE_ITENS).optional(),
  notas: textoLongoSchema.optional(),
})

export type InimigoPreCombate = z.infer<typeof inimigoPreCombateSchema>

export function aplicarCustomizacaoAoModelo(
  modelo: ModeloAntagonista,
  inimigo: Partial<Pick<InimigoPreCombate, 'vitalidadeMax' | 'vontadeMax' | 'paradas' | 'fichaCompleta' | 'especiais' | 'notas'>>,
): ModeloAntagonista {
  const fichaCompleta = inimigo.fichaCompleta !== undefined ? inimigo.fichaCompleta : modelo.fichaCompleta
  return {
    ...modelo,
    vitalidade: inimigo.vitalidadeMax ?? modelo.vitalidade,
    vontade: inimigo.vontadeMax ?? modelo.vontade,
    paradaFisico: fichaCompleta ? null : (inimigo.paradas ? inimigo.paradas.fisico : modelo.paradaFisico),
    paradaSocial: fichaCompleta ? null : (inimigo.paradas ? inimigo.paradas.social : modelo.paradaSocial),
    paradaMental: fichaCompleta ? null : (inimigo.paradas ? inimigo.paradas.mental : modelo.paradaMental),
    paradasExcepcionais: inimigo.paradas ? inimigo.paradas.excepcionais : modelo.paradasExcepcionais,
    fichaCompleta,
    especiais: inimigo.especiais ?? modelo.especiais,
    notas: inimigo.notas ?? modelo.notas,
  }
}

export const preCombateSchema = z.object({
  id: z.string().uuid().optional(),
  nome: nomeSchema.min(1, 'Nome do Pré-Combate é obrigatório'),
  inimigos: z.array(inimigoPreCombateSchema).max(LIMITE_ITENS).default([]),
})

export type PreCombate = z.infer<typeof preCombateSchema>
