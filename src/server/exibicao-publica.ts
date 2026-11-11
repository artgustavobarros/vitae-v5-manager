import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { carregarExibicaoPublicaNoBanco } from './exibicao-publica-db'
import { barramento } from './eventos'
import { existeLinkPublicoNoBanco, gerarLinkPublicoNoBanco, revogarLinkPublicoNoBanco } from './link-publico-db'
import { exigirNarrador } from './sessao'

export const carregarExibicaoPublica = createServerFn({ method: 'GET' })
  .validator(z.object({ token: z.string().max(100) }))
  .handler(({ data }) => carregarExibicaoPublicaNoBanco(data.token))

export const consultarLinkPublico = createServerFn({ method: 'GET' }).middleware([exigirNarrador])
  .handler(() => existeLinkPublicoNoBanco())

export const gerarLinkPublico = createServerFn({ method: 'POST' }).middleware([exigirNarrador])
  .handler(async ({ context }) => {
    const token = await gerarLinkPublicoNoBanco(context.usuario.papel)
    barramento.emitir({ tipo: 'mudanca', escopo: 'link-publico', apenasNarrador: true })
    return { token }
  })

export const revogarLinkPublico = createServerFn({ method: 'POST' }).middleware([exigirNarrador])
  .handler(async ({ context }) => {
    await revogarLinkPublicoNoBanco(context.usuario.papel)
    barramento.emitir({ tipo: 'mudanca', escopo: 'link-publico', apenasNarrador: true })
    return { ok: true }
  })
