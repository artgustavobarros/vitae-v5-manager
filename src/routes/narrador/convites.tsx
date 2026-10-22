import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { BarraApp } from '#/components/barra-app'
import { Button } from '#/components/ui/button'
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
    <main className="mx-auto min-h-dvh max-w-3xl">
      <BarraApp direita="Narrador" />
      <div className="flex flex-col gap-4 px-4 pt-2">
        <h1 className="font-serif text-display text-balance">Convites para a Crônica</h1>
        <p className="text-sm text-muted-foreground">
          Só entra no site quem tem convite. Use o e-mail da conta Google do Jogador.
        </p>
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
          <ul className="divide-y border-y">
            {convites.map((c) => (
              <li key={c.id} className="flex h-12 items-center justify-between gap-2">
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
      </div>
    </main>
  )
}
