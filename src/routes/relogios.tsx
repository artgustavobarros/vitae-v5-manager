import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Clock3, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { LinkExibicaoPublica } from '#/components/exibicao-publica/link-exibicao-publica'
import { CardRelogio } from '#/components/relogios/card-relogio'
import { FormularioRelogio } from '#/components/relogios/formulario-relogio'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import type { Relogio, RelogioSalvo } from '#/domain/relogios'
import { carregarRelogios, moverRelogio, retirarRelogio, salvarRelogio } from '#/server/relogios'

export const Route = createFileRoute('/relogios')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    if (context.usuario.papel === 'narrador') throw redirect({ to: '/narrador/relogios' })
    return { usuario: context.usuario }
  },
  loader: () => carregarRelogios(),
  head: () => ({ meta: [{ title: 'Relógios — Vitae' }] }),
  component: PaginaRelogios,
})

function PaginaRelogios() {
  const relogios = Route.useLoaderData()
  const { usuario } = Route.useRouteContext()
  return <TelaRelogios relogios={relogios} narrador={usuario.papel === 'narrador'} />
}

export function TelaRelogios({ relogios, narrador }: { relogios: RelogioSalvo[]; narrador: boolean }) {
  const router = useRouter()
  const [edicao, setEdicao] = useState<{ relogio: Relogio; revisao: number | null } | null>(null)
  const [retirada, setRetirada] = useState<RelogioSalvo | null>(null)
  const [ocupado, setOcupado] = useState(false)

  function criar() {
    setEdicao({ revisao: null, relogio: {
      id: crypto.randomUUID(), nome: '', tipo: 'Ameaça', descricao: '', total: 6, atual: 0,
      perigo: 'aumenta', visivel: true, efeitos: [],
    } })
  }

  async function executar(acao: () => Promise<void>) {
    setOcupado(true)
    try {
      await acao()
      await router.invalidate()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível alterar o Relógio.')
    } finally { setOcupado(false) }
  }

  async function salvar(dados: Relogio) {
    if (!edicao) return
    await executar(async () => {
      await salvarRelogio({ data: { relogio: dados, revisao: edicao.revisao } })
      setEdicao(null)
      toast.success('Relógio salvo')
    })
  }

  return (
    <main className="container-app mx-auto min-h-dvh">
      <BarraApp />
      <div className="space-y-6 pb-12 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-serif text-4xl">Relógios</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Ameaças, objetivos e prazos da Crônica. Os efeitos acompanham cada avanço ou recuo.</p>
          </div>
          {narrador && <div className="flex flex-wrap gap-2">
            <LinkExibicaoPublica recurso="relogios" />
            <Button disabled={ocupado} onClick={criar}><Plus className="size-4" />Novo Relógio</Button>
          </div>}
        </div>
        {relogios.length === 0 ? (
          <Card>
            <CardContent className="space-y-3 py-8 text-center">
              <Clock3 className="mx-auto size-12 text-muted-foreground" />
              <h2 className="font-serif text-xl">Nenhum Relógio por aqui</h2>
              <p className="text-sm text-muted-foreground">{narrador ? 'Crie um Relógio e escolha em qual etapa a história começa.' : 'Os Relógios que o Narrador compartilhar aparecerão aqui.'}</p>
              {narrador && <Button variant="outline" onClick={criar}><Plus className="size-4" />Criar primeiro Relógio</Button>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3" aria-busy={ocupado}>
            {relogios.map((relogio) => (
              <CardRelogio key={relogio.id} relogio={relogio} narrador={narrador} ocupado={ocupado}
                onEditar={() => setEdicao({ relogio, revisao: relogio.revisao })} onRetirar={() => setRetirada(relogio)}
                onMover={(delta) => { void executar(async () => { await moverRelogio({ data: { id: relogio.id, delta } }) }) }} />
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Zero e o limite não encerram um Relógio. Somente o Narrador pode retirá-lo.</p>
      </div>
      {edicao && <FormularioRelogio dados={edicao.relogio} novo={edicao.revisao === null}
        onChange={(relogio) => setEdicao({ ...edicao, relogio })}
        ocupado={ocupado} onSalvar={salvar} onFechar={() => setEdicao(null)} />}
      <AlertDialog open={Boolean(retirada)} onOpenChange={(aberto) => { if (!aberto && !ocupado) setRetirada(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirar Relógio?</AlertDialogTitle>
            <AlertDialogDescription>“{retirada?.nome}” e seus efeitos sairão da página para todos. Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={ocupado}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={ocupado} onClick={(event) => {
              event.preventDefault()
              if (retirada) void executar(async () => {
                await retirarRelogio({ data: { id: retirada.id } })
                setRetirada(null)
                toast.success('Relógio retirado')
              })
            }}>{ocupado ? 'Retirando…' : 'Retirar Relógio'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
