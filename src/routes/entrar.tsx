import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState, type CSSProperties } from 'react'
import { z } from 'zod'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { InputSenha } from '#/components/ui/input-senha'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
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
  const router = useRouter()
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [entrando, setEntrando] = useState(false)

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
            <AlertDescription>{mensagemErroAuth(error)}</AlertDescription>
          </Alert>
        )}
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setErro(null)
            setEntrando(true)
            const { error } = await authClient.signIn.username({ username: nomeUsuario, password: senha })
            setEntrando(false)
            if (error) return setErro(mensagemErroAuth(error))
            await router.invalidate()
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="nome-usuario">Nome de usuário</Label>
            <Input
              id="nome-usuario"
              autoComplete="username"
              autoCapitalize="none"
              required
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="senha">Senha</Label>
            <InputSenha
              id="senha"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          {erro && (
            <Alert variant="destructive">
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" size="lg" disabled={entrando}>
            Entrar
          </Button>
        </form>
        <Ou />
        <Button
          size="lg"
          variant="secondary"
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
        <p className="text-sm text-muted-foreground">
          Ainda não tem conta? Ela é criada pelo link de Convite para a Crônica que o Narrador envia.
        </p>
        {import.meta.env.DEV && <LoginNarradorDev />}
      </div>
    </main>
  )
}

function Ou() {
  return (
    <div className="flex items-center gap-2">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground">ou</span>
      <Separator className="flex-1" />
    </div>
  )
}

/** Só aparece em `pnpm dev`, para o Narrador entrar sem conta Google (e-mail do NARRADOR_EMAIL). */
function LoginNarradorDev() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(modo: 'entrar' | 'criar') {
    setErro(null)
    const { error } =
      modo === 'criar'
        ? await authClient.signUp.email({ name: 'Narrador', email, password: senha })
        : await authClient.signIn.email({ email, password: senha })
    if (error) return setErro(mensagemErroAuth(error))
    await router.invalidate()
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">Narrador, só em desenvolvimento</span>
        <Separator className="flex-1" />
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          void enviar('entrar')
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="email-dev">E-mail</Label>
          <Input id="email-dev" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="senha-dev">Senha</Label>
          <InputSenha
            id="senha-dev"
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
