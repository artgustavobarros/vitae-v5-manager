import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { BarraApp } from '#/components/barra-app'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { InputSenha } from '#/components/ui/input-senha'
import { Label } from '#/components/ui/label'
import { validarNomeUsuario } from '#/domain/convite'
import { authClient } from '#/lib/auth-client'
import { mensagemErroAuth } from '#/lib/erros-auth'
import { buscarConta, desconectarGoogle } from '#/server/conta'

export const Route = createFileRoute('/conta')({
  // Volta do Google: `google=conectado` no sucesso, `error=<código>` na falha.
  validateSearch: z.object({ google: z.literal('conectado').optional(), error: z.string().optional() }),
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
  },
  loader: () => buscarConta(),
  component: Conta,
})

function Conta() {
  const conta = Route.useLoaderData()
  const { google, error } = Route.useSearch()
  const navigate = Route.useNavigate()

  // O erro já foi para o estado de ConectarGoogle; limpa a URL para não repetir no recarregar.
  useEffect(() => {
    if (google === 'conectado') toast.success('Google conectado. Agora você também pode entrar com ele.')
    if (google || error) void navigate({ search: {}, replace: true })
  }, [google, error, navigate])

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp />
      <div className="flex flex-col gap-8 pt-2 pb-12">
        <h1 className="font-serif text-display text-balance">Configurações</h1>
        {conta.temSenha ? (
          <>
            <TrocarNomeUsuario atual={conta.nomeUsuario ?? ''} />
            <TrocarSenha />
            <ConectarGoogle conectado={conta.temGoogle} erroVolta={error ?? null} />
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

function ConectarGoogle({ conectado, erroVolta }: { conectado: boolean; erroVolta: string | null }) {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(erroVolta ? mensagemErroAuth(erroVolta) : null)
  const [enviando, setEnviando] = useState(false)

  async function conectar() {
    setErro(null)
    setEnviando(true)
    // Sai do site para o Google; volta em /conta com `google=conectado` ou `error=<código>`.
    const { error } = await authClient.linkSocial({
      provider: 'google',
      callbackURL: '/conta?google=conectado',
      errorCallbackURL: '/conta',
    })
    if (error) {
      setEnviando(false)
      setErro(mensagemErroAuth(error))
    }
  }

  async function desconectar() {
    setErro(null)
    setEnviando(true)
    try {
      await desconectarGoogle()
      toast.success('Google desconectado. Você entra só com nome de usuário e senha.')
      await router.invalidate()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para desconectar o Google.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl">Google</h2>
      <p className="text-sm text-muted-foreground">
        {conectado
          ? 'Sua conta Google está conectada. Você entra com ela ou com nome de usuário e senha.'
          : 'Conecte sua conta Google para também entrar com ela, sem digitar a senha. Seu nome na Crônica não muda.'}
      </p>
      <Erro mensagem={erro} />
      <div>
        {conectado ? (
          <Button variant="secondary" disabled={enviando} onClick={() => void desconectar()}>
            Desconectar
          </Button>
        ) : (
          <Button variant="secondary" disabled={enviando} onClick={() => void conectar()}>
            Conectar ao Google
          </Button>
        )}
      </div>
    </section>
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
        <InputSenha
          id="senha-atual"
          autoComplete="current-password"
          required
          value={atual}
          onChange={(e) => setAtual(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="senha-nova">Senha nova</Label>
        <InputSenha
          id="senha-nova"
          autoComplete="new-password"
          required
          minLength={8}
          value={nova}
          onChange={(e) => setNova(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="senha-confirmacao">Confirme a senha nova</Label>
        <InputSenha
          id="senha-confirmacao"
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
