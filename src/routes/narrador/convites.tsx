import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Copy, KeyRound, RefreshCw, UserMinus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { AvatarUsuario } from '#/components/avatar-usuario'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { gerarSenhaNova, listarJogadores, removerJogador } from '#/server/conta'
import { buscarLinkDaCronica, gerarNovoLink } from '#/server/convites'

export const Route = createFileRoute('/narrador/convites')({
  beforeLoad: ({ context }) => {
    if (context.usuario?.papel !== 'narrador') throw redirect({ to: '/' })
  },
  loader: async () => {
    const [link, jogadores] = await Promise.all([buscarLinkDaCronica(), listarJogadores()])
    return { link, jogadores }
  },
  component: Jogadores,
})

function enderecoDoLink(token: string): string {
  return `${window.location.origin}/convite/${token}`
}

async function copiar(texto: string, aviso: string) {
  try {
    await navigator.clipboard.writeText(texto)
    toast.success(aviso)
  } catch {
    toast.error('Não deu para copiar. Selecione o texto e copie à mão.')
  }
}

function Jogadores() {
  const { link, jogadores } = Route.useLoaderData()
  const router = useRouter()
  const [gerando, setGerando] = useState(false)
  const [senhaGerada, setSenhaGerada] = useState<{ nome: string; senha: string } | null>(null)

  async function gerar() {
    setGerando(true)
    try {
      const { token } = await gerarNovoLink()
      await router.invalidate()
      await copiar(enderecoDoLink(token), 'Link novo gerado e copiado. O anterior não vale mais.')
    } finally {
      setGerando(false)
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp />
      <div className="flex flex-col gap-4 pt-2 pb-12">
        <h1 className="font-serif text-display text-balance">Jogadores</h1>

        <h2 className="mt-4 font-serif text-2xl">Convite para a Crônica</h2>
        <p className="text-sm text-muted-foreground">
          Um link só para a mesa: quem tiver o link cria conta como Jogador. Se ele vazar, gere um novo e o anterior para de
          valer.
        </p>
        {link ? (
          <>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`/convite/${link.token}`}
                aria-label="Link do Convite para a Crônica"
                className="text-xs"
              />
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label="Copiar link do Convite para a Crônica"
                onClick={() => void copiar(enderecoDoLink(link.token), 'Link copiado.')}
              >
                <Copy />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Gerado em {new Date(link.criadoEm).toLocaleDateString('pt-BR')}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" className="self-start" disabled={gerando}>
                  <RefreshCw />
                  Gerar novo link
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Gerar novo link?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O link atual para de valer na hora. Quem já tem conta continua entrando normalmente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void gerar()}>Gerar novo link</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <Button className="self-start" disabled={gerando} onClick={() => void gerar()}>
            Gerar link da Crônica
          </Button>
        )}

        <h2 className="mt-8 font-serif text-2xl">Na Crônica</h2>
        {jogadores.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum Jogador na Crônica ainda.</p>
        ) : (
          <ul className="divide-y border-y">
            {jogadores.map((j) => (
              <li key={j.id} className="flex min-h-14 items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <AvatarUsuario nome={j.nome} imagem={j.imagem} />
                  <span className="min-w-0">
                    <span className="block truncate text-base">{j.nome}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {!j.temSenha ? 'Entra com Google' : j.nomeUsuario ? `@${j.nomeUsuario}` : 'Sem nome de usuário'}
                    </span>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                {j.temSenha && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      try {
                        const { senha } = await gerarSenhaNova({ data: { userId: j.id } })
                        setSenhaGerada({ nome: j.nome, senha })
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Não deu para gerar a senha.')
                      }
                    }}
                  >
                    <KeyRound />
                    Senha nova
                  </Button>
                )}
                <RemoverJogador
                  id={j.id}
                  nome={j.nome}
                  onRemovido={() => router.invalidate()}
                />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={senhaGerada !== null} onOpenChange={(aberto) => !aberto && setSenhaGerada(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Senha nova de {senhaGerada?.nome}</AlertDialogTitle>
            <AlertDialogDescription>
              Ela aparece só agora. Passe para o Jogador; ele pode trocar em Configurações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <p className="rounded-md border p-4 text-center font-mono text-xl tracking-widest select-all">
            {senhaGerada?.senha}
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => senhaGerada && void copiar(senhaGerada.senha, 'Senha copiada.')}>
              Copiar
            </AlertDialogCancel>
            <AlertDialogAction>Pronto</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

function RemoverJogador({ id, nome, onRemovido }: { id: string; nome: string; onRemovido: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-lg" aria-label={`Remover ${nome} da Crônica`}>
          <UserMinus />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover {nome} da Crônica?</AlertDialogTitle>
          <AlertDialogDescription>
            A conta é apagada e a pessoa não entra mais. Os Personagens dela passam para você: os Ativos viram PdNs e os
            Rascunhos ficam como Rascunhos seus. Não dá para desfazer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={async () => {
              try {
                await removerJogador({ data: { userId: id } })
                toast.success(`${nome} saiu da Crônica.`)
                onRemovido()
              } catch (erro) {
                toast.error(erro instanceof Error ? erro.message : 'Não deu para remover o Jogador.')
              }
            }}
          >
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
