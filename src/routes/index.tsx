import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import { BarraApp } from '#/components/barra-app'
import { BotaoNovoPersonagem } from '#/components/botao-novo-personagem'
import { ListaPersonagens } from '#/components/lista-personagens'
import { PersonagensAtribuidos } from '#/components/personagens-atribuidos'
import { listarAtribuidosAMim, listarMeusPersonagens } from '#/server/personagens'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    return { usuario: context.usuario }
  },
  loader: async ({ context }) => {
    if (context.usuario.papel !== 'jogador') return { personagens: [], atribuidos: [] }
    const [personagens, atribuidos] = await Promise.all([listarMeusPersonagens(), listarAtribuidosAMim()])
    return { personagens, atribuidos }
  },
  component: Inicio,
})

function Inicio() {
  const { usuario } = Route.useRouteContext()
  const { personagens, atribuidos } = Route.useLoaderData()
  const router = useRouter()

  return (
    <main className="mx-auto min-h-dvh max-w-3xl">
      <BarraApp />
      <div className="px-4 pt-2">
        <h1 className="font-serif text-display text-balance">Olá, {usuario.nome}</h1>
        {usuario.papel === 'jogador' && (
          <div className="mt-8 flex flex-col gap-8 pb-12">
          <PersonagensAtribuidos itens={atribuidos} onRespondido={() => router.invalidate()} />
          <section className="flex flex-col gap-4">
            <h2 className="font-serif text-2xl">Meus Personagens</h2>
            {personagens.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum Personagem ainda. Crie o primeiro: ele começa como Rascunho, com os valores do Neófito.
              </p>
            ) : (
              <ListaPersonagens
                itens={personagens}
                onApagado={() => router.invalidate()}
              />
            )}
            <div>
              <BotaoNovoPersonagem rotulo="Novo Personagem" />
            </div>
          </section>
          </div>
        )}
        {usuario.papel === 'narrador' && (
          <nav className="mt-8 divide-y border-y">
            <Link
              to="/narrador/personagens"
              className="flex h-12 items-center justify-between text-base outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Personagens
              <ChevronRight aria-hidden className="size-4 text-muted-foreground" />
            </Link>
            <Link
              to="/narrador/convites"
              className="flex h-12 items-center justify-between text-base outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Jogadores e Convite para a Crônica
              <ChevronRight aria-hidden className="size-4 text-muted-foreground" />
            </Link>
          </nav>
        )}
      </div>
    </main>
  )
}
