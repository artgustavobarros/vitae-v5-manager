import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { notificacao, user, type DestinoNotificacao } from '#/db/schema'
import { barramento } from './eventos'

/**
 * Cria notificação persistida no banco e transmite em tempo real (SSE) para o usuário.
 */
export async function enviarNotificacao({
  usuarioId,
  texto,
  destino,
}: {
  usuarioId: string
  texto: string
  destino?: DestinoNotificacao
}) {
  const [salva] = await db
    .insert(notificacao)
    .values({
      usuarioId,
      texto,
      linkJson: destino,
    })
    .returning()

  publicarNotificacao(salva)
}

/** Publica uma notificação já persistida; execute depois de confirmar a transação. */
export function publicarNotificacao(salva: typeof notificacao.$inferSelect) {
  barramento.emitir({
    tipo: 'notificacao',
    paraUsuarioId: salva.usuarioId,
    notificacao: {
      id: salva.id,
      texto: salva.texto,
      quando: salva.criadoEm.toISOString(),
      lida: salva.lida,
      destino: salva.linkJson ?? undefined,
    },
  })

  barramento.emitir({
    tipo: 'mudanca',
    escopo: 'notificacao',
    paraUsuarioId: salva.usuarioId,
  })
}

/**
 * Envia notificação a todos os Narradores da Crônica, menos `exceto` (quem fez a ação).
 */
export async function notificarNarradores({
  texto,
  destino,
  exceto,
}: {
  texto: string
  destino?: DestinoNotificacao
  exceto?: string
}) {
  const narradores = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.papel, 'narrador'))

  for (const n of narradores) {
    if (n.id === exceto) continue
    await enviarNotificacao({
      usuarioId: n.id,
      texto,
      destino,
    })
  }
}
