import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
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
    <main className="mx-auto max-w-xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Olá, {usuario.nome}</CardTitle>
          <CardDescription>
            Você entrou como {usuario.papel === 'narrador' ? 'Narrador' : 'Jogador'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {usuario.papel === 'narrador' && (
            <Button asChild>
              <Link to="/narrador/convites">Convites para a Crônica</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={async () => {
              await authClient.signOut()
              await router.invalidate()
            }}
          >
            Sair
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
