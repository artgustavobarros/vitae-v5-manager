import { createFileRoute, redirect } from '@tanstack/react-router'

import { VisaoNarrador } from '#/routes/combate'
import { listarModelosBestiario } from '#/server/bestiario'
import { carregarCombate, listarCoteriesParaCombate, listarPersonagensParaCombate } from '#/server/combate'
import { listarPreCombates } from '#/server/pre-combate'

export const Route = createFileRoute('/narrador/combate')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    if (context.usuario.papel !== 'narrador') throw redirect({ to: '/combate' })
  },
  loader: async () => {
    const [dados, modelos, personagens, preCombates, coteries] = await Promise.all([
      carregarCombate(), listarModelosBestiario(), listarPersonagensParaCombate(), listarPreCombates(), listarCoteriesParaCombate(),
    ])
    if (dados.papel !== 'narrador') throw new Error('Acesso negado')
    return { combate: dados.combate, modelos, personagens, preCombates, coteries }
  },
  head: () => ({ meta: [{ title: 'Combate do Narrador — Vitae' }] }),
  component: PaginaCombateNarrador,
})

function PaginaCombateNarrador() {
  return <VisaoNarrador {...Route.useLoaderData()} />
}
