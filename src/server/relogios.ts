import { randomUUID } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { relogioSchema } from '#/domain/relogios'
import { barramento } from '#/server/eventos'
import { listarRelogiosNoBanco, moverRelogioNoBanco, retirarRelogioNoBanco, salvarRelogioNoBanco } from '#/server/relogios-db'
import { exigirNarrador, exigirUsuario } from '#/server/sessao'

function publicar(resultado: Awaited<ReturnType<typeof salvarRelogioNoBanco>>) {
  const { relogio, avisos } = resultado
  barramento.emitir({ tipo: 'mudanca', escopo: 'relogios' })
  if (avisos.length > 0) barramento.emitir({
    tipo: 'efeitos-relogio', apenasNarrador: !relogio.visivel,
    avisos: avisos.map((aviso) => ({
      ...aviso, id: randomUUID(), relogioId: relogio.id, nomeRelogio: relogio.nome, tendencia: relogio.ultimaTendencia,
    })),
  })
}

export const carregarRelogios = createServerFn({ method: 'GET' }).middleware([exigirUsuario])
  .handler(({ context }) => listarRelogiosNoBanco(context.usuario.papel))

export const salvarRelogio = createServerFn({ method: 'POST' }).middleware([exigirNarrador])
  .validator(z.object({ relogio: relogioSchema, revisao: z.number().int().min(1).nullable() }))
  .handler(async ({ data, context }) => {
    const resultado = await salvarRelogioNoBanco(context.usuario.papel, data.relogio, data.revisao)
    publicar(resultado)
    return { ok: true }
  })

export const moverRelogio = createServerFn({ method: 'POST' }).middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid(), delta: z.union([z.literal(-1), z.literal(1)]) }))
  .handler(async ({ data, context }) => {
    const resultado = await moverRelogioNoBanco(context.usuario.papel, data.id, data.delta)
    publicar(resultado)
    return { ok: true }
  })

export const retirarRelogio = createServerFn({ method: 'POST' }).middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await retirarRelogioNoBanco(context.usuario.papel, data.id)
    barramento.emitir({ tipo: 'mudanca', escopo: 'relogios' })
    return { ok: true }
  })
