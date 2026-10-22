import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

import { BarraApp } from '#/components/barra-app'
import { Button } from '#/components/ui/button'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    return { usuario: context.usuario }
  },
  component: Inicio,
})

function Inicio() {
  const { usuario } = Route.useRouteContext()
  const router = useRouter()

  return (
    <main className="mx-auto min-h-dvh max-w-3xl">
      <BarraApp
        direita={
          <Button
            variant="ghost"
            size="sm"
            className="-mr-3"
            onClick={async () => {
              await authClient.signOut()
              await router.invalidate()
            }}
          >
            Sair
          </Button>
        }
      />
      <div className="px-4 pt-2">
        <h1 className="font-serif text-display text-balance">Olá, {usuario.nome}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Você entrou como {usuario.papel === 'narrador' ? 'Narrador' : 'Jogador'}.
        </p>
        {usuario.papel === 'jogador' && (
          <section className="mt-8 border-y py-4">
            <h2 className="font-serif text-2xl">Nenhum Personagem ainda</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Seus Personagens aparecem aqui. A criação de Personagem chega na próxima etapa do Umbra; até lá,
              combine com o Narrador.
            </p>
            {import.meta.env.DEV && (
              <Button asChild variant="secondary" className="mt-4">
                <Link to="/demo/ficha">Ver Ficha de demonstração</Link>
              </Button>
            )}
          </section>
        )}
        {usuario.papel === 'narrador' && (
          <nav className="mt-8 border-y">
            <Link
              to="/narrador/convites"
              className="flex h-12 items-center justify-between text-base outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Convites para a Crônica
              <ChevronRight aria-hidden className="size-4 text-muted-foreground" />
            </Link>
          </nav>
        )}
      </div>
    </main>
  )
}
