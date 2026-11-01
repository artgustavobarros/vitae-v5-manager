import { asc, eq, inArray, sql } from 'drizzle-orm'

import { FONTES_MODELOS_BESTIARIO } from '#/domain/bestiario-fontes'

import { db } from '#/db'
import { modeloAntagonista } from '#/db/schema'
import { modeloAntagonistaSchema, type ModeloAntagonista } from '#/domain/bestiario'
import {
  edicaoModeloBestiarioSchema,
  revisaoModeloSchema,
  validarConclusaoBestiario,
  type EdicaoModeloBestiario,
  type ModeloParaRevisao,
  type RevisaoModelo,
} from '#/domain/revisao-bestiario'

type BancoBestiario = Pick<typeof db, 'select' | 'insert' | 'update' | 'transaction'>

function paraRevisao(linha: typeof modeloAntagonista.$inferSelect): ModeloParaRevisao {
  const { statusRevisao, notaRevisao, criadoEm: _criadoEm, atualizadoEm: _atualizadoEm, ...modelo } = linha
  return { ...modelo, ...modeloAntagonistaSchema.parse(modelo), id: modelo.id, fonte: FONTES_MODELOS_BESTIARIO[modelo.id] ?? null, revisao: { status: statusRevisao, nota: notaRevisao } }
}

export async function listarModelosBestiarioNoBanco(banco: BancoBestiario = db): Promise<ModeloAntagonista[]> {
  const linhas = await banco.select().from(modeloAntagonista)
    .where(eq(modeloAntagonista.incluido, true)).orderBy(asc(modeloAntagonista.nome))
  return linhas.map((linha) => modeloAntagonistaSchema.parse(linha))
}

export async function listarModelosParaRevisaoNoBanco(banco: BancoBestiario = db) {
  const linhas = await banco.select().from(modeloAntagonista).orderBy(asc(modeloAntagonista.nome))
  return linhas.map(paraRevisao)
}

export async function salvarModeloBestiarioNoBanco(entrada: EdicaoModeloBestiario, banco: BancoBestiario = db) {
  const { id, revisao, ...dados } = edicaoModeloBestiarioSchema.parse(entrada)
  const valores = {
    ...dados,
    ...(revisao ? { statusRevisao: revisao.status, notaRevisao: revisao.nota } : {}),
  }
  const [salvo] = id
    ? await banco.update(modeloAntagonista).set(valores).where(eq(modeloAntagonista.id, id)).returning()
    : await banco.insert(modeloAntagonista).values(valores).returning()
  if (!salvo) throw new Error('Modelo não encontrado.')
  return paraRevisao(salvo)
}

export async function registrarRevisaoModeloNoBanco(
  entrada: { id: string; revisao: RevisaoModelo },
  banco: BancoBestiario = db,
) {
  const revisao = revisaoModeloSchema.parse(entrada.revisao)
  const [salvo] = await banco.update(modeloAntagonista)
    .set({ statusRevisao: revisao.status, notaRevisao: revisao.nota })
    .where(eq(modeloAntagonista.id, entrada.id)).returning()
  if (!salvo) throw new Error('Modelo não encontrado.')
  return paraRevisao(salvo)
}

export async function concluirRevisaoBestiarioNoBanco(banco: BancoBestiario = db) {
  return banco.transaction(async (tx) => {
    const modelos = await tx.select().from(modeloAntagonista).for('update')
    validarConclusaoBestiario(modelos.map((m) => m.statusRevisao))
    await tx.update(modeloAntagonista).set({
      incluido: sql`${modeloAntagonista.statusRevisao} = 'aprovado'`,
    }).where(inArray(modeloAntagonista.id, modelos.map((m) => m.id)))
    const aprovados = modelos.filter((m) => m.statusRevisao === 'aprovado').length
    return { aprovados, rejeitados: modelos.length - aprovados }
  })
}
