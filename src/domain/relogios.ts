import { z } from 'zod'

export const efeitoRelogioSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().trim().min(1, 'Dê um título ao efeito.').max(120),
  condicao: z.enum(['a_partir_de', 'ate']),
  etapa: z.number().int().min(0).max(100),
  textoAtivacao: z.string().trim().min(1, 'Escreva o aviso de ativação.').max(2000),
  textoDesativacao: z.string().trim().min(1, 'Escreva o aviso de desativação.').max(2000),
})

export const configuracaoRelogioSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().trim().min(1, 'Dê um nome ao Relógio.').max(120),
  tituloPublico: z.string().trim().max(120, 'Use até 120 caracteres no título público.').optional(),
  total: z.number().int().min(1, 'Use pelo menos uma etapa.').max(100, 'Use até 100 etapas.'),
  atual: z.number().int().min(0),
  visivel: z.boolean(),
}).superRefine((relogio, ctx) => {
  if (relogio.atual > relogio.total) ctx.addIssue({ code: 'custom', path: ['atual'], message: 'O valor atual não pode ultrapassar o total de etapas.' })
})

// Compatibilidade com os dados antigos e o experimento de talismãs.
export const relogioSchema = configuracaoRelogioSchema.safeExtend({
  tipo: z.string().trim().min(1, 'Informe o tipo de evento.').max(60, 'Use até 60 caracteres no tipo de evento.'),
  descricao: z.string().trim().max(2000),
  perigo: z.enum(['aumenta', 'diminui']),
  efeitos: z.array(efeitoRelogioSchema).max(30),
}).superRefine((relogio, ctx) => {
  const ids = new Set<string>()
  for (const [i, efeito] of relogio.efeitos.entries()) {
    if (efeito.etapa > relogio.total) ctx.addIssue({ code: 'custom', path: ['efeitos', i, 'etapa'], message: 'A etapa do efeito não pode ultrapassar o total.' })
    if (ids.has(efeito.id)) ctx.addIssue({ code: 'custom', path: ['efeitos', i, 'id'], message: 'Cada efeito precisa de um identificador próprio.' })
    ids.add(efeito.id)
  }
})

export type Relogio = z.infer<typeof relogioSchema>
export type ConfiguracaoRelogio = z.infer<typeof configuracaoRelogioSchema>
export type EfeitoRelogio = z.infer<typeof efeitoRelogioSchema>
export type TendenciaRelogio = 'piora' | 'melhora'
export type RelogioSalvo = Relogio & { revisao: number; ultimaTendencia: TendenciaRelogio | null }
export function alterarValorRelogio(relogio: Relogio, valor: number) {
  const atual = Math.max(0, Math.min(relogio.total, valor))
  return { atual }
}
