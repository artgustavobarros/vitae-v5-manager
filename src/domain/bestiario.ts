import { z } from 'zod'

export const paradaExcepcionalSchema = z.object({
  nome: z.string().min(1, 'Nome da parada é obrigatório'),
  valor: z.int().min(1, 'Valor deve ser pelo menos 1'),
})

export type ParadaExcepcional = z.infer<typeof paradaExcepcionalSchema>

export const especialAntagonistaSchema = z.object({
  nome: z.string().min(1, 'Nome do especial é obrigatório'),
  descricao: z.string().default(''),
})

export type EspecialAntagonista = z.infer<typeof especialAntagonistaSchema>

export const modeloAntagonistaSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1, 'Nome do modelo é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória').default('Geral'),
  paradaFisico: z.int().min(1, 'Parada física deve ser pelo menos 1'),
  paradaSocial: z.int().min(1, 'Parada social deve ser pelo menos 1'),
  paradaMental: z.int().min(1, 'Parada mental deve ser pelo menos 1'),
  vitalidade: z.int().min(1, 'Vitalidade deve ser pelo menos 1'),
  vontade: z.int().min(1, 'Força de Vontade deve ser pelo menos 1'),
  paradasExcepcionais: z.array(paradaExcepcionalSchema).default([]),
  especiais: z.array(especialAntagonistaSchema).default([]),
  notas: z.string().default(''),
})

export type ModeloAntagonista = z.infer<typeof modeloAntagonistaSchema>

export function criarModeloAntagonistaPadrao(): Omit<ModeloAntagonista, 'id'> {
  return {
    nome: '',
    categoria: 'Geral',
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
