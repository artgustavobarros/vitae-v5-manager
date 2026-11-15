import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { configuracaoRelogioSchema } from '#/domain/relogios'
import { filtrarRelogiosPublicos } from '#/domain/exibicao-publica'
import { barramento } from '#/server/eventos'
import { listarRelogiosNoBanco, moverRelogioNoBanco, retirarRelogioNoBanco, salvarRelogioNoBanco } from '#/server/relogios-db'
import { exigirNarrador, exigirUsuario } from '#/server/sessao'

export const carregarRelogios = createServerFn({ method: 'GET' }).middleware([exigirUsuario])
  .handler(async ({ context }) => {
    const relogios = await listarRelogiosNoBanco(context.usuario.papel)
    return context.usuario.papel === 'narrador' ? relogios : filtrarRelogiosPublicos(relogios)
  })

export const salvarRelogio = createServerFn({ method: 'POST' }).middleware([exigirNarrador])
  .validator(z.object({ relogio: configuracaoRelogioSchema, revisao: z.number().int().min(1).nullable() }))
  .handler(async ({ data, context }) => {
    await salvarRelogioNoBanco(context.usuario.papel, data.relogio, data.revisao)
    barramento.emitir({ tipo: 'mudanca', escopo: 'relogios' })
    return { ok: true }
  })

export const moverRelogio = createServerFn({ method: 'POST' }).middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid(), delta: z.union([z.literal(-1), z.literal(1)]) }))
  .handler(async ({ data, context }) => {
    await moverRelogioNoBanco(context.usuario.papel, data.id, data.delta)
    barramento.emitir({ tipo: 'mudanca', escopo: 'relogios' })
    return { ok: true }
  })

export const retirarRelogio = createServerFn({ method: 'POST' }).middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await retirarRelogioNoBanco(context.usuario.papel, data.id)
    barramento.emitir({ tipo: 'mudanca', escopo: 'relogios' })
    return { ok: true }
  })
