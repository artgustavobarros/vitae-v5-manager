import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import type { Papel } from '#/domain/acesso'
import { auth } from '#/lib/auth'

export type Usuario = {
  id: string
  nome: string
  email: string
  papel: Papel
}

async function lerUsuario(): Promise<Usuario | null> {
  const sessao = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!sessao) return null
  const { id, name, email, papel } = sessao.user
  return { id, nome: name, email, papel: papel as Papel }
}

export const buscarUsuario = createServerFn({ method: 'GET' }).handler(lerUsuario)

export const exigirNarrador = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const usuario = await lerUsuario()
    if (usuario?.papel !== 'narrador') throw new Error('Acesso negado')
    return next({ context: { usuario } })
  },
)
