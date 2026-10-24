import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import type { Papel } from '#/domain/acesso'
import { auth } from '#/lib/auth'

export type Usuario = {
  id: string
  nome: string
  email: string
  /** Foto da conta Google; null em conta por nome de usuário. */
  imagem: string | null
  /** Nome de usuário com que entra; null em conta só Google. O e-mail dessas contas é sintético e não aparece. */
  nomeUsuario: string | null
  papel: Papel
}

async function lerUsuario(): Promise<Usuario | null> {
  const sessao = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!sessao) return null
  const { id, name, email, image, papel, username, displayUsername } = sessao.user
  return {
    id,
    nome: name,
    email,
    imagem: image ?? null,
    nomeUsuario: displayUsername ?? username ?? null,
    papel: papel as Papel,
  }
}

export const buscarUsuario = createServerFn({ method: 'GET' }).handler(lerUsuario)

export const exigirNarrador = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const usuario = await lerUsuario()
    if (usuario?.papel !== 'narrador') throw new Error('Acesso negado')
    return next({ context: { usuario } })
  },
)

export const exigirUsuario = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const usuario = await lerUsuario()
    if (!usuario) throw new Error('Acesso negado')
    return next({ context: { usuario } })
  },
)
