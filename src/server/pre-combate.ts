import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { preCombate } from '#/db/schema'
import { preCombateSchema, type PreCombate } from '#/domain/pre-combate'
import { exigirNarrador } from '#/server/sessao'

export const listarPreCombates = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async (): Promise<PreCombate[]> => {
    const linhas = await db.select().from(preCombate).orderBy(asc(preCombate.nome))
    return linhas.map((l) => ({ id: l.id, nome: l.nome, inimigos: l.inimigos }))
  })

export const salvarPreCombate = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(preCombateSchema)
  .handler(async ({ data }: { data: PreCombate }): Promise<PreCombate> => {
    if (data.id) {
      const [salvo] = await db
        .update(preCombate)
        .set({ nome: data.nome, inimigos: data.inimigos })
        .where(eq(preCombate.id, data.id))
        .returning()
      if (salvo) return { id: salvo.id, nome: salvo.nome, inimigos: salvo.inimigos }
    }

    const [salvo] = await db
      .insert(preCombate)
      .values({ nome: data.nome, inimigos: data.inimigos })
      .returning()

    return { id: salvo.id, nome: salvo.nome, inimigos: salvo.inimigos }
  })

export const excluirPreCombate = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }: { data: { id: string } }) => {
    await db.delete(preCombate).where(eq(preCombate.id, data.id))
    return { ok: true }
  })
