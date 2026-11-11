import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { relogio } from '#/db/schema'
import type { EventoReal } from '#/domain/eventos'
import { filtrarEventoPublico } from '#/domain/exibicao-publica'
import { barramento } from './eventos'
import { validarLinkPublicoNoBanco } from './link-publico-db'
import { criarLimiteConexoes, respostaLimite } from './limites'

const reservar = criarLimiteConexoes(20)
const padrao = {
  validar: validarLinkPublicoNoBanco,
  relogiosVisiveis: async () => (await db.select({ id: relogio.id }).from(relogio).where(eq(relogio.visivel, true))).map((r) => r.id),
  escutar: (ouvinte: (evento: EventoReal) => void): (() => void) => barramento.escutar(ouvinte),
  reservar,
}

export async function abrirTempoRealPublico(request: Request, token: string, deps = padrao) {
  if (!await deps.validar(token)) return new Response('Link indisponível', { status: 404 })
  const liberar = deps.reservar('cronica')
  if (!liberar) return respostaLimite(20)
  const encoder = new TextEncoder()
  let encerrado = false
  let ping: ReturnType<typeof setInterval> | undefined
  let desinscrever: (() => void) | undefined
  let controller: ReadableStreamDefaultController<Uint8Array>

  function limpar() {
    if (encerrado) return
    encerrado = true
    liberar?.()
    clearInterval(ping)
    desinscrever?.()
    request.signal.removeEventListener('abort', encerrar)
  }
  function encerrar() {
    if (encerrado) return
    limpar()
    controller.close()
  }
  async function conferir() {
    if (encerrado) return false
    if (await deps.validar(token)) return !encerrado
    if (!encerrado) {
      controller.enqueue(encoder.encode('event: revogado\ndata: {}\n\n'))
      encerrar()
    }
    return false
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controle) {
      controller = controle
      controller.enqueue(encoder.encode(': conectado\n\n'))
      // Serializa a validação e os avisos para preservar sua ordem.
      let fila = Promise.resolve()
      desinscrever = deps.escutar((evento) => {
        fila = fila.then(async () => {
          if (!await conferir()) return
          const ids = evento.tipo === 'efeitos-relogio' ? await deps.relogiosVisiveis() : []
          const publico = filtrarEventoPublico(evento, ids)
          if (publico && await conferir()) controller.enqueue(encoder.encode(`data: ${JSON.stringify(publico)}\n\n`))
        }).catch(encerrar)
      })
      ping = setInterval(() => {
        fila = fila.then(async () => {
          if (await conferir()) controller.enqueue(encoder.encode(': ping\n\n'))
        }).catch(encerrar)
      }, 20_000)
      request.signal.addEventListener('abort', encerrar)
      if (request.signal.aborted) encerrar()
    },
    cancel: limpar,
  })
  return new Response(stream, { headers: {
    'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store, no-transform',
    'X-Accel-Buffering': 'no', 'Referrer-Policy': 'no-referrer',
  } })
}
