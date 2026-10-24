import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { validarNomeUsuario } from '#/domain/convite'
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
    <main className="mx-auto min-h-dvh max-w-3xl">
      <BarraApp />
      <div className="flex flex-col gap-8 px-4 pt-2 pb-12">
        <h1 className="font-serif text-display text-balance">Configurações</h1>
        {conta.temSenha ? (
          <>
            <TrocarNomeUsuario atual={conta.nomeUsuario ?? ''} />
            <TrocarSenha />
          </>
        ) : (
          <>
            <TrocarNome atual={conta.nome} />
            <section className="flex flex-col gap-2">
              <h2 className="font-serif text-2xl">Senha</h2>
              <p className="text-sm text-muted-foreground">
                Sua conta entra pelo Google, então não tem senha aqui. Para mudar a senha, mude a da conta Google.
              </p>
            </section>
          </>
        )}
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

function TrocarNomeUsuario({ atual }: { atual: string }) {
  const router = useRouter()
  const [nome, setNome] = useState(atual)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        const invalido = validarNomeUsuario(nome)
        if (invalido) return setErro(invalido)
        setErro(null)
        setSalvando(true)
        // Em conta por senha, o nome na Crônica é o próprio nome de usuário.
        const { error } = await authClient.updateUser({ username: nome, name: nome })
        setSalvando(false)
        if (error) return setErro(mensagemErroAuth(error))
        toast.success('Nome de usuário trocado.')
        await router.invalidate()
      }}
    >
      <h2 className="font-serif text-2xl">Nome de usuário</h2>
      <div className="grid gap-2">
        <Label htmlFor="nome-usuario">Nome de usuário</Label>
        <Input
          id="nome-usuario"
          autoComplete="username"
          autoCapitalize="none"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">É com ele que você entra. Também é seu nome na Crônica.</p>
      </div>
      <Erro mensagem={erro} />
      <div>
        <Button type="submit" disabled={salvando || nome === atual}>
          Salvar nome de usuário
        </Button>
      </div>
    </form>
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

function TrocarSenha() {
  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        if (nova !== confirmacao) return setErro('As duas senhas novas não são iguais.')
        setErro(null)
        setSalvando(true)
        const { error } = await authClient.changePassword({
          currentPassword: atual,
          newPassword: nova,
          revokeOtherSessions: true,
        })
        setSalvando(false)
        if (error) return setErro(mensagemErroAuth(error))
        setAtual('')
        setNova('')
        setConfirmacao('')
        toast.success('Senha trocada. Os outros aparelhos saíram da conta.')
      }}
    >
      <h2 className="font-serif text-2xl">Senha</h2>
      <div className="grid gap-2">
        <Label htmlFor="senha-atual">Senha atual</Label>
        <Input
          id="senha-atual"
          type="password"
          autoComplete="current-password"
          required
          value={atual}
          onChange={(e) => setAtual(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="senha-nova">Senha nova</Label>
        <Input
          id="senha-nova"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={nova}
          onChange={(e) => setNova(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="senha-confirmacao">Confirme a senha nova</Label>
        <Input
          id="senha-confirmacao"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
        />
      </div>
      <Erro mensagem={erro} />
      <div>
        <Button type="submit" disabled={salvando}>
          Trocar senha
        </Button>
      </div>
    </form>
  )
}
