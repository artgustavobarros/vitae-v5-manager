import { z } from 'zod'

import { TIPOS_ANTAGONISTA, etiquetasAntagonistaSchema } from './classificacao-antagonistas'
import { fichaAntagonistaCompletaSchema } from './ficha-antagonista'

export const paradaExcepcionalSchema = z.object({
  nome: z.string().min(1, 'Nome da parada é obrigatório'),
  valor: z.int().min(1, 'Valor deve ser pelo menos 1'),
})

export type ParadaExcepcional = z.infer<typeof paradaExcepcionalSchema>

export const especialBaseSchema = z.object({
  nome: z.string(),
  descricao: z.string().default(''),
  regra: z.literal('poder-livre-nivel-1').nullish(),
})

export function normalizarEspecialAntagonista(especial: z.infer<typeof especialBaseSchema>) {
  if (especial.regra !== undefined) return especial
  const nome = especial.nome.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase()
  return ['poder de disciplina a escolha', 'disciplina a escolha'].includes(nome)
    ? { ...especial, regra: 'poder-livre-nivel-1' as const }
    : especial
}

export const especialAntagonistaSchema = especialBaseSchema.extend({
  nome: z.string().min(1, 'Nome do especial é obrigatório'),
}).transform(normalizarEspecialAntagonista)

export type EspecialAntagonista = z.infer<typeof especialAntagonistaSchema>

export const modeloAntagonistaSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1, 'Nome do modelo é obrigatório'),
  categoria: z.enum(TIPOS_ANTAGONISTA, { error: 'Escolha um Tipo de Antagonista válido.' }).default('Outros'),
  etiquetas: etiquetasAntagonistaSchema.optional(),
  paradaFisico: z.int().min(0, 'Parada física não pode ser negativa').nullable(),
  paradaSocial: z.int().min(0, 'Parada social não pode ser negativa').nullable(),
  paradaMental: z.int().min(0, 'Parada mental não pode ser negativa').nullable(),
  vitalidade: z.int().min(1, 'Vitalidade deve ser pelo menos 1'),
  vontade: z.int().min(1, 'Força de Vontade deve ser pelo menos 1'),
  paradasExcepcionais: z.array(paradaExcepcionalSchema).default([]),
  especiais: z.array(especialAntagonistaSchema).default([]),
  notas: z.string().default(''),
  fichaCompleta: fichaAntagonistaCompletaSchema.nullish(),
}).superRefine((modelo, ctx) => {
  for (const campo of ['paradaFisico', 'paradaSocial', 'paradaMental'] as const) {
    if (modelo.fichaCompleta ? modelo[campo] !== null : modelo[campo] === null) {
      ctx.addIssue({ code: 'custom', path: [campo], message: modelo.fichaCompleta
        ? 'A ficha completa usa Atributos e Habilidades, sem parada geral.'
        : 'Informe a parada geral da ficha simplificada.' })
    }
  }
})

export type ModeloAntagonista = z.infer<typeof modeloAntagonistaSchema>

export function criarModeloAntagonistaPadrao(): Omit<ModeloAntagonista, 'id'> {
  return {
    nome: '',
    categoria: 'Outros',
    etiquetas: [],
    paradaFisico: 1,
    paradaSocial: 1,
    paradaMental: 1,
    vitalidade: 3,
    vontade: 3,
    paradasExcepcionais: [],
    especiais: [],
    notas: '',
  }
}

export function validarModeloAntagonista(
  dados: unknown,
): { valido: true; dados: ModeloAntagonista } | { valido: false; erro: string } {
  const resultado = modeloAntagonistaSchema.safeParse(dados)
  if (!resultado.success) {
    return { valido: false, erro: resultado.error.issues[0]?.message ?? 'Dados inválidos' }
  }
  return { valido: true, dados: resultado.data }
}
