import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Dices, Sparkles, AlertOctagon, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { Combobox, type OpcaoCombobox } from '#/components/combobox'
import { TermoRegra } from '#/components/consulta-regra'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Label } from '#/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { CLAS } from '#/domain/ficha'
import type {
  CompulsaoSorteada,
  Discrasia,
  ResultadoRessonancia,
  TipoRessonancia,
} from '#/domain/sorteios'
import {
  aplicarCompulsaoPersonagemServer,
  aplicarRessonanciaPersonagemServer,
  encerrarCompulsaoPersonagemServer,
  encerrarRessonanciaPersonagemServer,
  listarPersonagensParaSorteio,
  sortearCompulsaoServer,
  sortearDiscrasiaServer,
  sortearRessonanciaServer,
} from '#/server/sorteios'

export const Route = createFileRoute('/narrador/rolagens')({
  beforeLoad: ({ context }) => {
    if (!context.usuario || context.usuario.papel !== 'narrador') {
      throw redirect({ to: '/' })
    }
  },
  loader: async () => {
    return listarPersonagensParaSorteio()
  },
  component: PaginaSorteios,
})

function PaginaSorteios() {
  const personagens = Route.useLoaderData()
  const router = useRouter()

  // Estados dos Sorteios
  const [resultadoRessonancia, setResultadoRessonancia] = useState<ResultadoRessonancia | null>(null)
  const [sorteandoRessonancia, setSorteandoRessonancia] = useState(false)

  const [tipoFiltroDiscrasia, setTipoFiltroDiscrasia] = useState<TipoRessonancia | 'qualquer'>('qualquer')
  const [resultadoDiscrasia, setResultadoDiscrasia] = useState<Discrasia | null>(null)
  const [sorteandoDiscrasia, setSorteandoDiscrasia] = useState(false)

  const [tipoCompulsao, setTipoCompulsao] = useState<'geral' | 'cla'>('geral')
  const [claSelecionadoCompulsao, setClaSelecionadoCompulsao] = useState<string>('qualquer')
  const [resultadoCompulsao, setResultadoCompulsao] = useState<CompulsaoSorteada | null>(null)
  const [sorteandoCompulsao, setSorteandoCompulsao] = useState(false)

  // Modais de Aplicação
  const [dialogAplicarRessonancia, setDialogAplicarRessonancia] = useState(false)
  const [personagemIdParaRessonancia, setPersonagemIdParaRessonancia] = useState<string>('')
  const [aplicandoRessonancia, setAplicandoRessonancia] = useState(false)

  const [dialogAplicarCompulsao, setDialogAplicarCompulsao] = useState(false)
  const [personagemIdParaCompulsao, setPersonagemIdParaCompulsao] = useState<string>('')
  const [aplicandoCompulsao, setAplicandoCompulsao] = useState(false)

  // Personagens com condições ativas
  const personagensComCondicoes = personagens.filter(
    (p) => Boolean(p.ressonanciaAtual) || Boolean(p.compulsaoAtiva),
  )

  const opcoesPersonagens: readonly OpcaoCombobox[] = personagens.map((p) => ({
    valor: p.id,
    rotulo: p.nome,
    descricao: p.ehPdn ? 'PdN' : p.donoNome,
  }))

  async function handleSortearRessonancia() {
    setSorteandoRessonancia(true)
    try {
      const res = await sortearRessonanciaServer()
      setResultadoRessonancia(res)
    } finally {
      setSorteandoRessonancia(false)
    }
  }

  async function handleSortearDiscrasia() {
    setSorteandoDiscrasia(true)
    try {
      const tipo = tipoFiltroDiscrasia === 'qualquer' ? undefined : tipoFiltroDiscrasia
      const res = await sortearDiscrasiaServer({ data: { tipoRessonancia: tipo } })
      setResultadoDiscrasia(res)
    } finally {
      setSorteandoDiscrasia(false)
    }
  }

  async function handleSortearCompulsao() {
    setSorteandoCompulsao(true)
    try {
      const claId = claSelecionadoCompulsao === 'qualquer' ? undefined : claSelecionadoCompulsao
      const res = await sortearCompulsaoServer({
        data: {
          tipo: tipoCompulsao,
          claId,
        },
      })
      setResultadoCompulsao(res)
    } finally {
      setSorteandoCompulsao(false)
    }
  }

  async function handleConfirmarAplicarRessonancia() {
    if (!resultadoRessonancia || !personagemIdParaRessonancia) return
    setAplicandoRessonancia(true)
    try {
      await aplicarRessonanciaPersonagemServer({
        data: {
          personagemId: personagemIdParaRessonancia,
          ressonancia: {
            tipo: resultadoRessonancia.tipo.nome,
            intensidade: resultadoRessonancia.intensidade.nome,
            discrasia: resultadoRessonancia.discrasia
              ? {
                  nome: resultadoRessonancia.discrasia.nome,
                  descricao: resultadoRessonancia.discrasia.descricao,
                }
              : null,
            manifestacaoSangueFraco: resultadoRessonancia.manifestacaoSangueFraco
              ? {
                  disciplinaId: resultadoRessonancia.manifestacaoSangueFraco.disciplinaId,
                  disciplinaNome: resultadoRessonancia.manifestacaoSangueFraco.disciplinaNome,
                  nivel: resultadoRessonancia.manifestacaoSangueFraco.nivel,
                  poderes: resultadoRessonancia.manifestacaoSangueFraco.poderes,
                }
              : null,
          },
        },
      })
      toast.success('Ressonância Atual aplicada ao Personagem!')
      setDialogAplicarRessonancia(false)
      setPersonagemIdParaRessonancia('')
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao aplicar ressonância.')
    } finally {
      setAplicandoRessonancia(false)
    }
  }

  async function handleConfirmarAplicarCompulsao() {
    if (!resultadoCompulsao || !personagemIdParaCompulsao) return
    setAplicandoCompulsao(true)
    try {
      await aplicarCompulsaoPersonagemServer({
        data: {
          personagemId: personagemIdParaCompulsao,
          compulsao: {
            tipo: resultadoCompulsao.tipo,
            nome: resultadoCompulsao.nome,
            descricao: resultadoCompulsao.descricao,
          },
        },
      })
      toast.success('Compulsão Ativa aplicada ao Personagem!')
      setDialogAplicarCompulsao(false)
      setPersonagemIdParaCompulsao('')
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao aplicar compulsão.')
    } finally {
      setAplicandoCompulsao(false)
    }
  }

  async function handleEncerrarRessonancia(personagemId: string) {
    try {
      await encerrarRessonanciaPersonagemServer({ data: { personagemId } })
      toast.success('Ressonância encerrada.')
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao encerrar ressonância.')
    }
  }

  async function handleEncerrarCompulsao(personagemId: string) {
    try {
      await encerrarCompulsaoPersonagemServer({ data: { personagemId } })
      toast.success('Compulsão encerrada.')
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao encerrar compulsão.')
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp />
      <div className="flex flex-col gap-8 pt-2 pb-12">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-display text-balance">Rolagens</h1>
          <p className="text-sm text-muted-foreground">
            Rolagens em tempo real para o Narrador: Ressonância do sangue, Discrasias e Compulsões.
          </p>
        </div>

        <Tabs defaultValue="ressonancia" className="flex flex-col gap-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ressonancia">Ressonância</TabsTrigger>
            <TabsTrigger value="discrasia">Discrasia</TabsTrigger>
            <TabsTrigger value="compulsao">Compulsão</TabsTrigger>
          </TabsList>

          {/* TAB: RESSONÂNCIA */}
          <TabsContent value="ressonancia" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <Sparkles className="size-5 text-vinho" />
                  Rolagem de Ressonância
                </CardTitle>
                <CardDescription>
                  Rola tipo e intensidade (d10). Se resultar em Aguda (10), confere Discrasia. Para Sangue-Fraco, manifesta Disciplina e Poderes temporários.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button
                  onClick={handleSortearRessonancia}
                  disabled={sorteandoRessonancia}
                  className="w-full sm:w-auto gap-2"
                >
                  <Dices className="size-4" />
                  {sorteandoRessonancia ? 'Rolando...' : 'Rolar Ressonância'}
                </Button>

                {resultadoRessonancia && (
                  <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Tipo & Intensidade</span>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-2xl font-bold">{resultadoRessonancia.tipo.nome}</span>
                          <Badge variant="secondary">{resultadoRessonancia.intensidade.nome}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setPersonagemIdParaRessonancia(personagens[0]?.id ?? '')
                            setDialogAplicarRessonancia(true)
                          }}
                        >
                          Aplicar a um Personagem
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setResultadoRessonancia(null)}
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground block">Emoções</span>
                        <p>{resultadoRessonancia.tipo.emocoes}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground block">Disciplinas Associadas</span>
                        <p className="flex flex-wrap gap-x-1.5">
                          {resultadoRessonancia.tipo.disciplinaIds.map((discId, i) => (
                            <span key={discId}>
                              <TermoRegra
                                tipo="disciplina"
                                id={discId}
                                className="text-sm font-medium"
                              >
                                {resultadoRessonancia.tipo.disciplinas[i]}
                              </TermoRegra>
                              {i < resultadoRessonancia.tipo.disciplinaIds.length - 1 && ','}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm rounded bg-muted/30 p-2.5">
                      <span className="text-xs font-semibold text-muted-foreground block">Efeito da Intensidade</span>
                      <p>{resultadoRessonancia.intensidade.descricao}</p>
                    </div>

                    {resultadoRessonancia.discrasia && (
                      <div className="text-sm rounded bg-muted/30 p-2.5">
                        <span className="text-xs font-semibold text-muted-foreground block">
                          Discrasia Aguda Adquirida
                        </span>
                        <p className="mt-0.5">
                          <strong className="font-bold text-foreground">{resultadoRessonancia.discrasia.nome}</strong>
                          <span className="text-muted-foreground"> — {resultadoRessonancia.discrasia.descricao}</span>
                        </p>
                      </div>
                    )}

                    {/* Manifestação para Sangue-Fraco */}
                    {resultadoRessonancia.manifestacaoSangueFraco && (
                      <div className="text-sm rounded bg-muted/30 p-2.5 flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-muted-foreground block">
                          Manifestação para Sangue-Fraco
                        </span>
                        <div className="mt-0.5">
                          <TermoRegra
                            tipo="disciplina"
                            id={resultadoRessonancia.manifestacaoSangueFraco.disciplinaId}
                            className="text-xs font-bold"
                          >
                            <strong>
                              {resultadoRessonancia.manifestacaoSangueFraco.disciplinaNome} (Nível {resultadoRessonancia.manifestacaoSangueFraco.nivel})
                            </strong>
                          </TermoRegra>
                        </div>
                        <div className="flex flex-col gap-1 text-xs">
                          {resultadoRessonancia.manifestacaoSangueFraco.poderes.map((p) => (
                            <p key={p.id ?? p.nome}>
                              <TermoRegra
                                tipo="catalogo"
                                id={p.id}
                                className="text-xs font-bold"
                              >
                                <strong>
                                  {p.nome} (Nv {p.nivel})
                                </strong>
                              </TermoRegra>
                              <span className="text-muted-foreground"> — {p.descricao}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: DISCRASIA AVULSA */}
          <TabsContent value="discrasia" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <Sparkles className="size-5 text-vinho" />
                  Rolagem de Discrasia Avulsa
                </CardTitle>
                <CardDescription>
                  Rola uma Discrasia específica para uma determinada Ressonância ou entre todas as possíveis.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <Label htmlFor="filtro-tipo-discrasia">Tipo de Ressonância</Label>
                    <Combobox
                      id="filtro-tipo-discrasia"
                      opcoes={[
                        { valor: 'qualquer', rotulo: 'Qualquer Tipo' },
                        { valor: 'colerico', rotulo: 'Colérico' },
                        { valor: 'melancolico', rotulo: 'Melancólico' },
                        { valor: 'fleumatico', rotulo: 'Fleumático' },
                        { valor: 'sanguineo', rotulo: 'Sanguíneo' },
                      ]}
                      valor={tipoFiltroDiscrasia}
                      onChange={(val) => setTipoFiltroDiscrasia(val as TipoRessonancia | 'qualquer')}
                      placeholder="Qualquer Tipo"
                    />
                  </div>

                  <Button
                    onClick={handleSortearDiscrasia}
                    disabled={sorteandoDiscrasia}
                    className="self-end gap-2"
                  >
                    <Dices className="size-4" />
                    {sorteandoDiscrasia ? 'Rolando...' : 'Rolar Discrasia'}
                  </Button>
                </div>

                {resultadoDiscrasia && (
                  <div className="rounded-lg border bg-card p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <span className="font-serif text-2xl font-bold">{resultadoDiscrasia.nome}</span>
                        <Badge variant="outline" className="ml-2 capitalize">
                          {resultadoDiscrasia.tipoRessonancia}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setResultadoDiscrasia(null)}
                      >
                        Limpar
                      </Button>
                    </div>
                    <p className="text-sm mt-1">{resultadoDiscrasia.descricao}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: COMPULSÃO */}
          <TabsContent value="compulsao" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <AlertOctagon className="size-5 text-vinho" />
                  Rolagem de Compulsão
                </CardTitle>
                <CardDescription>
                  Rola uma Compulsão imposta pela Besta (Geral ou de Clã).
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-col gap-1.5 min-w-[160px]">
                    <Label htmlFor="tipo-compulsao">Categoria</Label>
                    <Combobox
                      id="tipo-compulsao"
                      opcoes={[
                        { valor: 'geral', rotulo: 'Geral (4 V5)' },
                        { valor: 'cla', rotulo: 'Compulsão de Clã' },
                      ]}
                      valor={tipoCompulsao}
                      onChange={(val) => setTipoCompulsao(val as 'geral' | 'cla')}
                      placeholder="Categoria"
                    />
                  </div>

                  {tipoCompulsao === 'cla' && (
                    <div className="flex flex-col gap-1.5 min-w-[200px]">
                      <Label htmlFor="cla-compulsao">Clã Específico</Label>
                      <Combobox
                        id="cla-compulsao"
                        opcoes={[
                          { valor: 'qualquer', rotulo: 'Qualquer Clã' },
                          ...CLAS.filter((c) => c.id !== 'caitiff' && c.id !== 'sangue-ralo').map((c) => ({
                            valor: c.id,
                            rotulo: c.nome,
                          })),
                        ]}
                        valor={claSelecionadoCompulsao}
                        onChange={setClaSelecionadoCompulsao}
                        placeholder="Qualquer Clã"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleSortearCompulsao}
                    disabled={sorteandoCompulsao}
                    className="self-end gap-2"
                  >
                    <Dices className="size-4" />
                    {sorteandoCompulsao ? 'Rolando...' : 'Rolar Compulsão'}
                  </Button>
                </div>

                {resultadoCompulsao && (
                  <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase font-semibold">
                          {resultadoCompulsao.tipo === 'geral' ? 'Compulsão Geral' : 'Compulsão de Clã'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-2xl font-bold">{resultadoCompulsao.nome}</span>
                          {resultadoCompulsao.claId && (
                            <Badge variant="secondary" className="capitalize">
                              {CLAS.find((c) => c.id === resultadoCompulsao.claId)?.nome ?? resultadoCompulsao.claId}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setPersonagemIdParaCompulsao(personagens[0]?.id ?? '')
                            setDialogAplicarCompulsao(true)
                          }}
                        >
                          Aplicar a um Personagem
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setResultadoCompulsao(null)}
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>

                    <div className="rounded bg-muted/40 p-3 text-sm">
                      <p>{resultadoCompulsao.descricao}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CONDIÇÕES ATIVAS NA CRÔNICA */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-serif text-2xl">Condições Ativas na Crônica</h2>
            <p className="text-sm text-muted-foreground">
              Personagens atualmente sob o efeito de Ressonância Atual ou Compulsão Ativa.
            </p>
          </div>

          {personagensComCondicoes.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhum Personagem possui Ressonância Atual ou Compulsão Ativa no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personagensComCondicoes.map((p) => (
                <Card key={p.id} className="flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-xl flex items-center justify-between">
                      {p.nome}
                      {p.ehPdn && <Badge variant="outline">PdN</Badge>}
                    </CardTitle>
                    <CardDescription>
                      Jogador: {p.ehPdn ? 'Narrador' : p.donoNome}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 text-sm">
                    {p.ressonanciaAtual && (
                      <div className="rounded border bg-muted/30 p-2.5 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase text-muted-foreground">
                            Ressonância Atual
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleEncerrarRessonancia(p.id)}
                          >
                            <X className="size-3 mr-1" />
                            Encerrar
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{p.ressonanciaAtual.tipo}</span>
                          <Badge variant="outline" className="text-xs">{p.ressonanciaAtual.intensidade}</Badge>
                        </div>
                        {p.ressonanciaAtual.discrasia && (
                          <p className="text-xs text-muted-foreground">
                            Discrasia: {p.ressonanciaAtual.discrasia.nome}
                          </p>
                        )}
                        {p.ressonanciaAtual.manifestacaoSangueFraco && (
                          <div className="rounded bg-muted/40 p-2 text-xs flex flex-col gap-1">
                            <span className="text-muted-foreground block">
                              Manifestação para Sangue-Fraco
                            </span>
                            <div className="flex flex-col gap-0.5">
                              {p.ressonanciaAtual.manifestacaoSangueFraco.disciplinaId ? (
                                <TermoRegra
                                  tipo="disciplina"
                                  id={p.ressonanciaAtual.manifestacaoSangueFraco.disciplinaId}
                                  className="text-xs font-bold"
                                >
                                  <strong>
                                    {p.ressonanciaAtual.manifestacaoSangueFraco.disciplinaNome} (Nível {p.ressonanciaAtual.manifestacaoSangueFraco.nivel})
                                  </strong>
                                </TermoRegra>
                              ) : (
                                <strong>
                                  {p.ressonanciaAtual.manifestacaoSangueFraco.disciplinaNome} (Nível {p.ressonanciaAtual.manifestacaoSangueFraco.nivel})
                                </strong>
                              )}
                              {p.ressonanciaAtual.manifestacaoSangueFraco.poderes.map((pod) => (
                                <p key={pod.id ?? pod.nome}>
                                  {pod.id ? (
                                    <TermoRegra
                                      tipo="catalogo"
                                      id={pod.id}
                                      className="text-xs font-bold"
                                    >
                                      <strong>{pod.nome} (Nv {pod.nivel})</strong>
                                    </TermoRegra>
                                  ) : (
                                    <strong>{pod.nome} (Nv {pod.nivel})</strong>
                                  )}
                                  <span className="text-muted-foreground"> — {pod.descricao}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {p.compulsaoAtiva && (
                      <div className="rounded border border-destructive/30 bg-destructive/10 p-2.5 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase text-destructive">
                            Compulsão Ativa
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleEncerrarCompulsao(p.id)}
                          >
                            <X className="size-3 mr-1" />
                            Encerrar
                          </Button>
                        </div>
                        <span className="font-semibold text-foreground">
                          {p.compulsaoAtiva.nome}
                        </span>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {p.compulsaoAtiva.descricao}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Dialog para Aplicar Ressonância */}
      <Dialog open={dialogAplicarRessonancia} onOpenChange={setDialogAplicarRessonancia}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Aplicar Ressonância Atual</DialogTitle>
            <DialogDescription>
              A Ressonância será vinculada ao Personagem e ficará visível em sua Ficha até ser encerrada.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="selecao-personagem-ressonancia">Personagem</Label>
              <Combobox
                id="selecao-personagem-ressonancia"
                opcoes={opcoesPersonagens}
                valor={personagemIdParaRessonancia || (personagens[0]?.id ?? null)}
                onChange={setPersonagemIdParaRessonancia}
                placeholder="Selecione um Personagem..."
              />
            </div>

            {resultadoRessonancia && (
              <div className="rounded border bg-muted/30 p-3 text-sm">
                <span className="font-semibold block">
                  {resultadoRessonancia.tipo.nome} ({resultadoRessonancia.intensidade.nome})
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {resultadoRessonancia.intensidade.descricao}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogAplicarRessonancia(false)}
              disabled={aplicandoRessonancia}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarAplicarRessonancia}
              disabled={aplicandoRessonancia}
            >
              {aplicandoRessonancia ? 'Aplicando...' : 'Aplicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Aplicar Compulsão */}
      <Dialog open={dialogAplicarCompulsao} onOpenChange={setDialogAplicarCompulsao}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Aplicar Compulsão Ativa</DialogTitle>
            <DialogDescription>
              O Jogador receberá uma notificação imediata e a Compulsão ficará ativa em sua Ficha.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="selecao-personagem-compulsao">Personagem</Label>
              <Combobox
                id="selecao-personagem-compulsao"
                opcoes={opcoesPersonagens}
                valor={personagemIdParaCompulsao || (personagens[0]?.id ?? null)}
                onChange={setPersonagemIdParaCompulsao}
                placeholder="Selecione um Personagem..."
              />
            </div>

            {resultadoCompulsao && (
              <div className="rounded border bg-destructive/10 p-3 text-sm">
                <span className="font-semibold block text-foreground">
                  {resultadoCompulsao.nome}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {resultadoCompulsao.descricao}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogAplicarCompulsao(false)}
              disabled={aplicandoCompulsao}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarAplicarCompulsao}
              disabled={aplicandoCompulsao}
            >
              {aplicandoCompulsao ? 'Aplicando...' : 'Aplicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
