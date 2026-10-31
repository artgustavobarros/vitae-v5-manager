import { z } from 'zod'
import type { FonteModeloBestiario } from './bestiario-fontes'

import { modeloAntagonistaSchema, type ModeloAntagonista } from './bestiario'

export const STATUS_REVISAO_BESTIARIO = ['pendente', 'aprovado', 'corrigir', 'rejeitado'] as const
export type StatusRevisaoBestiario = (typeof STATUS_REVISAO_BESTIARIO)[number]

export const ROTULOS_REVISAO_BESTIARIO: Record<StatusRevisaoBestiario, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  corrigir: 'Precisa corrigir',
  rejeitado: 'Não entra',
}

export const revisaoModeloSchema = z.object({
  status: z.enum(STATUS_REVISAO_BESTIARIO),
  nota: z.string().default(''),
})
export type RevisaoModelo = z.infer<typeof revisaoModeloSchema>

export const edicaoModeloBestiarioSchema = modeloAntagonistaSchema.safeExtend({
  revisao: revisaoModeloSchema.optional(),
})
export type EdicaoModeloBestiario = z.infer<typeof edicaoModeloBestiarioSchema>
export type ModeloParaRevisao = ModeloAntagonista & {
  id: string
  revisao: RevisaoModelo
  fonte?: FonteModeloBestiario | null
  incluido: boolean
}

export function validarConclusaoBestiario(status: readonly StatusRevisaoBestiario[]) {
  if (status.length === 0) throw new Error('Nenhum Modelo para revisar.')
  const pendentes = status.filter((s) => s === 'pendente' || s === 'corrigir').length
  if (pendentes > 0) {
    throw new Error(`Decida ${pendentes} ${pendentes === 1 ? 'Modelo' : 'Modelos'} antes de concluir a revisão.`)
  }
}
