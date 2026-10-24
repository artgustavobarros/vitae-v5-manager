import { createServerFn } from '@tanstack/react-start'
import { asc } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { revisaoTraducao } from '#/db/schema'
import { contarPendentes, itensRevisao } from '#/domain/catalogo/revisao'
import { exigirNarrador } from './sessao'

const IDS = new Set(itensRevisao().map((i) => i.id))
const itemId = z.string().refine((id) => IDS.has(id), 'Item fora do Catálogo')

async function lerRevisoes() {
  return db
    .select({ itemId: revisaoTraducao.itemId, status: revisaoTraducao.status, criadoEm: revisaoTraducao.criadoEm })
    .from(revisaoTraducao)
    .orderBy(asc(revisaoTraducao.criadoEm))
}

export const listarRevisoes = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(lerRevisoes)

/** Quantos itens o Narrador ainda não aprovou nem sugeriu; vai no link do menu. */
export const contarRevisoesPendentes = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async () => contarPendentes(itensRevisao(), await lerRevisoes()))

export const aprovarTraducao = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ itemId }))
  .handler(async ({ data }) => {
    await db.insert(revisaoTraducao).values({ itemId: data.itemId, status: 'aprovado' })
  })

export const sugerirTraducao = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(
    z
      .object({
        itemId,
        sugestaoNome: z.string().trim().max(200).nullable(),
        sugestaoDescricao: z.string().trim().max(2000).nullable(),
      })
      .refine((d) => d.sugestaoNome || d.sugestaoDescricao, 'Sugira um nome ou uma descrição'),
  )
  .handler(async ({ data }) => {
    await db.insert(revisaoTraducao).values({
      itemId: data.itemId,
      status: 'sugerido',
      sugestaoNome: data.sugestaoNome || null,
      sugestaoDescricao: data.sugestaoDescricao || null,
    })
  })
