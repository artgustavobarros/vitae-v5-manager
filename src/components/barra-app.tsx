import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

/** Barra do topo: marca Umbra em serifa à esquerda, contexto à direita. */
export function BarraApp({ direita }: { direita?: ReactNode }) {
  return (
    <header className="flex h-14 items-center justify-between px-4">
      <Link to="/" className="rounded-sm font-serif text-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Umbra
      </Link>
      {direita && <div className="text-sm text-muted-foreground">{direita}</div>}
    </header>
  )
}
