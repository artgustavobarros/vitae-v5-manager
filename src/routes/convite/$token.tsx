import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState, type CSSProperties } from 'react'
import { z } from 'zod'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { InputSenha } from '#/components/ui/input-senha'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'
import { validarNomeUsuario } from '#/domain/convite'
import { DOMINIO_EMAIL_SINTETICO } from '#/lib/cadastro'
import { authClient } from '#/lib/auth-client'
import { mensagemErroAuth } from '#/lib/erros-auth'
import { prepararCadastro, verConvite } from '#/server/convites'

export const Route = createFileRoute('/convite/$token')({
  validateSearch: z.object({ error: z.string().optional() }),
  beforeLoad: ({ context }) => {
    if (context.usuario) throw redirect({ to: '/' })
  },
  loader: ({ params }) => verConvite({ data: { token: params.token } }),
  component: Convite,
})

function Convite() {
  const { estado } = Route.useLoaderData()
  const { token } = Route.useParams()
  const { error } = Route.useSearch()

  return (
    <main
      className="topo-fome flex min-h-dvh flex-col justify-center px-4"
      style={{ '--fome-nivel': 2 } as CSSProperties}
    >
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <div>
          <h1 className="font-serif text-display">Umbra</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {estado === 'valido' ? 'Você foi convidado para a Crônica.' : 'Fichas da Crônica'}
          </p>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{mensagemErroAuth(error)}</AlertDescription>
          </Alert>
        )}
        {estado === 'valido' ? (
          <Cadastro token={token} />
        ) : (
          <>
            <Alert>
              <AlertDescription>
                {estado === 'substituido'
                  ? 'Este link da Crônica foi trocado por um novo. Se você já tem conta, entre normalmente; se não, peça o link novo ao Narrador.'
                  : 'Este link da Crônica não existe. Confira o endereço ou peça o link ao Narrador.'}
              </AlertDescription>
            </Alert>
            <Button asChild variant="secondary" size="lg">
              <Link to="/entrar">Ir para a tela de entrar</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  )
}

function Cadastro({ token }: { token: string }) {
  const router = useRouter()
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function criar() {
    setErro(null)
    const invalido = validarNomeUsuario(nomeUsuario)
    if (invalido) return setErro(invalido)
    if (senha !== confirmacao) return setErro('As duas senhas não são iguais.')
    setEnviando(true)
    try {
      await prepararCadastro({ data: { token } })
      // O e-mail é sintético: o servidor troca por um aleatório e ele nunca aparece.
      const { error } = await authClient.signUp.email({
        email: `cadastro@${DOMINIO_EMAIL_SINTETICO}`,
        password: senha,
        name: nomeUsuario,
        username: nomeUsuario,
      })
      if (error) return setErro(mensagemErroAuth(error))
      await router.navigate({ to: '/' })
    } catch (e) {
      console.error('Erro ao criar conta:', e)
      setErro(
        e instanceof Error && e.message === 'Failed to fetch'
          ? 'Erro de conexão com o servidor. Recarregue a página (F5) e tente novamente.'
          : e instanceof Error
            ? e.message
            : 'Não deu para criar a conta.',
      )
    } finally {
      setEnviando(false)
    }
  }

  async function google() {
    setErro(null)
    try {
      await prepararCadastro({ data: { token } })
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
        errorCallbackURL: `/convite/${token}`,
      })
    } catch (e) {
      console.error('Erro ao entrar com Google:', e)
      setErro(
        e instanceof Error && e.message === 'Failed to fetch'
          ? 'Erro de conexão com o servidor. Recarregue a página (F5) e tente novamente.'
          : e instanceof Error
            ? e.message
            : 'Não deu para entrar com Google.',
      )
    }
  }

  return (
    <>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          void criar()
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
          <p className="text-xs text-muted-foreground">Letras sem acento, números, ponto ou sublinhado.</p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="senha">Senha</Label>
          <InputSenha
            id="senha"
            autoComplete="new-password"
            required
            minLength={8}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmacao">Confirme a senha</Label>
          <InputSenha
            id="confirmacao"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
          />
        </div>
        {erro && (
          <Alert variant="destructive">
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" size="lg" disabled={enviando}>
          Criar conta
        </Button>
      </form>
      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">ou</span>
        <Separator className="flex-1" />
      </div>
      <Button size="lg" variant="secondary" disabled={enviando} onClick={() => void google()}>
        Entrar com Google
      </Button>
    </>
  )
}
