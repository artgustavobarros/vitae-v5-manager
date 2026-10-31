import { createFileRoute, redirect } from '@tanstack/react-router'

import { PaginaAntagonistas } from '#/components/antagonistas'
import { listarModelosBestiario } from '#/server/bestiario'

export const Route = createFileRoute('/narrador/antagonistas')({
  beforeLoad: ({ context }) => {
    if (!context.usuario || context.usuario.papel !== 'narrador') throw redirect({ to: '/' })
  },
  loader: () => listarModelosBestiario(),
  component: Antagonistas,
})

function Antagonistas() {
  return <PaginaAntagonistas modelos={Route.useLoaderData()} />
}
