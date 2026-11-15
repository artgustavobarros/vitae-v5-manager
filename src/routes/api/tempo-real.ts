import { createFileRoute } from '@tanstack/react-router'

import { auth } from '#/lib/auth'
import { barramento, type EventoReal } from '#/server/eventos'
import { reservarConexaoTempoReal, respostaLimite } from '#/server/limites'

export const Route = createFileRoute('/api/tempo-real')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const sessao = await auth.api.getSession({ headers: request.headers })
        if (!sessao || sessao.user.papel !== 'narrador') {
          return new Response('Não autorizado', { status: 401 })
        }

        const usuarioId = sessao.user.id
        const liberarVaga = reservarConexaoTempoReal(usuarioId)
        if (!liberarVaga) return respostaLimite(20)

        const encoder = new TextEncoder()
        let intervalPing: NodeJS.Timeout | null = null
        let desinscrever: (() => void) | null = null

        const stream = new ReadableStream({
          start(controller) {
            const encerrar = () => {
              liberarVaga()
              if (intervalPing) clearInterval(intervalPing)
              if (desinscrever) desinscrever()
              try {
                controller.close()
              } catch {
                // já fechado
              }
            }

            controller.enqueue(encoder.encode(': conectado\n\n'))

            // A cada ping confere se a sessão do Narrador continua válida.
            intervalPing = setInterval(async () => {
              try {
                const ainda = await auth.api.getSession({ headers: request.headers })
                if (ainda?.user.id !== usuarioId || ainda.user.papel !== 'narrador') return encerrar()
                controller.enqueue(encoder.encode(': ping\n\n'))
              } catch {
                encerrar()
              }
            }, 20_000)

            desinscrever = barramento.escutar((evento: EventoReal) => {
              try {
                const payload = JSON.stringify(evento)
                controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
              } catch {
                // stream pode ter sido fechado
              }
            })

            request.signal.addEventListener('abort', encerrar)
            if (request.signal.aborted) encerrar()
          },
          cancel() {
            liberarVaga()
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
