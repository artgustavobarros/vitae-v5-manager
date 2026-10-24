import { randomBytes } from 'node:crypto'

import { createServerFn } from '@tanstack/react-start'
import { setCookie } from '@tanstack/react-start/server'
import { desc, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { conviteCronica } from '#/db/schema'
import { estadoConvite } from '#/domain/convite'
import { COOKIE_CONVITE } from '#/lib/cadastro'
import { exigirNarrador } from '#/server/sessao'

/** O link atual da Crônica, ou null se o Narrador ainda não gerou nenhum. */
export const buscarLinkDaCronica = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async () => {
    const [atual] = await db
      .select({ token: conviteCronica.token, criadoEm: conviteCronica.criadoEm })
      .from(conviteCronica)
      .where(isNull(conviteCronica.substituidoEm))
      .orderBy(desc(conviteCronica.criadoEm))
      .limit(1)
    return atual ?? null
  })

/** Gera o link novo da Crônica; o anterior para de valer na hora. */
export const gerarNovoLink = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .handler(() =>
    db.transaction(async (tx) => {
      await tx
        .update(conviteCronica)
        .set({ substituidoEm: new Date() })
        .where(isNull(conviteCronica.substituidoEm))
      const [novo] = await tx
        .insert(conviteCronica)
        .values({ token: randomBytes(24).toString('base64url') })
        .returning({ token: conviteCronica.token, criadoEm: conviteCronica.criadoEm })
      return novo
    }),
  )

const comToken = z.object({ token: z.string().min(1).max(100) })

/** Público: a página do link mostra se ele ainda é o link atual da Crônica. */
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
    if (estadoConvite(convite) !== 'valido') throw new Error('Este link da Crônica não vale mais. Peça o link novo ao Narrador.')
    setCookie(COOKIE_CONVITE, data.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: !import.meta.env.DEV,
      path: '/',
      maxAge: 30 * 60,
    })
  })
