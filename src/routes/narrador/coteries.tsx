import { Link, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { criarCoterie, listarMinhasCoteries } from '#/server/coteries'

export const Route = createFileRoute('/narrador/coteries')({
  beforeLoad: ({ context }) => {
    if (context.usuario?.papel !== 'narrador') throw redirect({ to: '/' })
  },
  loader: () => listarMinhasCoteries(),
  component: CoteriesNarrador,
})

function CoteriesNarrador() {
  const coteries = Route.useLoaderData()
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [conceito, setConceito] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return

    setSalvando(true)
    try {
      const nova = await criarCoterie({
        data: {
          nome: nome.trim(),
          conceito: conceito.trim() || null,
          caca: 0,
          abrigo: 0,
          porte: 0,
        },
      })
      toast.success(`Coterie ${nova.nome} criada.`)
      setNome('')
      setConceito('')
      setAberto(false)
      router.navigate({ to: '/coteries/$id', params: { id: nova.id } })
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Erro ao criar Coterie.')
      setSalvando(false)
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-3xl">
      <BarraApp />
      <div className="flex flex-col gap-6 px-4 pt-2 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-display text-balance">Coteries</h1>
            <p className="text-sm text-muted-foreground">Grupos de Personagens da Crônica.</p>
          </div>

          <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 size-4" />
                Nova Coterie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleCriar} className="flex flex-col gap-4">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl">Nova Coterie</DialogTitle>
                  <DialogDescription>
                    Crie um novo grupo para a Crônica. Membros e convites podem ser adicionados em seguida.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: O Grupo, Anarquistas da Lapa"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="conceito">Conceito ou território (opcional)</Label>
                  <Input
                    id="conceito"
                    value={conceito}
                    onChange={(e) => setConceito(e.target.value)}
                    placeholder="Ex: Guardiões do Elísio"
                  />
                </div>

                <DialogFooter className="mt-2">
                  <Button type="button" variant="outline" onClick={() => setAberto(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={salvando || !nome.trim()}>
                    {salvando ? 'Criando...' : 'Criar Coterie'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="divide-y border-y">
          {coteries.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">Nenhuma Coterie cadastrada.</p>
          ) : (
            coteries.map((c) => (
              <Link
                key={c.id}
                to="/coteries/$id"
                params={{ id: c.id }}
                className="flex min-h-14 items-center justify-between py-2 outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{c.nome}</span>
                    {c.ehPadrao && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                        Padrão
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {c.totalMembros} {c.totalMembros === 1 ? 'membro' : 'membros'}
                    {c.totalConvites > 0 && ` · ${c.totalConvites} ${c.totalConvites === 1 ? 'convite pendente' : 'convites pendentes'}`}
                  </span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
