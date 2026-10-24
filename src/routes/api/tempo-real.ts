import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import { barramento, type EventoReal } from '#/server/eventos'

export const Route = createFileRoute('/api/tempo-real')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sessao = await auth.api.getSession({ headers: request.headers })
        if (!sessao) {
          return new Response('Não autorizado', { status: 401 })
        }

        const usuarioId = sessao.user.id
        const papel = sessao.user.papel

        const encoder = new TextEncoder()
        let intervalPing: NodeJS.Timeout | null = null
        let desinscrever: (() => void) | null = null

        const stream = new ReadableStream({
          start(controller) {
            const encerrar = () => {
              if (intervalPing) clearInterval(intervalPing)
              if (desinscrever) desinscrever()
              try {
                controller.close()
              } catch {
                // já fechado
              }
            }

            controller.enqueue(encoder.encode(': conectado\n\n'))

            // A cada ping confere a sessão: Jogador removido ou que saiu em outro aparelho para de receber eventos.
            intervalPing = setInterval(async () => {
              try {
                const ainda = await auth.api.getSession({ headers: request.headers })
                if (ainda?.user.id !== usuarioId) return encerrar()
                controller.enqueue(encoder.encode(': ping\n\n'))
              } catch {
                encerrar()
              }
            }, 20_000)

            desinscrever = barramento.escutar((evento: EventoReal) => {
              // Filtragem por destinatário
              if ('paraUsuarioId' in evento && evento.paraUsuarioId && evento.paraUsuarioId !== usuarioId) {
                return
              }
              if ('apenasNarrador' in evento && evento.apenasNarrador && papel !== 'narrador') {
                return
              }

              try {
                const payload = JSON.stringify(evento)
                controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
              } catch {
                // stream pode ter sido fechado
              }
            })

            request.signal.addEventListener('abort', encerrar)
          },
          cancel() {
            if (intervalPing) clearInterval(intervalPing)
            if (desinscrever) desinscrever()
          },
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
          },
        })
      },
    },
  },
})
