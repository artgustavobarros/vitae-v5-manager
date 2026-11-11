import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { CardRelogio } from '#/components/relogios/card-relogio'
import { Card, CardContent } from '#/components/ui/card'

const publico = getRouteApi('/publico/$token')

export const Route = createFileRoute('/publico/$token/relogios')({ component: PaginaRelogiosPublicos })

function PaginaRelogiosPublicos() {
  const dados = publico.useLoaderData()
  if (!dados.valido) return null
  return <section className="space-y-6" aria-label="Relógios">
    <h1 className="font-serif text-4xl">Relógios</h1>
    {dados.relogios.length === 0 ? <Card><CardContent className="space-y-2 py-8 text-center">
      <h2 className="font-serif text-2xl">Nenhum Relógio visível</h2>
      <p className="text-sm text-muted-foreground">Os Relógios que o Narrador revelar aparecerão aqui.</p>
    </CardContent></Card> : <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
      {dados.relogios.map((relogio) => <CardRelogio key={relogio.id} relogio={relogio} narrador={false} />)}
    </div>}
  </section>
}
