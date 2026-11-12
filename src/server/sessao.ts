import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import type { Papel } from '#/domain/acesso'
import { auth } from '#/lib/auth'
import { limitarUsuario, respostaLimite } from './limites'

export type Usuario = {
  id: string
  nome: string
  email: string
  /** Foto da conta Google; null quando não houver foto. */
  imagem: string | null
  papel: Papel
}

async function lerUsuario(): Promise<Usuario | null> {
  const sessao = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!sessao) return null
  const { id, name, email, image, papel } = sessao.user
  return {
    id,
    nome: name,
    email,
    imagem: image ?? null,
    papel: papel as Papel,
  }
}

export const buscarUsuario = createServerFn({ method: 'GET' }).handler(lerUsuario)

export const exigirNarrador = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const usuario = await lerUsuario()
    if (usuario?.papel !== 'narrador') throw new Error('Acesso negado')
    const espera = limitarUsuario(usuario.id)
    if (espera) throw respostaLimite(espera)
    return next({ context: { usuario } })
  },
)

export const exigirUsuario = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const usuario = await lerUsuario()
    if (!usuario) throw new Error('Acesso negado')
    const espera = limitarUsuario(usuario.id)
    if (espera) throw respostaLimite(espera)
    return next({ context: { usuario } })
  },
)
