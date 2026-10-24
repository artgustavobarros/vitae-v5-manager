import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'

import { db } from '#/db'
import { notificacao } from '#/db/schema'
import { barramento } from './eventos'
import { exigirUsuario } from './sessao'

export const buscarNotificacoes = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .handler(async ({ context }) => {
    const linhas = await db
      .select({
        id: notificacao.id,
        texto: notificacao.texto,
        quando: notificacao.criadoEm,
        lida: notificacao.lida,
        destino: notificacao.linkJson,
      })
      .from(notificacao)
      .where(eq(notificacao.usuarioId, context.usuario.id))
      .orderBy(desc(notificacao.criadoEm))
      .limit(50)

    return linhas.map((linha) => ({
      id: linha.id,
      texto: linha.texto,
      quando: linha.quando.toISOString(),
      lida: linha.lida,
      destino: linha.destino ?? undefined,
    }))
  })

export const marcarNotificacoesLidas = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .handler(async ({ context }) => {
    await db
      .update(notificacao)
      .set({ lida: true })
      .where(and(eq(notificacao.usuarioId, context.usuario.id), eq(notificacao.lida, false)))

    barramento.emitir({
      tipo: 'mudanca',
      escopo: 'notificacao',
      paraUsuarioId: context.usuario.id,
    })

    return { ok: true }
  })
