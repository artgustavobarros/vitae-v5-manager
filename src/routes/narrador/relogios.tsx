import { createFileRoute, redirect } from '@tanstack/react-router'

import { TelaRelogios } from '#/routes/relogios'
import { carregarRelogios } from '#/server/relogios'

export const Route = createFileRoute('/narrador/relogios')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    if (context.usuario.papel !== 'narrador') throw redirect({ to: '/relogios' })
  },
  loader: () => carregarRelogios(),
  head: () => ({ meta: [{ title: 'Relógios do Narrador — Vitae' }] }),
  component: PaginaRelogiosNarrador,
})

function PaginaRelogiosNarrador() {
  return <TelaRelogios relogios={Route.useLoaderData()} narrador />
}
