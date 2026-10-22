import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { criarConvite, listarConvites, removerConvite } from '#/server/convites'

export const Route = createFileRoute('/narrador/convites')({
  beforeLoad: ({ context }) => {
    if (context.usuario?.papel !== 'narrador') throw redirect({ to: '/' })
  },
  loader: () => listarConvites(),
  component: Convites,
})

function Convites() {
  const convites = Route.useLoaderData()
  const router = useRouter()
  const [email, setEmail] = useState('')

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-8">
      <Button variant="ghost" size="sm" className="self-start" asChild>
        <Link to="/">
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Convites para a Crônica</CardTitle>
          <CardDescription>
            Só entra no site quem tem convite. Use o e-mail da conta Google do Jogador.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            className="flex items-end gap-2"
            onSubmit={async (e) => {
              e.preventDefault()
              await criarConvite({ data: { email } })
              setEmail('')
              await router.invalidate()
            }}
          >
            <div className="grid flex-1 gap-2">
              <Label htmlFor="email-convite">E-mail</Label>
              <Input
                id="email-convite"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jogador@gmail.com"
              />
            </div>
            <Button type="submit">Convidar</Button>
          </form>

          {convites.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum convite ainda.</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {convites.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 py-1 pl-3 pr-1">
                  <span className="truncate text-sm">{c.email}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover convite de ${c.email}`}
                    onClick={async () => {
                      await removerConvite({ data: { id: c.id } })
                      await router.invalidate()
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
