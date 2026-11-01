import type { db } from '../db/index.ts'
import { modeloAntagonista } from '../db/schema.ts'
import { modeloAntagonistaSchema } from '../domain/bestiario.ts'
import { MODELOS_INICIAIS_BESTIARIO } from '../domain/bestiario-modelos-iniciais.ts'

export async function inserirModelosIniciaisBestiario(banco: Pick<typeof db, 'transaction'>) {
  const modelos = MODELOS_INICIAIS_BESTIARIO.map((modelo) => modeloAntagonistaSchema.parse(modelo))

  return banco.transaction(async (tx) => {
    const existentes = await tx.select({ nome: modeloAntagonista.nome }).from(modeloAntagonista)
    const nomes = new Set(existentes.map((m) => m.nome.trim().toLocaleLowerCase('pt-BR')))
    const novos = modelos.filter((m) => !nomes.has(m.nome.trim().toLocaleLowerCase('pt-BR')))
    const inseridos = novos.length === 0 ? [] : await tx.insert(modeloAntagonista)
      .values(novos).onConflictDoNothing().returning({ id: modeloAntagonista.id })

    return { inseridos: inseridos.length, preservados: modelos.length - inseridos.length }
  })
}
