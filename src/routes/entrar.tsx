import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, type CSSProperties } from 'react'
import { z } from 'zod'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { MarcaVitae } from '#/components/marca-vitae'
import { authClient } from '#/lib/auth-client'
import { mensagemErroAuth } from '#/lib/erros-auth'

export const Route = createFileRoute('/entrar')({
  validateSearch: z.object({ error: z.string().optional() }),
  beforeLoad: ({ context }) => {
    if (context.usuario) throw redirect({ to: '/' })
  },
  component: Entrar,
})

function Entrar() {
  const { error } = Route.useSearch()
  const [erro, setErro] = useState<string | null>(null)
  const [entrando, setEntrando] = useState(false)
  const mensagem = erro ?? (error ? mensagemErroAuth(error) : null)

  async function entrar() {
    setErro(null)
    setEntrando(true)
    try {
      const { error } = await authClient.signIn.social({
        provider: 'google', callbackURL: '/', errorCallbackURL: '/entrar',
      })
      if (error) setErro(mensagemErroAuth(error))
    } catch {
      setErro('Não deu para conectar ao Google. Confira sua conexão e tente novamente.')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <main
      className="topo-fome flex min-h-dvh flex-col justify-center px-4"
      style={{ '--fome-nivel': 2 } as CSSProperties}
    >
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <h1 aria-label="Vitae"><MarcaVitae tamanho="grande" /></h1>
        {mensagem && (
          <Alert variant="destructive">
            <AlertDescription>{mensagem}</AlertDescription>
          </Alert>
        )}
        <Button className="rounded-full" size="lg" disabled={entrando} onClick={() => void entrar()}>
          Entrar com Google
        </Button>
      </div>
    </main>
  )
}
