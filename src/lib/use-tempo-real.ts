import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import type { EventoReal } from '#/domain/eventos'

/**
 * Conecta ao fluxo SSE em /api/tempo-real enquanto o usuário estiver autenticado.
 * Invalida os dados das rotas ativas quando o estado persistido muda.
 */
export function useTempoReal(usuarioLogado: boolean) {
  const router = useRouter()

  useEffect(() => {
    if (!usuarioLogado || typeof window === 'undefined') return

    const fonte = new EventSource('/api/tempo-real')

    // O fluxo não repete eventos perdidos: a reconexão busca o estado confirmado.
    fonte.onopen = () => {
      void router.invalidate()
    }

    fonte.onmessage = (event) => {
      try {
        const dados: EventoReal = JSON.parse(event.data)

        if (dados.tipo === 'mudanca') void router.invalidate()
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
