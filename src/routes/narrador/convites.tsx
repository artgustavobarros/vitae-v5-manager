import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Copy, KeyRound, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { gerarSenhaNova, listarJogadores } from '#/server/conta'
import { cancelarConvite, gerarConvite, listarConvites } from '#/server/convites'

export const Route = createFileRoute('/narrador/convites')({
  beforeLoad: ({ context }) => {
    if (context.usuario?.papel !== 'narrador') throw redirect({ to: '/' })
  },
  loader: async () => {
    const [convites, jogadores] = await Promise.all([listarConvites(), listarJogadores()])
    return { convites, jogadores }
  },
  component: Convites,
})

function linkDoConvite(token: string): string {
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

function Convites() {
  const { convites, jogadores } = Route.useLoaderData()
  const router = useRouter()
  const [gerando, setGerando] = useState(false)
  const [senhaGerada, setSenhaGerada] = useState<{ nome: string; senha: string } | null>(null)

  return (
    <main className="mx-auto min-h-dvh max-w-3xl">
      <BarraApp />
      <div className="flex flex-col gap-4 px-4 pt-2 pb-12">
        <h1 className="font-serif text-display text-balance">Convites para a Crônica</h1>
        <p className="text-sm text-muted-foreground">
          Cada Convite para a Crônica é um link que vale para um só cadastro. Gere um por Jogador e envie como preferir.
        </p>
        <div>
          <Button
            disabled={gerando}
            onClick={async () => {
              setGerando(true)
              try {
                const { token } = await gerarConvite()
                await router.invalidate()
                await copiar(linkDoConvite(token), 'Convite para a Crônica gerado e link copiado.')
              } finally {
                setGerando(false)
              }
            }}
          >
            Gerar Convite para a Crônica
          </Button>
        </div>

        {convites.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum Convite para a Crônica esperando cadastro.</p>
        ) : (
          <ul className="divide-y border-y">
            {convites.map((c) => (
              <li key={c.id} className="flex min-h-14 items-center gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <Input readOnly value={`/convite/${c.token}`} aria-label="Link do Convite para a Crônica" className="text-xs" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Gerado em {new Date(c.criadoEm).toLocaleDateString('pt-BR')} · esperando cadastro
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Copiar link do Convite para a Crônica"
                  onClick={() => void copiar(linkDoConvite(c.token), 'Link copiado.')}
                >
                  <Copy />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Cancelar Convite para a Crônica"
                  onClick={async () => {
                    await cancelarConvite({ data: { id: c.id } })
                    await router.invalidate()
                  }}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mt-4 font-serif text-2xl">Jogadores</h2>
        {jogadores.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum Jogador na Crônica ainda.</p>
        ) : (
          <ul className="divide-y border-y">
            {jogadores.map((j) => (
              <li key={j.id} className="flex min-h-14 items-center justify-between gap-2 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-base">{j.nome}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {j.temSenha ? `@${j.nomeUsuario}` : 'Entra com Google'}
                  </span>
                </span>
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
                    Gerar senha nova
                  </Button>
                )}
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
