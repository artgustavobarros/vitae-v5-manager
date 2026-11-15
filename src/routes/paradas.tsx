import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Info, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { Combobox } from '#/components/combobox'
import { FiltroTipoParadas } from '#/components/filtro-tipo-paradas'
import { GridParadas } from '#/components/grid-paradas'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ATRIBUTOS, GRUPOS, HABILIDADES } from '#/domain/ficha'
import { encontrarParadasRepetidas, filtrarParadas, paradaPersonalizadaSchema, type ParadaPersonalizada, type TipoParadas } from '#/domain/paradas'
import { carregarParadas, excluirParadaCompartilhada, salvarParadaCompartilhada } from '#/server/paradas'

export const Route = createFileRoute('/paradas')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    return { usuario: context.usuario }
  },
  loader: async () => {
    try {
      return await carregarParadas()
    } catch {
      throw redirect({ to: '/' })
    }
  },
  component: PaginaParadas,
})

const opcoesAtributos = ATRIBUTOS.map((a) => ({ valor: a.id, rotulo: a.nome, grupo: GRUPOS.find((g) => g.id === a.grupo)!.atributos }))
const opcoesHabilidades = HABILIDADES.map((h) => ({ valor: h.id, rotulo: h.nome, grupo: GRUPOS.find((g) => g.id === h.grupo)!.habilidades }))

function PaginaParadas() {
  const { paradas, compartilhadas, gerenciaveis } = Route.useLoaderData()
  const router = useRouter()
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState<TipoParadas>('todos')
  const [paradaEmEdicao, setParadaEmEdicao] = useState<ParadaPersonalizada | null>(null)
  const [paradaParaExcluir, setParadaParaExcluir] = useState<ParadaPersonalizada | null>(null)
  const [salvando, setSalvando] = useState(false)

  const filtradas = filtrarParadas(paradas, tipo, busca)
  const editando = paradaEmEdicao !== null && paradas.some((p) => p.id === paradaEmEdicao.id)

  const repetidas = paradaEmEdicao ? encontrarParadasRepetidas(compartilhadas, paradaEmEdicao) : []

  function novaParada() {
    setParadaEmEdicao({ id: crypto.randomUUID(), nome: '', atributo: 'carisma', habilidade: 'intimidacao' })
  }

  async function salvar(event: React.FormEvent) {
    event.preventDefault()
    if (!paradaEmEdicao) return
    const validacao = paradaPersonalizadaSchema.safeParse(paradaEmEdicao)
    if (!validacao.success) {
      toast.error(validacao.error.issues[0].message)
      return
    }
    setSalvando(true)
    try {
      const resultado = await salvarParadaCompartilhada({ data: { parada: validacao.data } })
      setParadaEmEdicao(null)
      setBusca('')
      setTipo('todos')
      toast.success('Parada compartilhada salva')
      if (resultado.repetidas.length > 0) toast.warning(`Essa combinação também aparece em: ${resultado.repetidas.map((nome) => `“${nome}”`).join(', ')}.`)
      await router.invalidate()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível salvar a Parada.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!paradaParaExcluir) return
    setSalvando(true)
    try {
      await excluirParadaCompartilhada({ data: { paradaId: paradaParaExcluir.id } })
      if (paradaEmEdicao?.id === paradaParaExcluir.id) setParadaEmEdicao(null)
      setParadaParaExcluir(null)
      toast.success('Parada removida')
      await router.invalidate()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível remover a Parada.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <main className="container-app mx-auto min-h-dvh">
      <BarraApp />
      <div className="pb-12 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-serif text-4xl">Paradas</h1>
          <Button onClick={novaParada} disabled={salvando} className="gap-2">
            <Plus className="size-4" /> Nova Parada
          </Button>
        </div>

        {paradaEmEdicao && (
          <form key={paradaEmEdicao.id} onSubmit={salvar} className="mt-6 space-y-4 rounded-lg border bg-card p-4" aria-label="Parada Personalizada">
            <h2 className="font-serif text-xl">{editando ? 'Editar Parada' : 'Nova Parada'}</h2>
            <p className="text-sm text-muted-foreground">Defina o nome da ação e a combinação de Atributo + Habilidade.</p>
            <div className="space-y-2">
              <Label htmlFor="nome-parada">Nome da ação</Label>
              <Input id="nome-parada" value={paradaEmEdicao.nome} maxLength={80} required disabled={salvando} autoFocus
                placeholder="Ex.: Interrogar sem levantar a voz"
                onChange={(event) => setParadaEmEdicao({ ...paradaEmEdicao, nome: event.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Atributo</Label>
                <Combobox rotulo="Atributo da Parada" opcoes={opcoesAtributos} valor={paradaEmEdicao.atributo} disabled={salvando}
                  onChange={(atributo) => setParadaEmEdicao({ ...paradaEmEdicao, atributo: paradaPersonalizadaSchema.shape.atributo.parse(atributo) })} />
              </div>
              <div className="space-y-2">
                <Label>Habilidade</Label>
                <Combobox rotulo="Habilidade da Parada" opcoes={opcoesHabilidades} valor={paradaEmEdicao.habilidade} disabled={salvando}
                  onChange={(habilidade) => setParadaEmEdicao({ ...paradaEmEdicao, habilidade: paradaPersonalizadaSchema.shape.habilidade.parse(habilidade) })} />
              </div>
            </div>
            {repetidas.length > 0 && (
              <Alert>
                <Info />
                <AlertTitle>Essa combinação já existe</AlertTitle>
                <AlertDescription>
                  <p>Já aparece em: {repetidas.map((p) => `“${p.nome}”`).join(', ')}.</p>
                  <p>Você pode usar o card existente ou salvar outra ação com a mesma combinação.</p>
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
              <div className="flex gap-2">
                <Button type="button" variant="ghost" disabled={salvando} onClick={() => setParadaEmEdicao(null)}>Cancelar</Button>
                <Button type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar Parada'}</Button>
              </div>
            </div>
          </form>
        )}

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input aria-label="Buscar Paradas" placeholder="Buscar ação, Atributo ou Habilidade…" className="pl-9"
            value={busca} onChange={(event) => setBusca(event.target.value)} />
        </div>
        <div className="mt-3">
          <FiltroTipoParadas paradas={paradas} tipo={tipo} busca={busca} onChange={setTipo} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">O tipo segue a Habilidade.</p>

        <p className="mt-2 text-xs text-muted-foreground">Arraste pelo ícone para organizar as Paradas.</p>
        <div className="mt-6">
          <GridParadas paradas={filtradas} gerenciaveis={gerenciaveis}
            podeReordenar={!salvando} onEditar={setParadaEmEdicao} onExcluir={setParadaParaExcluir} />
          {filtradas.length === 0 && (
            <div className="py-8">
              <p className="text-sm text-muted-foreground">Nenhuma Parada encontrada para “{busca}”.</p>
              <Button variant="ghost" className="mt-2" onClick={() => setBusca('')}>Limpar busca</Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={paradaParaExcluir !== null} onOpenChange={(aberto) => { if (!aberto && !salvando) setParadaParaExcluir(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Parada?</AlertDialogTitle>
            <AlertDialogDescription>“{paradaParaExcluir?.nome}” será removida do catálogo. As Paradas Padrão continuam disponíveis.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={salvando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={salvando} onClick={(event) => { event.preventDefault(); excluir() }}>
              {salvando ? 'Removendo…' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
