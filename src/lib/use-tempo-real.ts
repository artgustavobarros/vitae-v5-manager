import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { toast } from 'sonner'

import type { EventoReal } from '#/domain/eventos'

/**
 * Conecta ao fluxo SSE em /api/tempo-real enquanto o usuário estiver autenticado.
 * Invalida dados de rotas ativas do roteador quando dados mudam e exibe toasts para novas notificações.
 */
export function useTempoReal(usuarioLogado: boolean) {
  const router = useRouter()

  useEffect(() => {
    if (!usuarioLogado || typeof window === 'undefined') return

    const fonte = new EventSource('/api/tempo-real')

    fonte.onmessage = (event) => {
      try {
        const dados: EventoReal = JSON.parse(event.data)

        if (dados.tipo === 'notificacao') {
          toast(dados.notificacao.texto)
          router.invalidate()
        } else if (dados.tipo === 'mudanca') {
          router.invalidate()
        }
      } catch {
        // payload não json (ex: ping/comentário)
      }
    }

    fonte.onerror = () => {
      // EventSource reconecta automaticamente
    }

    return () => {
      fonte.close()
    }
  }, [usuarioLogado, router])
}
