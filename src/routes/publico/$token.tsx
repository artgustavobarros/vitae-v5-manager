import { createFileRoute, Link, Outlet, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { MarcaVitae } from '#/components/marca-vitae'
import { ProvedorAvisosRelogios, useAvisosRelogios } from '#/components/provedor-avisos-relogios'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { conectarExibicaoPublica } from '#/lib/conectar-exibicao-publica'
import { carregarExibicaoPublica } from '#/server/exibicao-publica'

export const Route = createFileRoute('/publico/$token')({
  loader: ({ params }) => carregarExibicaoPublica({ data: { token: params.token } }),
  head: () => ({ meta: [
    { title: 'Exibição da mesa — Vitae' }, { name: 'robots', content: 'noindex, nofollow, noarchive' },
    { name: 'referrer', content: 'no-referrer' },
  ] }),
  component: PaginaPublica,
  errorComponent: () => <LinkIndisponivel />,
})

function LinkIndisponivel() {
  return <main className="container-app mx-auto py-12">
    <Card><CardContent className="space-y-3 py-8 text-center">
      <h1 className="font-serif text-2xl">Exibição indisponível</h1>
      <p className="text-sm text-muted-foreground">O link foi revogado, substituído ou não pôde ser consultado. Peça o link atual ao Narrador.</p>
    </CardContent></Card>
  </main>
}

function PaginaPublica() {
  const dados = Route.useLoaderData()
  const { token } = Route.useParams()
  return dados.valido ? <ProvedorAvisosRelogios key={token}><ExibicaoConectada token={token} /></ProvedorAvisosRelogios> : <LinkIndisponivel />
}

function ExibicaoConectada({ token }: { token: string }) {
  const router = useRouter()
  const avisar = useAvisosRelogios()
  const [conectado, setConectado] = useState(false)
  const [revogado, setRevogado] = useState(false)

  useEffect(() => conectarExibicaoPublica(token, {
    atualizar: () => { void router.invalidate() },
    avisar: (avisos) => avisar?.(avisos),
    revogar: () => { setRevogado(true); void router.invalidate() },
    conexao: setConectado,
  }), [token, router, avisar])

  if (revogado) return <LinkIndisponivel />
  return <main className="container-app mx-auto min-h-dvh space-y-6 pb-12">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b py-4">
      <MarcaVitae />
      <nav className="flex gap-2" aria-label="Exibição da mesa">
        <Button asChild variant="outline"><Link to="/publico/$token/combate" params={{ token }}>Combate</Link></Button>
        <Button asChild variant="outline"><Link to="/publico/$token/relogios" params={{ token }}>Relógios</Link></Button>
      </nav>
      <p role="status" className="text-xs text-muted-foreground">{conectado ? 'Visão pública · Somente leitura' : 'Reconectando… Os dados podem estar desatualizados.'}</p>
    </header>
    <Outlet />
  </main>
}
