import { createFileRoute, redirect } from '@tanstack/react-router'

import { BarraApp } from '#/components/barra-app'
import { FichaPersonagem } from '#/components/ficha/ficha'
import { buscarFicha } from '#/server/personagens'

export const Route = createFileRoute('/personagens/$id/')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    return { usuario: context.usuario }
  },
  loader: async ({ params }) => {
    try {
      return await buscarFicha({ data: { id: params.id } })
    } catch {
      throw redirect({ to: '/' })
    }
  },
  component: TelaFicha,
})

function TelaFicha() {
  const personagem = Route.useLoaderData()

  return (
    <FichaPersonagem
      // Recarregar a Ficha (outro Personagem ou dados novos) recomeça as marcas locais.
      key={`${personagem.id}:${JSON.stringify(personagem.ficha)}`}
      {...personagem}
      barra={
        <BarraApp
          acoes={
            personagem.acesso === 'editar'
              ? [{ rotulo: 'Editar', link: { to: '/personagens/$id/editar', params: { id: personagem.id } } }]
              : []
          }
        />
      }
    />
  )
}
