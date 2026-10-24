import { randomBytes } from 'node:crypto'

import { createServerFn } from '@tanstack/react-start'
import { setCookie } from '@tanstack/react-start/server'
import { and, asc, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { conviteCronica } from '#/db/schema'
import { COOKIE_CONVITE, estadoConvite } from '#/domain/convite'
import { exigirNarrador } from '#/server/sessao'

export const listarConvites = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(() =>
    db
      .select({ id: conviteCronica.id, token: conviteCronica.token, criadoEm: conviteCronica.criadoEm })
      .from(conviteCronica)
      .where(isNull(conviteCronica.usadoEm))
      .orderBy(asc(conviteCronica.criadoEm)),
  )

export const gerarConvite = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .handler(async () => {
    const [convite] = await db
      .insert(conviteCronica)
      .values({ token: randomBytes(24).toString('base64url') })
      .returning({ token: conviteCronica.token })
    return convite
  })

export const cancelarConvite = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    await db
      .delete(conviteCronica)
      .where(and(eq(conviteCronica.id, data.id), isNull(conviteCronica.usadoEm)))
  })

const comToken = z.object({ token: z.string().min(1).max(100) })

/** Público: a página do link mostra se o convite ainda vale. */
export const verConvite = createServerFn({ method: 'GET' })
  .validator(comToken)
  .handler(async ({ data }) => {
    const convite = await db.query.conviteCronica.findFirst({ where: eq(conviteCronica.token, data.token) })
    return { estado: estadoConvite(convite) }
  })

/** Guarda o token num cookie para o hook de criação de conta, inclusive na volta do Google. */
export const prepararCadastro = createServerFn({ method: 'POST' })
  .validator(comToken)
  .handler(async ({ data }) => {
    const convite = await db.query.conviteCronica.findFirst({ where: eq(conviteCronica.token, data.token) })
    if (estadoConvite(convite) !== 'valido') throw new Error('Este convite não vale mais. Peça um novo ao Narrador.')
    setCookie(COOKIE_CONVITE, data.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: !import.meta.env.DEV,
      path: '/',
      maxAge: 30 * 60,
    })
  })
