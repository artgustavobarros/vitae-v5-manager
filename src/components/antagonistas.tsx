import { etiquetasDoTipo, filtrarClassificacao, normalizarEtiquetas, TIPOS_ANTAGONISTA } from '#/domain/classificacao-antagonistas'
import { casaBusca } from '#/domain/catalogo/busca'
import { SelectMultiplo } from '#/components/ui/select-multiplo'
import { Link, useRouter } from '@tanstack/react-router'
import { Plus, Trash2, Edit3, ShieldAlert, Copy, Search, ArrowLeft, Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { EditorFichaAntagonistaCompleta, ResumoFichaAntagonistaCompleta } from '#/components/ficha-antagonista-completa'
import { criarFichaAntagonistaCompleta } from '#/domain/ficha-antagonista'
import type { FonteModeloBestiario } from '#/domain/bestiario-fontes'

import { BarraApp } from '#/components/barra-app'
import { Combobox } from '#/components/combobox'
import { BadgeEspecial } from '#/components/badge-especial'
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
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '#/components/ui/card'
import { CarrosselBadges } from '#/components/ui/carrossel-badges'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Input, InputNumero } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { EditorRichText, VisualizadorMarkdown } from '#/components/ui/editor-rich-text'
import {
  criarModeloAntagonistaPadrao,
  type ModeloAntagonista,
} from '#/domain/bestiario'
import {
  ROTULOS_REVISAO_BESTIARIO,
  STATUS_REVISAO_BESTIARIO,
  type EdicaoModeloBestiario,
  type StatusRevisaoBestiario,
} from '#/domain/revisao-bestiario'
import {
  excluirModeloBestiario,
  concluirRevisaoBestiario,
  registrarRevisaoModelo,
  salvarModeloBestiario,
} from '#/server/bestiario'

export function PaginaAntagonistas({ modelos, modoAprovacao = false }: {
  modelos: (EdicaoModeloBestiario & { fonte?: FonteModeloBestiario | null })[]
  modoAprovacao?: boolean
}) {
  const router = useRouter()

  const [dialogAberto, setDialogAberto] = useState(false)
  const [modeloEmEdicao, setModeloEmEdicao] = useState<EdicaoModeloBestiario | null>(null)
  const [modeloParaExcluir, setModeloParaExcluir] = useState<ModeloAntagonista | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todos')
  const [etiquetasAtivas, setEtiquetasAtivas] = useState<string[]>([])
  const [novaEtiqueta, setNovaEtiqueta] = useState('')
  const [busca, setBusca] = useState<string>('')
  const [filtroRevisao, setFiltroRevisao] = useState<StatusRevisaoBestiario | 'todos'>('todos')
  const [atualizandoRevisao, setAtualizandoRevisao] = useState(false)
  const [confirmarConclusao, setConfirmarConclusao] = useState(false)
  const contagens = Object.fromEntries(STATUS_REVISAO_BESTIARIO.map((status) => [
    status, modelos.filter((m) => (m.revisao?.status ?? 'pendente') === status).length,
  ]))
  const modelosEmRevisao = useMemo(() => modelos.filter((m) => m.revisao?.status !== 'aprovado'), [modelos])
  const modelosDaPagina = modoAprovacao ? modelosEmRevisao : modelos
  const faltamDecidir = contagens.pendente + contagens.corrigir

  const categorias = useMemo(() => {
    const existentes = new Set(modelosDaPagina.map(m => m.categoria))
    return ['Todos', ...TIPOS_ANTAGONISTA.filter(tipo => existentes.has(tipo))]
  }, [modelosDaPagina])
  const etiquetasExistentes = useMemo(() => normalizarEtiquetas(modelos.flatMap(m => m.etiquetas ?? [])).sort((a, b) => a.localeCompare(b, 'pt-BR')), [modelos])
  const categoriaEfetiva = categorias.includes(categoriaAtiva) ? categoriaAtiva : 'Todos'
  const tipoFiltrado = categoriaEfetiva === 'Todos' ? null : categoriaEfetiva
  const etiquetasDisponiveis = etiquetasDoTipo(modelosDaPagina, tipoFiltrado)
  const disponiveis = new Set(etiquetasDisponiveis)
  const etiquetasEfetivas = etiquetasAtivas.filter(e => disponiveis.has(e))
  const etiquetasSelecionadas = new Set(etiquetasEfetivas)
  const modelosFiltrados = filtrarClassificacao(modelosDaPagina, tipoFiltrado, etiquetasEfetivas).filter(m => {
    if (modoAprovacao && filtroRevisao !== 'todos' && (m.revisao?.status ?? 'pendente') !== filtroRevisao) return false
    return casaBusca(busca, [m.nome, m.categoria, ...(m.etiquetas ?? []), m.notas, ...(modoAprovacao ? [m.revisao?.nota] : []), ...m.especiais.flatMap(e => [e.nome, e.descricao])])
  })

  function adicionarEtiqueta() {
    if (!modeloEmEdicao || !novaEtiqueta.trim()) return
    setModeloEmEdicao({ ...modeloEmEdicao, etiquetas: normalizarEtiquetas([...(modeloEmEdicao.etiquetas ?? []), novaEtiqueta]) })
    setNovaEtiqueta('')
  }

  function abrirNovo() {
    setNovaEtiqueta('')
    setModeloEmEdicao({ ...criarModeloAntagonistaPadrao(), ...(modoAprovacao ? { revisao: { status: 'pendente', nota: '' } } : {}) })
    setErro(null)
    setDialogAberto(true)
  }

  function abrirEditar(m: EdicaoModeloBestiario) {
    setNovaEtiqueta('')
    setModeloEmEdicao({
      ...m,
      paradasExcepcionais: [...m.paradasExcepcionais],
      especiais: [...m.especiais],
    })
    setErro(null)
    setDialogAberto(true)
  }

  function abrirDuplicar(m: ModeloAntagonista) {
    setNovaEtiqueta('')
    setModeloEmEdicao({
      ...m,
      id: undefined,
      nome: `${m.nome} (Cópia)`,
      revisao: modoAprovacao ? { status: 'pendente', nota: '' } : undefined,
      categoria: m.categoria || 'Outros',
      etiquetas: [...(m.etiquetas ?? [])],
      paradasExcepcionais: m.paradasExcepcionais.map((p) => ({ ...p })),
      especiais: m.especiais.map((e) => ({ ...e })),
    })
    setErro(null)
    setDialogAberto(true)
  }

  async function handleSalvar(aprovar = false) {
    if (!modeloEmEdicao) return
    if (!modeloEmEdicao.nome.trim()) {
      setErro('Nome do modelo é obrigatório.')
      return
    }

    setSalvando(true)
    setErro(null)
    try {
      await salvarModeloBestiario({ data: { ...modeloEmEdicao, ...(aprovar ? { revisao: { status: 'aprovado', nota: modeloEmEdicao.revisao?.nota ?? '' } } : {}) } })
      setDialogAberto(false)
      setModeloEmEdicao(null)
      await router.invalidate()
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Falha ao salvar modelo.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir() {
    if (!modeloParaExcluir?.id) return
    try {
      await excluirModeloBestiario({ data: { id: modeloParaExcluir.id } })
      setModeloParaExcluir(null)
      await router.invalidate()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Falha ao excluir modelo.')
    }
  }

  async function revisar(m: EdicaoModeloBestiario, status: StatusRevisaoBestiario) {
    if (!m.id) return
    setAtualizandoRevisao(true)
    try {
      await registrarRevisaoModelo({ data: { id: m.id, revisao: { status, nota: m.revisao?.nota ?? '' } } })
      await router.invalidate()
      toast.success(`${m.nome}: ${ROTULOS_REVISAO_BESTIARIO[status]}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao registrar revisão.')
    } finally {
      setAtualizandoRevisao(false)
    }
  }

  async function concluirRevisao() {
    setAtualizandoRevisao(true)
    try {
      const resultado = await concluirRevisaoBestiario()
      await router.invalidate()
      toast.success(`Revisão concluída. ${resultado.aprovados} Modelos em Antagonistas.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao concluir revisão.')
    } finally {
      setAtualizandoRevisao(false)
    }
  }

  return (
    <main className="container-app mx-auto min-h-dvh">
      <BarraApp />
      <div className="flex flex-col gap-6 pt-2 pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            {modoAprovacao && (
              <Button variant="link" size="sm" className="h-8 self-start px-0" asChild>
                <Link to="/narrador/antagonistas"><ArrowLeft className="size-4" />Voltar para Antagonistas</Link>
              </Button>
            )}
            <h1 className={modoAprovacao ? 'font-serif text-2xl text-balance' : 'font-serif text-display text-balance'}>
              {modoAprovacao ? 'Aprovação de Antagonistas' : 'Antagonistas'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {modoAprovacao
                ? 'Revise os Modelos restantes. Os aprovados ficam em Antagonistas e saem desta lista.'
                : 'Modelos de antagonistas com ficha simplificada ou completa, privados do Narrador.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={abrirNovo} className="gap-2">
              <Plus className="size-4" />Novo Modelo
            </Button>
          </div>
        </div>

        {modoAprovacao && modelos.length > 0 && (
          <div className="flex flex-col gap-4 border-y py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm" aria-live="polite">
                <p className="font-medium">{modelos.length - faltamDecidir} de {modelos.length} Modelos decididos</p>
                <p className="text-muted-foreground">
                  {faltamDecidir > 0
                    ? `Faltam ${faltamDecidir}. As decisões só alteram a lista de Antagonistas e o Combate ao concluir a revisão.`
                    : 'Tudo decidido. Conclua para manter apenas os aprovados em Antagonistas e no Combate.'}
                </p>
              </div>
              <Button variant="outline" disabled={faltamDecidir > 0 || atualizandoRevisao} onClick={() => setConfirmarConclusao(true)}>
                <Check className="size-4" />Concluir revisão
              </Button>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Filtrar por revisão">
              <Button size="sm" variant={filtroRevisao === 'todos' ? 'secondary' : 'ghost'} aria-pressed={filtroRevisao === 'todos'} onClick={() => setFiltroRevisao('todos')}>
                Restantes ({modelosEmRevisao.length})
              </Button>
              {STATUS_REVISAO_BESTIARIO.filter((status) => status !== 'aprovado').map((status) => (
                <Button key={status} size="sm" variant={filtroRevisao === status ? 'secondary' : 'ghost'} aria-pressed={filtroRevisao === status} onClick={() => setFiltroRevisao(status)}>
                  {ROTULOS_REVISAO_BESTIARIO[status]} ({contagens[status]})
                </Button>
              ))}
            </div>
          </div>
        )}

        {modelos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <ShieldAlert className="size-10 text-muted-foreground mb-3" />
            <h3 className="font-serif text-xl font-medium">Nenhum Modelo cadastrado</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
              Crie modelos de antagonistas (como policiais, ghouls ou vampiros rivais) para adicionar rapidamente aos combates.
            </p>
            <Button onClick={abrirNovo} variant="secondary" className="gap-2">
              <Plus className="size-4" />
              Criar Primeiro Modelo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Abas de Categorias com Carrossel Drag-Free */}
              <div className="min-w-0 flex-1">
                <CarrosselBadges>
                  {categorias.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={categoriaEfetiva === cat ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-xs rounded-full px-3 shrink-0"
                      aria-pressed={categoriaEfetiva === cat}
                      onClick={() => { setCategoriaAtiva(cat); setEtiquetasAtivas([]) }}
                    >
                      {cat}
                    </Button>
                  ))}
                </CarrosselBadges>
              </div>

              {/* Busca por texto */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-2 top-2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar Modelo, Etiqueta ou Especial..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-8 h-8 text-xs"
                  aria-label="Buscar Modelo, Etiqueta ou Especial"
                />
              </div>
            </div>

            {tipoFiltrado && etiquetasDisponiveis.length > 0 && (
              <div className="flex flex-col gap-2" role="group" aria-label={`Etiquetas de ${tipoFiltrado}`}>
                <span className="text-xs text-muted-foreground">Etiquetas de {tipoFiltrado} · combine para refinar a busca</span>
                <CarrosselBadges>
                  <Button type="button" size="sm" variant={etiquetasEfetivas.length === 0 ? 'secondary' : 'outline'} aria-pressed={etiquetasEfetivas.length === 0} onClick={() => setEtiquetasAtivas([])}>Todas as Etiquetas</Button>
                  {etiquetasDisponiveis.map(etiqueta => (
                    <Button key={etiqueta} type="button" size="sm" variant={etiquetasSelecionadas.has(etiqueta) ? 'default' : 'outline'} aria-pressed={etiquetasSelecionadas.has(etiqueta)}
                      onClick={() => setEtiquetasAtivas(etiquetasSelecionadas.has(etiqueta) ? etiquetasEfetivas.filter(e => e !== etiqueta) : [...etiquetasEfetivas, etiqueta])}>
                      {etiqueta}
                    </Button>
                  ))}
                </CarrosselBadges>
              </div>
            )}

            {modelosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {modoAprovacao && modelosEmRevisao.length === 0 ? 'Todos os Modelos foram aprovados. Você pode concluir a revisão acima.' : 'Nenhum Modelo encontrado para o filtro atual.'}
                </p>
              </div>
            ) : (
              <div className={modoAprovacao ? "columns-1 gap-4 md:columns-2 lg:columns-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
                {modelosFiltrados.map((m) => (
                  <Card key={m.id} className={modoAprovacao ? "mb-4 break-inside-avoid flex flex-col" : "flex flex-col justify-between"}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="font-serif text-xl leading-tight break-words">{m.nome}</CardTitle>
                        <Badge variant="secondary" className="text-xs shrink-0 font-normal">
                          {m.categoria || 'Outros'}
                        </Badge>
                      </div>
                      {(m.etiquetas?.length ?? 0) > 0 && <div className="flex flex-wrap gap-1">{m.etiquetas?.map(etiqueta => <Badge key={etiqueta} variant="outline" className="text-xs">{etiqueta}</Badge>)}</div>}
                      <CardDescription>
                        Vitalidade {m.vitalidade} &bull; Força de Vontade {m.vontade}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 text-sm">
                      {modoAprovacao && (
                        <div className="flex flex-col gap-2">
                          <Badge variant={m.revisao?.status === 'aprovado' ? 'default' : 'outline'} className="self-start">
                            {ROTULOS_REVISAO_BESTIARIO[m.revisao?.status ?? 'pendente']}
                          </Badge>
                        </div>
                      )}
                      {m.fichaCompleta ? <ResumoFichaAntagonistaCompleta ficha={m.fichaCompleta} nome={m.nome} /> : (
                      <div className="grid grid-cols-3 gap-2 rounded-md bg-muted/40 p-2 text-center">
                        <div>
                          <span className="block text-xs text-muted-foreground">Físico</span>
                          <span className="font-semibold text-base tabular-nums">{m.paradaFisico}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-muted-foreground">Social</span>
                          <span className="font-semibold text-base tabular-nums">{m.paradaSocial}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-muted-foreground">Mental</span>
                          <span className="font-semibold text-base tabular-nums">{m.paradaMental}</span>
                        </div>
                      </div>
                      )}

                      {m.paradasExcepcionais.length > 0 && (
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">Paradas excepcionais:</span>
                          <CarrosselBadges>
                            {m.paradasExcepcionais.map((pe, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs shrink-0">
                                {pe.nome}: {pe.valor}
                              </Badge>
                            ))}
                          </CarrosselBadges>
                        </div>
                      )}

                      {m.especiais.length > 0 && (
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-xs font-medium text-muted-foreground">Especiais:</span>
                          <CarrosselBadges>
                            {m.especiais.map((esp, idx) => (
                              <BadgeEspecial key={idx} nome={esp.nome} descricao={esp.descricao} />
                            ))}
                          </CarrosselBadges>
                        </div>
                      )}

                      {m.notas && (
                        <div className={modoAprovacao ? "text-xs text-muted-foreground" : "text-xs text-muted-foreground line-clamp-3 italic"}>
                          <VisualizadorMarkdown markdown={m.notas} />
                        </div>
                      )}
                      {modoAprovacao && (
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          {m.fonte ? <>
                            <p>Fonte: <a className="text-vinho underline underline-offset-4" href={m.fonte.url} target="_blank" rel="noreferrer">{m.fonte.titulo}</a></p>
                            <p>{m.fonte.referencia}</p>
                          </> : <p>Fonte não registrada neste Modelo. Livro e página não confirmados.</p>}
                        </div>
                      )}
                      {modoAprovacao && m.revisao?.nota && (
                        <p className="whitespace-pre-wrap break-words text-xs text-muted-foreground">Revisão: {m.revisao.nota}</p>
                      )}
                    </CardContent>
                    {modoAprovacao ? (
                      <CardFooter className="mt-auto flex flex-col items-stretch gap-2 border-t pt-3">
                        <div className="flex flex-wrap gap-2">
                          <Button variant={m.revisao?.status === 'aprovado' ? 'secondary' : 'outline'} size="sm" disabled={atualizandoRevisao || m.revisao?.status === 'aprovado'} onClick={() => revisar(m, 'aprovado')} aria-label={`Aprovar ${m.nome}`}>
                            <Check className="size-4" />Aprovar
                          </Button>
                          <Button variant="ghost" size="sm" disabled={atualizandoRevisao || m.revisao?.status === 'corrigir'} onClick={() => revisar(m, 'corrigir')} aria-label={`Marcar ${m.nome} para corrigir`}>
                            Corrigir
                          </Button>
                          <Button variant="ghost" size="sm" disabled={atualizandoRevisao || m.revisao?.status === 'rejeitado'} onClick={() => revisar(m, 'rejeitado')} aria-label={`Não incluir ${m.nome}`}>
                            Não entra
                          </Button>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => abrirEditar(m)} aria-label={`Editar ${m.nome}`}>
                          <Edit3 className="size-4" />Editar ficha e revisão
                        </Button>
                      </CardFooter>
                    ) : (
                    <CardFooter className="flex flex-wrap justify-end gap-1 border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => abrirDuplicar(m)}
                        title="Duplicar modelo como nova variante"
                      >
                        <Copy className="size-4" />
                        Duplicar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => abrirEditar(m)}
                      >
                        <Edit3 className="size-4" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs text-destructive hover:text-destructive"
                        onClick={() => setModeloParaExcluir(m)}
                      >
                        <Trash2 className="size-4" />
                        Excluir
                      </Button>
                    </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog para Criar/Editar Modelo */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-lg max-h-9/10 overflow-y-auto">
          <form onSubmit={(e) => { e.preventDefault(); void handleSalvar() }}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {modeloEmEdicao?.id ? 'Editar Modelo' : 'Novo Modelo de Antagonista'}
              </DialogTitle>
              <DialogDescription>
                Modelo de antagonista para consulta e uso no Combate.
              </DialogDescription>
            </DialogHeader>

            {erro && (
              <div className="my-2 rounded bg-destructive/15 p-3 text-sm text-destructive">
                {erro}
              </div>
            )}

            {modeloEmEdicao && (
              <div className="flex flex-col gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="nome-modelo">Nome do Modelo</Label>
                    <Input
                      id="nome-modelo"
                      placeholder="Ex.: Carniçal de ataque, Batedor..."
                      value={modeloEmEdicao.nome}
                      onChange={(e) =>
                        setModeloEmEdicao({ ...modeloEmEdicao, nome: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="categoria-modelo">Tipo de Antagonista</Label>
                    <Combobox
                      id="categoria-modelo"
                      rotulo="Tipo de Antagonista"
                      opcoes={TIPOS_ANTAGONISTA.map(categoria => ({ valor: categoria, rotulo: categoria }))}
                      valor={modeloEmEdicao.categoria || null}
                      onChange={valor => { const categoria = TIPOS_ANTAGONISTA.find(tipo => tipo === valor); if (categoria) setModeloEmEdicao({ ...modeloEmEdicao, categoria }) }}
                      placeholder="Escolher tipo geral"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="etiquetas-modelo">Etiquetas</Label>
                  <SelectMultiplo id="etiquetas-modelo" rotulo="Etiquetas" valores={modeloEmEdicao.etiquetas ?? []}
                    opcoes={normalizarEtiquetas([...(modeloEmEdicao.etiquetas ?? []), ...etiquetasExistentes]).map(etiqueta => ({ valor: etiqueta, rotulo: etiqueta }))}
                    onChange={etiquetas => setModeloEmEdicao({ ...modeloEmEdicao, etiquetas })} placeholder="Selecionar Etiquetas" />
                  <div className="flex items-center gap-2">
                    <Input aria-label="Nova Etiqueta" value={novaEtiqueta} onChange={e => setNovaEtiqueta(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); adicionarEtiqueta() } }} placeholder="Ex.: Sabá, Ataque, Camarilla" />
                    <Button type="button" variant="outline" disabled={!novaEtiqueta.trim()} onClick={adicionarEtiqueta}>Adicionar</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Afiliações e variantes. Um Modelo pode ter várias Etiquetas.</p>
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="tipo-ficha-modelo">Tipo de ficha</Label>
                  <Combobox id="tipo-ficha-modelo" rotulo="Tipo de ficha" valor={modeloEmEdicao.fichaCompleta ? 'completa' : 'simplificada'}
                    opcoes={[{ valor: 'simplificada', rotulo: 'Simplificada — paradas gerais' }, { valor: 'completa', rotulo: 'Completa — Atributos, Habilidades e Disciplinas' }]}
                    onChange={(tipo) => setModeloEmEdicao({ ...modeloEmEdicao,
                      fichaCompleta: tipo === 'completa' ? modeloEmEdicao.fichaCompleta ?? criarFichaAntagonistaCompleta() : null,
                      paradaFisico: tipo === 'completa' ? null : modeloEmEdicao.paradaFisico ?? 1,
                      paradaSocial: tipo === 'completa' ? null : modeloEmEdicao.paradaSocial ?? 1,
                      paradaMental: tipo === 'completa' ? null : modeloEmEdicao.paradaMental ?? 1,
                    })}
                  />
                </div>
                {modeloEmEdicao.fichaCompleta ? (
                  <EditorFichaAntagonistaCompleta ficha={modeloEmEdicao.fichaCompleta} onChange={(fichaCompleta) => setModeloEmEdicao({ ...modeloEmEdicao, fichaCompleta })} />
                ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="parada-fisico">Físico</Label>
                    <InputNumero
                      id="parada-fisico"
                      min={0}
                      max={15}
                      value={modeloEmEdicao.paradaFisico ?? 0}
                      onChange={(val) =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          paradaFisico: val,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="parada-social">Social</Label>
                    <InputNumero
                      id="parada-social"
                      min={0}
                      max={15}
                      value={modeloEmEdicao.paradaSocial ?? 0}
                      onChange={(val) =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          paradaSocial: val,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="parada-mental">Mental</Label>
                    <InputNumero
                      id="parada-mental"
                      min={0}
                      max={15}
                      value={modeloEmEdicao.paradaMental ?? 0}
                      onChange={(val) =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          paradaMental: val,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="vitalidade">Vitalidade</Label>
                    <InputNumero
                      id="vitalidade"
                      min={1}
                      max={20}
                      value={modeloEmEdicao.vitalidade}
                      onChange={(val) =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          vitalidade: val,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="vontade">Força de Vontade</Label>
                    <InputNumero
                      id="vontade"
                      min={1}
                      max={20}
                      value={modeloEmEdicao.vontade}
                      onChange={(val) =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          vontade: val,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Paradas Excepcionais */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Paradas Excepcionais</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          paradasExcepcionais: [
                            ...modeloEmEdicao.paradasExcepcionais,
                            { nome: '', valor: 4 },
                          ],
                        })
                      }
                    >
                      <Plus className="size-4" />
                      Adicionar
                    </Button>
                  </div>
                  {modeloEmEdicao.paradasExcepcionais.map((pe, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Nome (ex: Armas de Fogo)"
                        value={pe.nome}
                        onChange={(e) => {
                          const copia = [...modeloEmEdicao.paradasExcepcionais]
                          copia[idx] = { ...copia[idx], nome: e.target.value }
                          setModeloEmEdicao({ ...modeloEmEdicao, paradasExcepcionais: copia })
                        }}
                        className="flex-1"
                      />
                      <InputNumero
                        min={1}
                        max={15}
                        placeholder="Dados"
                        value={pe.valor}
                        onChange={(val) => {
                          const copia = [...modeloEmEdicao.paradasExcepcionais]
                          copia[idx] = {
                            ...copia[idx],
                            valor: val,
                          }
                          setModeloEmEdicao({ ...modeloEmEdicao, paradasExcepcionais: copia })
                        }}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 shrink-0 text-destructive"
                        onClick={() => {
                          const copia = modeloEmEdicao.paradasExcepcionais.filter((_, i) => i !== idx)
                          setModeloEmEdicao({ ...modeloEmEdicao, paradasExcepcionais: copia })
                        }}
                      >
                        <Trash2 className="size-4" /><span className="sr-only">Remover Parada Excepcional</span>
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Especiais */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Especiais</Label>
                      <span className="block text-xs text-muted-foreground">
                        Poderes, vantagens táticas ou regras especiais. Ficam como badges clicáveis na ficha.
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs shrink-0"
                      onClick={() =>
                        setModeloEmEdicao({
                          ...modeloEmEdicao,
                          especiais: [
                            ...modeloEmEdicao.especiais,
                            { nome: '', descricao: '' },
                          ],
                        })
                      }
                    >
                      <Plus className="size-4" />
                      Adicionar
                    </Button>
                  </div>
                  {modeloEmEdicao.especiais.map((esp, idx) => (
                    <div key={idx} className="flex flex-col gap-2 rounded-md border p-3 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Nome do Especial (ex: Sentidos Aguçados, Mordida Feroz)"
                          value={esp.nome}
                          onChange={(e) => {
                            const copia = [...modeloEmEdicao.especiais]
                            copia[idx] = { ...copia[idx], nome: e.target.value }
                            setModeloEmEdicao({ ...modeloEmEdicao, especiais: copia })
                          }}
                          className="flex-1 h-9 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            const copia = modeloEmEdicao.especiais.filter((_, i) => i !== idx)
                            setModeloEmEdicao({ ...modeloEmEdicao, especiais: copia })
                          }}
                        >
                          <Trash2 className="size-4" /><span className="sr-only">Remover Especial</span>
                        </Button>
                      </div>
                      <EditorRichText
                        placeholder="Descrição ou regras do Especial (suporta Markdown: negrito, itálico, listas...)"
                        rows={3}
                        value={esp.descricao}
                        onChange={(val) => {
                          const copia = [...modeloEmEdicao.especiais]
                          copia[idx] = { ...copia[idx], descricao: val }
                          setModeloEmEdicao({ ...modeloEmEdicao, especiais: copia })
                        }}
                      />
                    </div>
                  ))}
                </div>

                {modoAprovacao && modeloEmEdicao.revisao && (
                  <div className="flex flex-col gap-3 border-t pt-4">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="status-revisao">Decisão da revisão</Label>
                      <Combobox
                        id="status-revisao"
                        rotulo="Decisão da revisão"
                        opcoes={STATUS_REVISAO_BESTIARIO.map((status) => ({ valor: status, rotulo: ROTULOS_REVISAO_BESTIARIO[status] }))}
                        valor={modeloEmEdicao.revisao.status}
                        onChange={(valor) => {
                          const status = STATUS_REVISAO_BESTIARIO.find((s) => s === valor)
                          if (status) setModeloEmEdicao({ ...modeloEmEdicao, revisao: { status, nota: modeloEmEdicao.revisao?.nota ?? '' } })
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="nota-revisao">O que precisa corrigir?</Label>
                      <Textarea id="nota-revisao" rows={3} placeholder="Anote os ajustes ou o motivo da decisão."
                        value={modeloEmEdicao.revisao.nota}
                        onChange={(e) => setModeloEmEdicao({ ...modeloEmEdicao, revisao: { status: modeloEmEdicao.revisao?.status ?? 'pendente', nota: e.target.value } })}
                      />
                    </div>
                  </div>
                )}

                {/* Notas */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="notas">Notas e Equipamentos</Label>
                  <EditorRichText
                    id="notas"
                    placeholder="Informações táticas, equipamentos ou armas (suporta Markdown: negrito, listas...)"
                    rows={4}
                    value={modeloEmEdicao.notas}
                    onChange={(val) =>
                      setModeloEmEdicao({ ...modeloEmEdicao, notas: val })
                    }
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogAberto(false)}
                disabled={salvando}
              >
                Cancelar
              </Button>
              {modoAprovacao && (
                <Button type="button" variant="secondary" disabled={salvando} onClick={(e) => { if (e.currentTarget.form?.reportValidity()) void handleSalvar(true) }}>
                  Salvar e aprovar
                </Button>
              )}
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar Modelo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmarConclusao} onOpenChange={setConfirmarConclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Concluir revisão da lista de Antagonistas?</AlertDialogTitle>
            <AlertDialogDescription>
              Aprovados: {contagens.aprovado}. Eles ficam em Antagonistas e no seletor do Combate.
              Não entram: {contagens.rejeitado}. Eles continuam nesta página para consulta e correção.
              Inimigos já adicionados a Combates mantêm suas fichas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar revisando</AlertDialogCancel>
            <AlertDialogAction onClick={() => void concluirRevisao()}>Concluir revisão</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog
        open={Boolean(modeloParaExcluir)}
        onOpenChange={(aberto) => !aberto && setModeloParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">
              Excluir {modeloParaExcluir?.nome}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá este modelo da lista de Antagonistas. Inimigos já instanciados em combates anteriores não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
