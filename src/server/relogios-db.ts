import { asc, eq } from 'drizzle-orm'

import { db } from '#/db'
import { relogio } from '#/db/schema'
import type { Papel } from '#/domain/acesso'
import { alterarValorRelogio, relogioSchema, transicoesEfeitos, type Relogio, type RelogioSalvo } from '#/domain/relogios'

type BancoRelogios = Pick<typeof db, 'select' | 'insert' | 'update' | 'delete' | 'transaction'>

function exigirNarrador(papel: Papel) {
  if (papel !== 'narrador') throw new Error('Acesso negado')
}

export async function listarRelogiosNoBanco(papel: Papel, banco: BancoRelogios = db): Promise<RelogioSalvo[]> {
  return banco.select().from(relogio).where(papel === 'narrador' ? undefined : eq(relogio.visivel, true))
    .orderBy(asc(relogio.criadoEm), asc(relogio.id))
}

export async function salvarRelogioNoBanco(papel: Papel, entrada: Relogio, revisao: number | null, banco: BancoRelogios = db) {
  exigirNarrador(papel)
  const dados = relogioSchema.parse(entrada)
  return banco.transaction(async (tx) => {
    const [anterior] = await tx.select().from(relogio).where(eq(relogio.id, dados.id)).for('update')
    if (revisao !== null && !anterior) throw new Error('Relógio não encontrado.')
    if (anterior && revisao !== anterior.revisao) throw new Error('O Relógio mudou. Feche a edição e abra novamente para usar os valores atuais.')
    const tendencia = anterior ? alterarValorRelogio({ ...anterior, total: dados.total, perigo: dados.perigo }, dados.atual).tendencia : null
    const [salvo] = anterior
      ? await tx.update(relogio).set({ ...dados, revisao: anterior.revisao + 1, ultimaTendencia: tendencia }).where(eq(relogio.id, dados.id)).returning()
      : await tx.insert(relogio).values(dados).returning()
    // Revelar anuncia o estado público atual, nunca textos de efeitos ocultos já removidos.
    const baseAvisos = anterior?.visivel === false && salvo.visivel ? null : anterior ?? null
    return { relogio: salvo, avisos: transicoesEfeitos(baseAvisos, salvo) }
  })
}

export async function moverRelogioNoBanco(papel: Papel, id: string, delta: -1 | 1, banco: BancoRelogios = db) {
  exigirNarrador(papel)
  return banco.transaction(async (tx) => {
    const [anterior] = await tx.select().from(relogio).where(eq(relogio.id, id)).for('update')
    if (!anterior) throw new Error('Relógio não encontrado.')
    const movimento = alterarValorRelogio(anterior, anterior.atual + delta)
    if (movimento.atual === anterior.atual) return { relogio: anterior, avisos: [] }
    const [salvo] = await tx.update(relogio).set({
      atual: movimento.atual, ultimaTendencia: movimento.tendencia, revisao: anterior.revisao + 1,
    }).where(eq(relogio.id, id)).returning()
    return { relogio: salvo, avisos: movimento.avisos }
  })
}

export async function retirarRelogioNoBanco(papel: Papel, id: string, banco: BancoRelogios = db) {
  exigirNarrador(papel)
  const [retirado] = await banco.delete(relogio).where(eq(relogio.id, id)).returning()
  if (!retirado) throw new Error('Relógio não encontrado.')
  return retirado
}
