import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { modeloAntagonista } from '#/db/schema'
import type { ModeloAntagonista } from '#/domain/bestiario'
import {
  edicaoModeloBestiarioSchema,
  revisaoModeloSchema,
  type EdicaoModeloBestiario,
  type RevisaoModelo,
} from '#/domain/revisao-bestiario'
import {
  concluirRevisaoBestiarioNoBanco,
  listarModelosBestiarioNoBanco,
  listarModelosParaRevisaoNoBanco,
  registrarRevisaoModeloNoBanco,
  salvarModeloBestiarioNoBanco,
} from '#/server/revisao-bestiario-db'
import { exigirNarrador } from '#/server/sessao'

export const listarModelosBestiario = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(() => listarModelosBestiarioNoBanco())

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
      etiquetas: linha.etiquetas,
      paradaFisico: linha.paradaFisico,
      paradaSocial: linha.paradaSocial,
      paradaMental: linha.paradaMental,
      vitalidade: linha.vitalidade,
      vontade: linha.vontade,
      paradasExcepcionais: linha.paradasExcepcionais,
      especiais: linha.especiais,
      notas: linha.notas,
      fichaCompleta: linha.fichaCompleta,
    }
  })

export const salvarModeloBestiario = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(edicaoModeloBestiarioSchema)
  .handler(({ data }: { data: EdicaoModeloBestiario }) => salvarModeloBestiarioNoBanco(data))

export const listarModelosParaAprovacao = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(() => listarModelosParaRevisaoNoBanco())

export const registrarRevisaoModelo = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid(), revisao: revisaoModeloSchema }))
  .handler(({ data }: { data: { id: string; revisao: RevisaoModelo } }) => registrarRevisaoModeloNoBanco(data))

export const concluirRevisaoBestiario = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .handler(() => concluirRevisaoBestiarioNoBanco())

export const excluirModeloBestiario = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }: { data: { id: string } }) => {
    await db.delete(modeloAntagonista).where(eq(modeloAntagonista.id, data.id))
    return { ok: true }
  })
