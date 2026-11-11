import { createHash, randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { linkPublico } from '#/db/schema'
import type { Papel } from '#/domain/acesso'

type Banco = Pick<typeof db, 'select' | 'insert' | 'update'>
const ID = 'cronica'
const hash = (token: string) => createHash('sha256').update(token).digest('hex')

function exigirNarrador(papel: Papel) {
  if (papel !== 'narrador') throw new Error('Acesso negado')
}

export async function gerarLinkPublicoNoBanco(papel: Papel, banco: Banco = db) {
  exigirNarrador(papel)
  const token = randomBytes(32).toString('base64url')
  await banco.insert(linkPublico).values({ id: ID, tokenHash: hash(token) })
    .onConflictDoUpdate({ target: linkPublico.id, set: { tokenHash: hash(token), atualizadoEm: new Date() } })
  return token
}

export async function revogarLinkPublicoNoBanco(papel: Papel, banco: Banco = db) {
  exigirNarrador(papel)
  await banco.update(linkPublico).set({ tokenHash: null, atualizadoEm: new Date() }).where(eq(linkPublico.id, ID))
}

export async function validarLinkPublicoNoBanco(token: string, banco: Pick<Banco, 'select'> = db) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return false
  const [link] = await banco.select({ tokenHash: linkPublico.tokenHash }).from(linkPublico).where(eq(linkPublico.id, ID))
  return link?.tokenHash === hash(token)
}

export async function existeLinkPublicoNoBanco(banco: Banco = db) {
  const [link] = await banco.select({ tokenHash: linkPublico.tokenHash }).from(linkPublico).where(eq(linkPublico.id, ID))
  return Boolean(link?.tokenHash)
}
