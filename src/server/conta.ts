import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { user } from '#/db/schema'
import { exigirNarrador } from '#/server/sessao'

/** Nome exibido na Crônica; a autenticação é gerenciada pela conta Google. */
export const buscarConta = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async ({ context }) => {
    const [dados] = await db
      .select({ nome: user.name })
      .from(user)
      .where(eq(user.id, context.usuario.id))
    return dados
  })
