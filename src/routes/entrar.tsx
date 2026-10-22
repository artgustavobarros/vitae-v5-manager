import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState, type CSSProperties } from 'react'
import { z } from 'zod'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
import { authClient } from '#/lib/auth-client'

const SEM_CONVITE =
  'Não foi possível entrar com essa conta. Se você é Jogador, peça ao Narrador um Convite para a Crônica com o seu e-mail.'

const ERROS_LOGIN: Record<string, string> = {
  sem_convite: SEM_CONVITE,
  unable_to_create_user: SEM_CONVITE,
  failed_to_create_user: SEM_CONVITE,
  account_not_linked:
    'Já existe uma conta com esse e-mail criada de outro jeito. Entre pelo método que você usou da primeira vez.',
}

function mensagemErro(codigo: string): string {
  return ERROS_LOGIN[codigo.toLowerCase()] ?? `Não foi possível entrar (erro: ${codigo}).`
}

export const Route = createFileRoute('/entrar')({
  validateSearch: z.object({ error: z.string().optional() }),
  beforeLoad: ({ context }) => {
    if (context.usuario) throw redirect({ to: '/' })
  },
  component: Entrar,
})

function Entrar() {
  const { error } = Route.useSearch()

  return (
    <main
      className="topo-fome flex min-h-dvh flex-col justify-center px-4"
      style={{ '--fome-nivel': 2 } as CSSProperties}
    >
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <div>
          <h1 className="font-serif text-display">Umbra</h1>
          <p className="mt-1 text-sm text-muted-foreground">Fichas da Crônica</p>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{mensagemErro(error)}</AlertDescription>
          </Alert>
        )}
        <Button
          size="lg"
          onClick={() =>
            void authClient.signIn.social({
              provider: 'google',
              callbackURL: '/',
              errorCallbackURL: '/entrar',
            })
          }
        >
          Entrar com Google
        </Button>
        {import.meta.env.DEV && <LoginDev />}
      </div>
    </main>
  )
}

/** Só aparece em `pnpm dev`, para testar Narrador e Jogadores sem conta Google. */
function LoginDev() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(modo: 'entrar' | 'criar') {
    setErro(null)
    const { error } =
      modo === 'criar'
        ? await authClient.signUp.email({ name: nome || email, email, password: senha })
        : await authClient.signIn.email({ email, password: senha })
    if (error) {
      setErro(mensagemErro(error.message ?? error.code ?? 'desconhecido'))
      return
    }
    await router.invalidate()
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">login de desenvolvimento</span>
        <Separator className="flex-1" />
      </div>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          void enviar('entrar')
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="nome">Nome (só para criar conta)</Label>
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            required
            minLength={8}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        {erro && (
          <Alert variant="destructive">
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}
        <div className="flex gap-2">
          <Button type="submit" variant="secondary" className="flex-1">
            Entrar
          </Button>
          <Button type="button" variant="secondary" className="flex-1" onClick={() => void enviar('criar')}>
            Criar conta
          </Button>
        </div>
      </form>
    </>
  )
}
