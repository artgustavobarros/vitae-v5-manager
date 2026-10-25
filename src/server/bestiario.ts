import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { modeloAntagonista } from '#/db/schema'
import {
  modeloAntagonistaSchema,
  type ModeloAntagonista,
} from '#/domain/bestiario'
import { exigirNarrador } from '#/server/sessao'

export const listarModelosBestiario = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async (): Promise<ModeloAntagonista[]> => {
    const linhas = await db
      .select()
      .from(modeloAntagonista)
      .orderBy(asc(modeloAntagonista.nome))

    return linhas.map((l) => ({
      id: l.id,
      nome: l.nome,
      categoria: l.categoria,
      paradaFisico: l.paradaFisico,
      paradaSocial: l.paradaSocial,
      paradaMental: l.paradaMental,
      vitalidade: l.vitalidade,
      vontade: l.vontade,
      paradasExcepcionais: l.paradasExcepcionais,
      especiais: l.especiais,
      notas: l.notas,
    }))
  })

export const carregarModeloBestiario = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }: { data: { id: string } }): Promise<ModeloAntagonista | null> => {
    const [linha] = await db
      .select()
      .from(modeloAntagonista)
      .where(eq(modeloAntagonista.id, data.id))

    if (!linha) return null

    return {
      id: linha.id,
      nome: linha.nome,
      categoria: linha.categoria,
      paradaFisico: linha.paradaFisico,
      paradaSocial: linha.paradaSocial,
      paradaMental: linha.paradaMental,
      vitalidade: linha.vitalidade,
      vontade: linha.vontade,
      paradasExcepcionais: linha.paradasExcepcionais,
      especiais: linha.especiais,
      notas: linha.notas,
    }
  })

export const salvarModeloBestiario = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(modeloAntagonistaSchema)
  .handler(async ({ data }: { data: ModeloAntagonista }) => {
    if (data.id) {
      const [atualizado] = await db
        .update(modeloAntagonista)
        .set({
          nome: data.nome,
          categoria: data.categoria,
          paradaFisico: data.paradaFisico,
          paradaSocial: data.paradaSocial,
          paradaMental: data.paradaMental,
          vitalidade: data.vitalidade,
          vontade: data.vontade,
          paradasExcepcionais: data.paradasExcepcionais,
          especiais: data.especiais,
          notas: data.notas,
        })
        .where(eq(modeloAntagonista.id, data.id))
        .returning()

      return atualizado
    }

    const [criado] = await db
      .insert(modeloAntagonista)
      .values({
        nome: data.nome,
        categoria: data.categoria,
        paradaFisico: data.paradaFisico,
        paradaSocial: data.paradaSocial,
        paradaMental: data.paradaMental,
        vitalidade: data.vitalidade,
        vontade: data.vontade,
        paradasExcepcionais: data.paradasExcepcionais,
        especiais: data.especiais,
        notas: data.notas,
      })
      .returning()

    return criado
  })

export const excluirModeloBestiario = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }: { data: { id: string } }) => {
    await db.delete(modeloAntagonista).where(eq(modeloAntagonista.id, data.id))
    return { ok: true }
  })
