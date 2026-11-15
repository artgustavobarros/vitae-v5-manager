import { useRouter } from '@tanstack/react-router'
import { useMemo, type ReactNode } from 'react'
import { toast } from 'sonner'

import { TermoRegra } from '#/components/consulta-regra'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { VisualizadorMarkdown } from '#/components/ui/editor-rich-text'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import type { CompulsaoAtivaPersonagem, RessonanciaAtualPersonagem } from '#/db/schema'
import type { Papel } from '#/domain/acesso'
import { marcasDe, vitalidadeMax, vontadeMax, type Ficha, type Marcas } from '#/domain/ficha'
import type { AcessoFicha, StatusPersonagem } from '#/domain/permissoes-ficha'
import { ehSangueFraco } from '#/domain/sorteios'
import { useMarcasSincronizadas } from '#/lib/use-marcas-sincronizadas'
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
 * a marca aparece na hora; a fila preserva alterações ainda não confirmadas.
 */
export function FichaPersonagem({
  id,
  nome,
  jogadorNome,
  status,
  ficha,
  revisaoMarcas,
  acesso,
  ressonanciaAtual,
  compulsaoAtiva,
  papelUsuario,
  barra,
}: {
  id: string
  nome: string
  jogadorNome?: string | null
  status: StatusPersonagem
  ficha: Ficha
  revisaoMarcas: number
  acesso: AcessoFicha
  ressonanciaAtual?: RessonanciaAtualPersonagem | null
  compulsaoAtiva?: CompulsaoAtivaPersonagem | null
  papelUsuario?: Papel
  barra: ReactNode
}) {
  const router = useRouter()
  const marcasRecebidas = useMemo(() => marcasDe(ficha), [ficha])
  const sincronizacao = useMarcasSincronizadas(id, marcasRecebidas, revisaoMarcas)
  const { marcas } = sincronizacao
  const podeMarcar = acesso === 'editar' && !sincronizacao.bloqueado

  const aoMarcar = <T,>(aplicar: (valor: T) => Partial<Marcas>) =>
    podeMarcar ? (valor: T) => sincronizacao.alterar(aplicar(valor)) : undefined

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
            {jogadorNome && (
              <Badge variant="secondary" className="font-normal text-xs">
                Jogador: <strong className="font-semibold ml-1">{jogadorNome}</strong>
              </Badge>
            )}
            {sincronizacao.pendentes > 0 && !sincronizacao.erro && (
              <Badge variant="outline" role="status" aria-live="polite">
                {sincronizacao.persistindo ? 'Salvando neste dispositivo…' : 'Sincronizando alterações…'}
              </Badge>
            )}
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
            onChange={aoMarcar((t: { manchas: number }) => ({ manchas: t.manchas }))}
          />
        }
      >
        <TrilhaDano
          rotulo="Vitalidade"
          termo="vitalidade"
          dano={marcas.danoVitalidade}
          max={vitalidadeMax(fichaAtual)}
          onChange={aoMarcar((dano: Marcas['danoVitalidade']) => ({ danoVitalidade: dano }))}
        />
        <TrilhaDano
          rotulo="Força de Vontade"
          termo="forca-de-vontade"
          dano={marcas.danoVontade}
          max={vontadeMax(fichaAtual)}
          onChange={aoMarcar((dano: Marcas['danoVontade']) => ({ danoVontade: dano }))}
        />
        <TrilhaFome consulta fome={marcas.fome} onChange={aoMarcar((fome: number) => ({ fome }))} />
      </CabecalhoFicha>

      <div className="mx-auto max-w-[1440px] px-4 min-[1472px]:px-0">
        {sincronizacao.erro && (
          <Alert className="mt-4">
            <AlertDescription>
              <p>{sincronizacao.erro}</p>
              {sincronizacao.pendentes > 0 && (
                <p>Há {sincronizacao.pendentes} alterações pendentes neste dispositivo.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {!sincronizacao.bloqueado && (
                  <Button variant="outline" size="sm" onClick={sincronizacao.tentarNovamente}>
                    Tentar novamente
                  </Button>
                )}
                {sincronizacao.pendentes > 0 && (
                  <Button variant="ghost" size="sm" disabled={sincronizacao.enviando || sincronizacao.persistindo} onClick={async () => {
                    await sincronizacao.descartar()
                    await router.invalidate()
                  }}>
                    Descartar alterações pendentes
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
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

            {ficha.conviccoes && ficha.conviccoes.length > 0 && (
              <div className="mt-6 flex flex-col gap-2 border-t pt-4">
                <h3 className="font-serif text-lg font-semibold">Convicções e Pedras de Toque</h3>
                <ul className="flex flex-col gap-2">
                  {ficha.conviccoes.map((c, i) => (
                    <li key={i} className="border-b pb-2 text-sm">
                      <span className="block font-medium text-foreground">{c.conviccao || '—'}</span>
                      {c.pedraDeToque && (
                        <span className="block text-xs text-muted-foreground">Pedra de Toque: {c.pedraDeToque}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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

          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
