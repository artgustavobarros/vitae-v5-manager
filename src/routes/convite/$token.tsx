import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { useState, type CSSProperties } from 'react'
import { z } from 'zod'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { MarcaVitae } from '#/components/marca-vitae'
import { authClient } from '#/lib/auth-client'
import { mensagemErroAuth } from '#/lib/erros-auth'
import { prepararCadastro, verConvite } from '#/server/convites'

export const Route = createFileRoute('/convite/$token')({
  validateSearch: z.object({ error: z.string().optional() }),
  loader: async ({ params, context }) => {
    if (context.usuario) throw redirect({ to: '/' })
    return await verConvite({ data: { token: params.token } })
  },
  head: ({ params }) => ({
    meta: [
      { title: 'Convite para uma Crônica | Vitae' },
      { name: 'description', content: 'Você recebeu um convite para uma Crônica de Vampiro: A Máscara.' },
      { property: 'og:title', content: 'Você foi convidado para uma Crônica' },
      { property: 'og:description', content: 'Entre na mesa de Vampiro: A Máscara com seu convite Vitae.' },
      { property: 'og:url', content: `https://vitae.artbarros.tech/convite/${params.token}` },
      { name: 'twitter:title', content: 'Você foi convidado para uma Crônica' },
      { name: 'twitter:description', content: 'Entre na mesa de Vampiro: A Máscara com seu convite Vitae.' },
    ],
  }),
  component: Convite,
})

function Convite() {
  const { estado } = Route.useLoaderData() as Awaited<ReturnType<typeof verConvite>>
  const { token } = Route.useParams()
  const { error } = Route.useSearch()

  return (
    <main
      className="topo-fome flex min-h-dvh flex-col justify-center px-4"
      style={{ '--fome-nivel': 2 } as CSSProperties}
    >
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <div>
          <h1 aria-label="Vitae"><MarcaVitae tamanho="grande" /></h1>
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
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function google() {
    setErro(null)
    setEnviando(true)
    try {
      await prepararCadastro({ data: { token } })
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
        errorCallbackURL: `/convite/${token}`,
      })
      if (error) setErro(mensagemErroAuth(error))
    } catch (e) {
      setErro(
        e instanceof Error && e.message === 'Failed to fetch'
          ? 'Erro de conexão com o servidor. Recarregue a página (F5) e tente novamente.'
          : e instanceof Error
            ? e.message
            : 'Não deu para entrar com Google.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">Crie sua conta com o Google para entrar na Crônica.</p>
      {erro && (
        <Alert variant="destructive">
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}
      <Button size="lg" disabled={enviando} onClick={() => void google()}>
        Entrar com Google
      </Button>
    </>
  )
}
