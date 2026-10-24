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

  barramento.emitir({
    tipo: 'notificacao',
    paraUsuarioId: usuarioId,
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
    paraUsuarioId: usuarioId,
  })
}

/**
 * Envia notificação a todos os Narradores da Crônica.
 */
export async function notificarNarradores({
  texto,
  destino,
}: {
  texto: string
  destino?: DestinoNotificacao
}) {
  const narradores = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.papel, 'narrador'))

  for (const n of narradores) {
    await enviarNotificacao({
      usuarioId: n.id,
      texto,
      destino,
    })
  }
}
