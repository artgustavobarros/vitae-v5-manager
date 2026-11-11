import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { CombatePublico } from '#/components/exibicao-publica/combate-publico'

const publico = getRouteApi('/publico/$token')

export const Route = createFileRoute('/publico/$token/combate')({ component: PaginaCombatePublico })

function PaginaCombatePublico() {
  const dados = publico.useLoaderData()
  return dados.valido ? <CombatePublico combate={dados.combate} /> : null
}
