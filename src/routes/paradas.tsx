import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { Info, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { BarraApp } from '#/components/barra-app'
import { Combobox } from '#/components/combobox'
import { FiltroTipoParadas } from '#/components/filtro-tipo-paradas'
import { GridParadas } from '#/components/grid-paradas'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ATRIBUTOS, GRUPOS, HABILIDADES } from '#/domain/ficha'
import { encontrarParadasRepetidas, filtrarParadas, paradaPersonalizadaSchema, type ParadaPersonalizada, type TipoParadas } from '#/domain/paradas'
import { carregarParadas, excluirParadaCompartilhada, salvarParadaCompartilhada } from '#/server/paradas'

export const Route = createFileRoute('/paradas')({
  validateSearch: z.object({ personagemId: z.string().uuid().optional() }),
  loaderDeps: ({ search }) => ({ personagemId: search.personagemId }),
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    return { usuario: context.usuario }
  },
  loader: async ({ deps }) => {
    try {
      return await carregarParadas({ data: deps })
    } catch {
      throw redirect({ to: '/' })
    }
  },
  component: PaginaParadas,
})

const opcoesAtributos = ATRIBUTOS.map((a) => ({ valor: a.id, rotulo: a.nome, grupo: GRUPOS.find((g) => g.id === a.grupo)!.atributos }))
const opcoesHabilidades = HABILIDADES.map((h) => ({ valor: h.id, rotulo: h.nome, grupo: GRUPOS.find((g) => g.id === h.grupo)!.habilidades }))

function PaginaParadas() {
  const { personagens, compartilhadas, gerenciaveis, selecionado: personagem } = Route.useLoaderData()
  const { usuario } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState<TipoParadas>('todos')
  const [paradaEmEdicao, setParadaEmEdicao] = useState<ParadaPersonalizada | null>(null)
  const [paradaParaExcluir, setParadaParaExcluir] = useState<ParadaPersonalizada | null>(null)
  const [salvando, setSalvando] = useState(false)

  const filtradas = filtrarParadas(personagem?.paradas ?? [], tipo, busca)
  const editando = paradaEmEdicao !== null && personagem?.paradas.some((p) => p.id === paradaEmEdicao.id)

  const repetidas = paradaEmEdicao ? encontrarParadasRepetidas(compartilhadas, paradaEmEdicao) : []

  function novaParada() {
    setParadaEmEdicao({ id: crypto.randomUUID(), nome: '', atributo: 'carisma', habilidade: 'intimidacao' })
  }

  async function salvar(event: React.FormEvent) {
    event.preventDefault()
    if (!personagem || !paradaEmEdicao) return
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
    if (!personagem || !paradaParaExcluir) return
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
          {personagem && (
            <Button onClick={novaParada} disabled={salvando} className="gap-2">
              <Plus className="size-4" /> Nova Parada
            </Button>
          )}
        </div>

        {!personagem ? (
          <div className="py-12">
            <h2 className="font-serif text-xl">Seu primeiro Personagem</h2>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">Crie um Personagem para consultar as Paradas e seus valores.</p>
            <Button asChild>
              <Link to={usuario.papel === 'narrador' ? '/narrador/personagens' : '/'}>Ver Personagens</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2 sm:w-80 sm:flex-none">
                <Label>Personagem</Label>
                <Combobox
                  rotulo="Personagem das Paradas"
                  opcoes={personagens.map((p) => ({ valor: p.id, rotulo: p.nome || 'Sem nome', descricao: p.status === 'arquivado' ? 'Arquivado' : undefined }))}
                  valor={personagem.id}
                  disabled={salvando}
                  onChange={(personagemId) => {
                    setParadaEmEdicao(null)
                    setParadaParaExcluir(null)
                    navigate({ search: { personagemId } })
                  }}
                />
              </div>
              <div className="flex items-center gap-3">
                {personagem.status === 'arquivado' && <Badge variant="outline">Ficha arquivada</Badge>}
                <Button variant="outline" asChild>
                  <Link to="/personagens/$id" params={{ id: personagem.id }}>Abrir Ficha</Link>
                </Button>
              </div>
            </div>

            {paradaEmEdicao && (
              <form key={paradaEmEdicao.id} onSubmit={salvar} className="mt-6 space-y-4 rounded-lg border bg-card p-4" aria-label="Parada Personalizada">
                <h2 className="font-serif text-xl">{editando ? 'Editar Parada' : 'Nova Parada'}</h2>
                <p className="text-sm text-muted-foreground">Esta Parada ficará disponível para toda a mesa.</p>
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
                  <p className="text-sm text-muted-foreground" aria-live="polite">
                    {personagem.atributos[paradaEmEdicao.atributo]} + {personagem.habilidades[paradaEmEdicao.habilidade].valor} ={' '}
                    <strong className="text-foreground">{personagem.atributos[paradaEmEdicao.atributo] + personagem.habilidades[paradaEmEdicao.habilidade].valor} dados base</strong>
                  </p>
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
              <FiltroTipoParadas paradas={personagem.paradas} tipo={tipo} busca={busca} onChange={setTipo} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">O tipo segue a Habilidade. Totais base de Atributo + Habilidade.</p>

            <p className="mt-2 text-xs text-muted-foreground">As Paradas são compartilhadas. Arraste pelo ícone para organizar a sua ordem pessoal.</p>
            <div className="mt-6">
              <GridParadas key={personagem.id} paradas={filtradas} gerenciaveis={gerenciaveis}
                podeReordenar={!salvando} onEditar={setParadaEmEdicao} onExcluir={setParadaParaExcluir} />
              {filtradas.length === 0 && (
                <div className="py-8">
                  <p className="text-sm text-muted-foreground">Nenhuma Parada encontrada para “{busca}”.</p>
                  <Button variant="ghost" className="mt-2" onClick={() => setBusca('')}>Limpar busca</Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AlertDialog open={paradaParaExcluir !== null} onOpenChange={(aberto) => { if (!aberto && !salvando) setParadaParaExcluir(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Parada?</AlertDialogTitle>
            <AlertDialogDescription>“{paradaParaExcluir?.nome}” será removida para todos os usuários. As Paradas Padrão continuam disponíveis.</AlertDialogDescription>
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
