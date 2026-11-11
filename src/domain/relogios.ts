import { z } from 'zod'

export const efeitoRelogioSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().trim().min(1, 'Dê um título ao efeito.').max(120),
  condicao: z.enum(['a_partir_de', 'ate']),
  etapa: z.number().int().min(0).max(100),
  textoAtivacao: z.string().trim().min(1, 'Escreva o aviso de ativação.').max(2000),
  textoDesativacao: z.string().trim().min(1, 'Escreva o aviso de desativação.').max(2000),
})

export const relogioSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().trim().min(1, 'Dê um nome ao Relógio.').max(120),
  tipo: z.string().trim().min(1, 'Informe o tipo de evento.').max(60, 'Use até 60 caracteres no tipo de evento.'),
  descricao: z.string().trim().max(2000),
  total: z.number().int().min(1, 'Use pelo menos uma etapa.').max(100, 'Use até 100 etapas.'),
  atual: z.number().int().min(0),
  perigo: z.enum(['aumenta', 'diminui']),
  visivel: z.boolean(),
  efeitos: z.array(efeitoRelogioSchema).max(30),
}).superRefine((relogio, ctx) => {
  if (relogio.atual > relogio.total) ctx.addIssue({ code: 'custom', path: ['atual'], message: 'O valor atual não pode ultrapassar o total de etapas.' })
  const ids = new Set<string>()
  for (const [i, efeito] of relogio.efeitos.entries()) {
    if (efeito.etapa > relogio.total) ctx.addIssue({ code: 'custom', path: ['efeitos', i, 'etapa'], message: 'A etapa do efeito não pode ultrapassar o total.' })
    if (ids.has(efeito.id)) ctx.addIssue({ code: 'custom', path: ['efeitos', i, 'id'], message: 'Cada efeito precisa de um identificador próprio.' })
    ids.add(efeito.id)
  }
})

export type Relogio = z.infer<typeof relogioSchema>
export type EfeitoRelogio = z.infer<typeof efeitoRelogioSchema>
export type TendenciaRelogio = 'piora' | 'melhora'
export type AvisoEfeitoRelogio = { efeitoId: string; titulo: string; texto: string; ativo: boolean }
export type RelogioSalvo = Relogio & { revisao: number; ultimaTendencia: TendenciaRelogio | null }
export type AvisoRelogio = AvisoEfeitoRelogio & {
  id: string; relogioId: string; nomeRelogio: string; tendencia: TendenciaRelogio | null
}

function efeitoAtivo(efeito: Pick<EfeitoRelogio, 'etapa' | 'condicao'>, valor: number) {
  return efeito.condicao === 'a_partir_de' ? valor >= efeito.etapa : valor <= efeito.etapa
}

export function efeitosAtivos<T extends Pick<EfeitoRelogio, 'etapa' | 'condicao'>>(relogio: { atual: number; efeitos: T[] }) {
  return relogio.efeitos.filter((efeito) => efeitoAtivo(efeito, relogio.atual))
}

export function transicoesEfeitos(anterior: Relogio | null, atual: Relogio): AvisoEfeitoRelogio[] {
  const anteriores = new Map(anterior?.efeitos.map((efeito) => [efeito.id, efeito]) ?? [])
  const atuais = new Map(atual.efeitos.map((efeito) => [efeito.id, efeito]))
  const avisos: AvisoEfeitoRelogio[] = []
  for (const id of new Set([...anteriores.keys(), ...atuais.keys()])) {
    const antes = anteriores.get(id)
    const depois = atuais.get(id)
    const estavaAtivo = Boolean(antes && anterior && efeitoAtivo(antes, anterior.atual))
    const ativo = Boolean(depois && efeitoAtivo(depois, atual.atual))
    const efeito = depois ?? antes
    if (efeito && estavaAtivo !== ativo) avisos.push({
      efeitoId: id, titulo: efeito.titulo, ativo,
      texto: ativo ? efeito.textoAtivacao : efeito.textoDesativacao,
    })
  }
  return avisos
}

export function alterarValorRelogio(relogio: Relogio, valor: number) {
  const atual = Math.max(0, Math.min(relogio.total, valor))
  const tendencia: TendenciaRelogio | null = atual === relogio.atual ? null
    : (atual > relogio.atual) === (relogio.perigo === 'aumenta') ? 'piora' : 'melhora'
  return { atual, tendencia, avisos: transicoesEfeitos(relogio, { ...relogio, atual }) }
}
