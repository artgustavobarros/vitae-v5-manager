import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { isRedirect, redirect } from '@tanstack/react-router'
import { isAPIError } from 'better-auth/api'

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
  const sessao = await auth.api.getSession({ headers: getRequestHeaders() }).catch((erro: unknown) => {
    if (isAPIError(erro) && erro.body?.code === 'FAILED_TO_GET_SESSION') return null
    throw erro
  })
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

export const exigirUsuario = createMiddleware({ type: 'function' })
  .client(async ({ next }) => {
    try {
      return await next()
    } catch (erro) {
      // Chamadas diretas de server functions podem capturar o redirect antes do Router.
      if (isRedirect(erro) && (erro.options.to === '/entrar' || erro.options.href === '/entrar') && typeof window !== 'undefined') {
        window.location.replace('/entrar')
      }
      throw erro
    }
  })
  .server(async ({ next }) => {
    const usuario = await lerUsuario()
    if (!usuario) throw redirect({ to: '/entrar' })
    const espera = limitarUsuario(usuario.id)
    if (espera) throw respostaLimite(espera)
    return next({ context: { usuario } })
  })

export const exigirNarrador = createMiddleware({ type: 'function' })
  .middleware([exigirUsuario])
  .server(async ({ context, next }) => {
    if (context.usuario.papel !== 'narrador') throw new Error('Acesso negado')
    return next()
  })
