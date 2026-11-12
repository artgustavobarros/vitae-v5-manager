import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { authClient } from '#/lib/auth-client'
import { mensagemErroAuth } from '#/lib/erros-auth'
import { buscarConta } from '#/server/conta'

export const Route = createFileRoute('/conta')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
  },
  loader: () => buscarConta(),
  component: Conta,
})

function Conta() {
  const conta = Route.useLoaderData()

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp />
      <div className="flex flex-col gap-8 pt-2 pb-12">
        <h1 className="font-serif text-display text-balance">Configurações</h1>
        <TrocarNome atual={conta.nome} />
        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl">Conta Google</h2>
          <p className="text-sm text-muted-foreground">
            O acesso é somente pelo Google. Para mudar sua senha, use as configurações da sua conta Google.
          </p>
        </section>
      </div>
    </main>
  )
}

function Erro({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null
  return (
    <Alert variant="destructive">
      <AlertDescription>{mensagem}</AlertDescription>
    </Alert>
  )
}

function TrocarNome({ atual }: { atual: string }) {
  const router = useRouter()
  const [nome, setNome] = useState(atual)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        setErro(null)
        setSalvando(true)
        const { error } = await authClient.updateUser({ name: nome.trim() })
        setSalvando(false)
        if (error) return setErro(mensagemErroAuth(error))
        toast.success('Nome trocado.')
        await router.invalidate()
      }}
    >
      <h2 className="font-serif text-2xl">Nome</h2>
      <div className="grid gap-2">
        <Label htmlFor="nome">Nome na Crônica</Label>
        <Input id="nome" required maxLength={60} value={nome} onChange={(e) => setNome(e.target.value)} />
        <p className="text-xs text-muted-foreground">Começa com o nome da sua conta Google.</p>
      </div>
      <Erro mensagem={erro} />
      <div>
        <Button type="submit" disabled={salvando || nome.trim() === '' || nome === atual}>
          Salvar nome
        </Button>
      </div>
    </form>
  )
}
