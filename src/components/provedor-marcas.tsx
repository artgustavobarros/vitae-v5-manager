import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { SincronizacaoMarcas } from '#/lib/sincronizacao-marcas'
import { sincronizarMarcas } from '#/server/personagens'

const ContextoMarcas = createContext<SincronizacaoMarcas | null>(null)

/** A fila pertence à conta, e continua ativa durante a navegação entre telas. */
export function ProvedorMarcas({ usuarioId, children }: { usuarioId: string; children: ReactNode }) {
  const queryClient = useQueryClient()
  const [sincronizacao] = useState(() => new SincronizacaoMarcas({
    queryClient,
    usuarioId,
    enviar: (data) => sincronizarMarcas({ data, signal: AbortSignal.timeout(20_000) }),
  }))

  useEffect(() => {
    return () => sincronizacao.dispose()
  }, [sincronizacao])

  return <ContextoMarcas value={sincronizacao}>{children}</ContextoMarcas>
}

export function useSincronizacaoMarcas() {
  return useContext(ContextoMarcas)
}
