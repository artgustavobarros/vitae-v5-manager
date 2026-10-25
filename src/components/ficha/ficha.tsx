import { Link, useRouter } from '@tanstack/react-router'
import { useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { TermoRegra } from '#/components/consulta-regra'
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
import { VisualizadorMarkdown } from '#/components/ui/editor-rich-text'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import type { CompulsaoAtivaPersonagem, RessonanciaAtualPersonagem } from '#/db/schema'
import type { Papel } from '#/domain/acesso'
import { marcasDe, vitalidadeMax, vontadeMax, type Ficha, type Marcas } from '#/domain/ficha'
import type { AcessoFicha, StatusPersonagem } from '#/domain/permissoes-ficha'
import { ehSangueFraco } from '#/domain/sorteios'
import { sairDaCoterie } from '#/server/coteries'
import { alternarCompartilharCondicao, marcar } from '#/server/personagens'
import {
  encerrarCompulsaoPersonagemServer,
  encerrarRessonanciaPersonagemServer,
} from '#/server/sorteios'

import { ListaTracos } from './atributos'
import { ListaVantagens } from './catalogo'
import { CabecalhoFicha } from './cabecalho-ficha'
import { HorizonteHumanidade, TrilhaDano, TrilhaFome } from './estado'
import { gruposAtributos, gruposHabilidades, ListaDisciplinas, nomeCla, nomeSeita, rotuloGeracao } from './tracos'

/** Linha do topo: "Clã · 12ª Geração · Potência do Sangue N", com termos clicáveis. */
function LinhaDescricao({ ficha }: { ficha: Ficha }) {
  const cla = nomeCla(ficha)
  const geracao = ficha.geracao === null ? '' : rotuloGeracao(ficha.geracao)

  return (
    <span className="flex flex-wrap items-center gap-1">
      {ficha.cla ? (
        <TermoRegra tipo="cla" id={ficha.cla} className="text-sm font-medium text-foreground">
          {cla}
        </TermoRegra>
      ) : (
        <span>{cla}</span>
      )}
      {geracao && (
        <>
          <span className="text-muted-foreground">·</span>
          <span>{geracao}</span>
        </>
      )}
      <span className="text-muted-foreground">·</span>
      <span>
        <TermoRegra tipo="termo" id="potencia-do-sangue" className="text-sm font-medium text-foreground">
          Potência do Sangue
        </TermoRegra>{' '}
        {ficha.potenciaSangue}
      </span>
    </span>
  )
}

/**
 * Tela da Ficha. Dano, Fome e Manchas são salvos no toque:
 * a marca aparece na hora e volta se o servidor recusar.
 */
export function FichaPersonagem({
  id,
  nome,
  status,
  ficha,
  acesso,
  compartilhaCondicao = false,
  coteries = [],
  podeCompartilharCondicao = false,
  ressonanciaAtual,
  compulsaoAtiva,
  papelUsuario,
  barra,
}: {
  id: string
  nome: string
  status: StatusPersonagem
  ficha: Ficha
  acesso: AcessoFicha
  compartilhaCondicao?: boolean
  coteries?: { id: string; nome: string }[]
  /** Regra de `podeAlternarCompartilharCondicao`, calculada no servidor. */
  podeCompartilharCondicao?: boolean
  ressonanciaAtual?: RessonanciaAtualPersonagem | null
  compulsaoAtiva?: CompulsaoAtivaPersonagem | null
  papelUsuario?: Papel
  barra: ReactNode
}) {
  const router = useRouter()
  const [marcas, setMarcas] = useState(() => marcasDe(ficha))
  const [compartilhando, setCompartilhando] = useState(compartilhaCondicao)
  const [salvandoCondicao, setSalvandoCondicao] = useState(false)
  const [coterieSaindo, setCoterieSaindo] = useState<{ id: string; nome: string } | null>(null)

  // Só a resposta do toque mais recente vale; as anteriores chegam desatualizadas.
  const ultimoToque = useRef(0)
  const podeMarcar = acesso === 'marcar' || acesso === 'editar'

  async function salvar(novas: Marcas) {
    const anteriores = marcas
    const toque = ++ultimoToque.current
    setMarcas(novas)
    try {
      const salvas = await marcar({ data: { id, marcas: novas } })
      if (toque === ultimoToque.current) setMarcas(salvas)
    } catch {
      if (toque === ultimoToque.current) setMarcas(anteriores)
      toast.error('Não deu para salvar a marca. Tente de novo.')
    }
  }

  async function toggleCompartilhar() {
    if (salvandoCondicao) return
    const novoValor = !compartilhando
    setCompartilhando(novoValor)
    setSalvandoCondicao(true)
    try {
      await alternarCompartilharCondicao({ data: { id, compartilhar: novoValor } })
      router.invalidate()
    } catch {
      setCompartilhando(!novoValor)
      toast.error('Não foi possível alterar o compartilhamento.')
    } finally {
      setSalvandoCondicao(false)
    }
  }

  async function confirmarSaidaCoterie() {
    if (!coterieSaindo) return
    try {
      await sairDaCoterie({ data: { coterieId: coterieSaindo.id, personagemId: id } })
      toast.success(`Saiu de ${coterieSaindo.nome}`)
      setCoterieSaindo(null)
      router.invalidate()
    } catch {
      toast.error('Não foi possível sair da Coterie.')
    }
  }

  const aoMarcar = <T,>(aplicar: (valor: T) => Marcas) =>
    podeMarcar ? (valor: T) => salvar(aplicar(valor)) : undefined

  const fichaAtual = { ...ficha, ...marcas }
  const campos = [
    { rotulo: 'Seita', valor: nomeSeita(ficha) },
    { rotulo: 'Senhor', valor: ficha.senhor },
    { rotulo: 'Ambição', valor: ficha.ambicao },
    { rotulo: 'Desejo', valor: ficha.desejo },
  ]

  return (
    <main className="min-h-dvh pb-12">
      <CabecalhoFicha
        barra={barra}
        nome={nome || 'Sem nome'}
        descricao={<LinhaDescricao ficha={ficha} />}
        fome={marcas.fome}
        selo={
          <div className="flex flex-wrap items-center gap-2">
            {status === 'rascunho' && (
              <Badge variant="outline">{acesso === 'ler' ? 'Rascunho · só leitura' : 'Rascunho'}</Badge>
            )}
            {ressonanciaAtual && (
              <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-vinho/40 bg-vinho/10 px-2.5 py-0.5 text-xs text-foreground">
                <span className="font-semibold text-vinho">Ressonância Atual:</span>
                <span>
                  {ressonanciaAtual.tipo} ({ressonanciaAtual.intensidade})
                </span>
                {ressonanciaAtual.discrasia && <span>&bull; {ressonanciaAtual.discrasia.nome}</span>}
                {ehSangueFraco(ficha.cla) && ressonanciaAtual.manifestacaoSangueFraco && (
                  <span title={ressonanciaAtual.manifestacaoSangueFraco.poderes.map((p) => `${p.nome} (Nv ${p.nivel}): ${p.descricao}`).join(' | ')}>
                    &bull; Sangue-Fraco: <strong className="text-primary">{ressonanciaAtual.manifestacaoSangueFraco.disciplinaNome} (Nv {ressonanciaAtual.manifestacaoSangueFraco.nivel})</strong> [{ressonanciaAtual.manifestacaoSangueFraco.poderes.map((p) => p.nome).join(', ')}]
                  </span>
                )}
                {papelUsuario === 'narrador' && (
                  <button
                    type="button"
                    onClick={async () => {
                      await encerrarRessonanciaPersonagemServer({ data: { personagemId: id } })
                      toast.success('Ressonância encerrada.')
                      router.invalidate()
                    }}
                    className="ml-1 text-muted-foreground hover:text-foreground font-bold"
                    title="Encerrar Ressonância"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            {compulsaoAtiva && (
              <div className="flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-0.5 text-xs text-foreground">
                <span className="font-semibold text-destructive">Compulsão Ativa:</span>
                <span>{compulsaoAtiva.nome}</span>
                {papelUsuario === 'narrador' && (
                  <button
                    type="button"
                    onClick={async () => {
                      await encerrarCompulsaoPersonagemServer({ data: { personagemId: id } })
                      toast.success('Compulsão encerrada.')
                      router.invalidate()
                    }}
                    className="ml-1 text-muted-foreground hover:text-foreground font-bold"
                    title="Encerrar Compulsão"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>
        }
        horizonte={
          <HorizonteHumanidade
            trilha={{ humanidade: ficha.humanidade, manchas: marcas.manchas }}
            consulta
            onChange={aoMarcar((t: { manchas: number }) => ({ ...marcas, manchas: t.manchas }))}
          />
        }
      >
        <TrilhaDano
          rotulo="Vitalidade"
          termo="vitalidade"
          dano={marcas.danoVitalidade}
          max={vitalidadeMax(fichaAtual)}
          onChange={aoMarcar((dano: Marcas['danoVitalidade']) => ({ ...marcas, danoVitalidade: dano }))}
        />
        <TrilhaDano
          rotulo="Força de Vontade"
          termo="forca-de-vontade"
          dano={marcas.danoVontade}
          max={vontadeMax(fichaAtual)}
          onChange={aoMarcar((dano: Marcas['danoVontade']) => ({ ...marcas, danoVontade: dano }))}
        />
        <TrilhaFome consulta fome={marcas.fome} onChange={aoMarcar((fome: number) => ({ ...marcas, fome }))} />
      </CabecalhoFicha>

      <div className="mx-auto max-w-[1440px] px-4 min-[1472px]:px-0">
        <Tabs defaultValue="atributos" className="mt-4">
          <TabsList variant="line" className="w-full justify-between gap-2 sm:justify-start sm:gap-6 rounded-none border-b p-0">
            <TabsTrigger value="atributos" className="flex-none px-0 after:bg-vinho">Atributos</TabsTrigger>
            <TabsTrigger value="habilidades" className="flex-none px-0 after:bg-vinho">Habilidades</TabsTrigger>
            <TabsTrigger value="disciplinas" className="flex-none px-0 after:bg-vinho">Disciplinas</TabsTrigger>
            <TabsTrigger value="personagem" className="flex-none px-0 after:bg-vinho">Personagem</TabsTrigger>
          </TabsList>
          <TabsContent value="atributos">
            <ListaTracos grupos={gruposAtributos(ficha)} />
          </TabsContent>
          <TabsContent value="habilidades">
            <ListaTracos grupos={gruposHabilidades(ficha)} />
          </TabsContent>
          <TabsContent value="disciplinas" className="mt-4">
            <ListaDisciplinas ficha={ficha} />
          </TabsContent>
          <TabsContent value="personagem">
            <dl className="mt-4">
              {campos.map((c) => (
                <div key={c.rotulo} className="border-b py-2">
                  <dt className="text-sm text-muted-foreground">{c.rotulo}</dt>
                  <dd className="text-base">{c.valor || '—'}</dd>
                </div>
              ))}
            </dl>

            {ficha.aparencia && (
              <div className="mt-6 flex flex-col gap-1 border-t pt-4">
                <h3 className="font-serif text-lg font-semibold">Aparência</h3>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{ficha.aparencia}</p>
              </div>
            )}

            {ficha.historia && (
              <div className="mt-6 flex flex-col gap-2 border-t pt-4">
                <h3 className="font-serif text-lg font-semibold">História</h3>
                <div className="text-sm text-foreground/90 leading-relaxed">
                  <VisualizadorMarkdown markdown={ficha.historia} />
                </div>
              </div>
            )}

            <section className="mt-8 flex flex-col gap-4 border-t pt-4">
              <h2 className="font-serif text-2xl">Vantagens e Defeitos</h2>
              <ListaVantagens titulo="Vantagens" escolhidas={ficha.vantagens} />
              <ListaVantagens titulo="Defeitos" escolhidas={ficha.defeitos} />
            </section>

            {/* Bloco Coteries na aba Personagem */}
            <section className="mt-8 flex flex-col gap-4 border-t pt-4">
              <h2 className="font-serif text-2xl">Coteries</h2>

              {/* Compartilhar Condição: linha de ajuste, sem cartão (DESIGN.md: linhas finas no lugar de cartões). */}
              <div className="flex min-h-12 items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="compartilhar-condicao" className="text-base font-semibold">
                    Compartilhar Condição
                  </Label>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    Vitalidade, Força de Vontade e Fome ficam visíveis para quem divide uma Coterie com este Personagem.
                    {papelUsuario === 'narrador' && !podeCompartilharCondicao && ' Quem decide é o Jogador.'}
                  </span>
                </div>
                <Switch
                  id="compartilhar-condicao"
                  checked={compartilhando}
                  disabled={!podeCompartilharCondicao || salvandoCondicao}
                  onCheckedChange={toggleCompartilhar}
                />
              </div>

              {/* Lista de Coteries com botão Sair */}
              <div className="flex flex-col divide-y border-y">
                {coteries.length === 0 ? (
                  <p className="py-4 text-sm text-muted-foreground">
                    Este Personagem não faz parte de nenhuma Coterie.
                  </p>
                ) : (
                  coteries.map((c) => (
                    <div key={c.id} className="flex h-12 items-center justify-between">
                      <Link
                        to="/coteries/$id"
                        params={{ id: c.id }}
                        className="text-base font-medium outline-none hover:text-vinho focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {c.nome}
                      </Link>
                      {papelUsuario === 'jogador' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => setCoterieSaindo(c)}
                            >
                              Sair
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Sair de {c.nome}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {nome} deixará de fazer parte desta Coterie. Para voltar, o Narrador precisará enviar um novo convite.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setCoterieSaindo(null)}>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={confirmarSaidaCoterie}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Sair da Coterie
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
