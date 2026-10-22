import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { conviteCronica } from '#/db/schema'
import { normalizarEmail } from '#/domain/acesso'
import { exigirNarrador } from '#/server/sessao'

export const listarConvites = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(() =>
    db
      .select({ id: conviteCronica.id, email: conviteCronica.email })
      .from(conviteCronica)
      .orderBy(asc(conviteCronica.email)),
  )

export const criarConvite = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ email: z.email() }))
  .handler(async ({ data }) => {
    await db
      .insert(conviteCronica)
      .values({ email: normalizarEmail(data.email) })
      .onConflictDoNothing()
  })

export const removerConvite = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    await db.delete(conviteCronica).where(eq(conviteCronica.id, data.id))
  })
