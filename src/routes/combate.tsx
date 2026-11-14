import { rotuloOrigemPersonagem } from '#/domain/permissoes-ficha'
import { ChipDificuldadeAntagonista } from '#/components/chip-dificuldade-antagonista'
import { separarDificuldadeGeral } from '#/domain/dificuldade-antagonista'
import { ConfigurarPoderesAntagonista, ResumoRecursosSobrenaturais } from '#/components/poderes-antagonista'
import { obterPerfilSobrenatural, sortearRecursosSobrenaturais, validarSelecaoParaModelo, type RecursosSobrenaturais } from '#/domain/poderes-antagonista'
import { RegraEspecialAntagonista } from '#/components/regra-especial-antagonista'
import { normalizarEspecialAntagonista, type EspecialAntagonista } from '#/domain/bestiario'
import { EditorFichaAntagonistaCompleta, ResumoFichaAntagonistaCompleta } from '#/components/ficha-antagonista-completa'
import { criarFichaAntagonistaCompleta, type FichaAntagonistaCompleta } from '#/domain/ficha-antagonista'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { cn } from 'cn'
import {
  ArrowRight,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  GripVertical,
  Library,
  Play,
  Plus,
  Save,
  Skull,
  Swords,
  Trash2,
  Users,
} from 'lucide-react'
import { Accessibility, defaultPreset } from '@dnd-kit/dom'
import { OptimisticSortingPlugin } from '@dnd-kit/dom/sortable'
import { DragDropProvider, DragOverlay, useDragDropManager, type DragEndEvent, type DragOverEvent } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'
import { useCallback, useEffect, useMemo, useState, type ComponentProps } from 'react'
import { toast } from 'sonner'

const pluginsCombate = [
  ...defaultPreset.plugins.filter((plugin) => plugin !== Accessibility),
  OptimisticSortingPlugin,
  Accessibility.configure({
    screenReaderInstructions: {
      draggable:
        'Pressione Espaço para selecionar o participante. Use as setas para mover, Espaço para soltar e Escape para cancelar.',
    },
    announcements: {
      dragstart: () => 'Participante selecionado para reordenar.',
      dragover: ({ operation }: DragOverEvent) =>
        isSortable(operation.source) ? `Posição ${operation.source.index + 1}.` : undefined,
      dragend: ({ canceled }: DragEndEvent) =>
        canceled ? 'Reordenação cancelada.' : 'Participante reposicionado.',
    },
  }),
]

import { BarraApp } from '#/components/barra-app'
import { CardCombate } from '#/components/combate/card-combate'
import { CarrosselCombate } from '#/components/combate/carrossel-combate'
import { BotaoVisibilidadeCondicao } from '#/components/combate/visibilidade-condicao'
import { BadgeSaude, TrilhaTatilExpandida, FomeTatilExpandida, BadgesCondicoes, VisaoJogador } from '#/components/combate/visao-jogador'
import { LinkExibicaoPublica } from '#/components/exibicao-publica/link-exibicao-publica'
import { BadgeEspecial } from '#/components/badge-especial'
import { ChipParadaExcepcional } from '#/components/chip-parada-excepcional'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Combobox } from '#/components/combobox'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '#/components/ui/card'
import { CarrosselBadges } from '#/components/ui/carrossel-badges'
import { Input, InputNumero } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { SelectMultiplo } from '#/components/ui/select-multiplo'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { EditorRichText, VisualizadorMarkdown } from '#/components/ui/editor-rich-text'
import type { ModeloAntagonista } from '#/domain/bestiario'
import {
  calcularEstadoSaude,
  ehInimigoIncapacitado,
  criarInimigoDeModelo,
  ehParticipanteVampiro,
  obterProximoIndiceAtivo,
  type ParticipanteCombate,
  type ParticipanteInimigo,
  type ParticipantePersonagem,
} from '#/domain/combate'
import type { Dano } from '#/domain/trilhas'
import { listarModelosBestiario, salvarModeloBestiario } from '#/server/bestiario'
import { listarPreCombates, salvarPreCombate, excluirPreCombate } from '#/server/pre-combate'
import { aplicarCustomizacaoAoModelo, type InimigoPreCombate, type PreCombate } from '#/domain/pre-combate'
import {
  adicionarParticipanteCombateServer,
  alternarCondicaoParticipanteCombateServer,
  alternarRevelarVitalidadeCombateServer,
  definirRevelarCondicaoCombateServer,
  aplicarDanoInimigoCombateServer,
  atualizarParticipanteInimigoServer,
  avancarTurnoCombateServer,
  carregarCombate,
  encerrarCombateServer,
  iniciarCombateServer,
  listarCoteriesParaCombate,
  listarPersonagensParaCombate,
  removerParticipanteCombateServer,
  reordenarParticipantesCombateServer,
  voltarTurnoCombateServer,
  type CoterieCombateOpcao,
  type EstadoCombateNarrador,
  type PersonagemCombateOpcao,
} from '#/server/combate'
import { marcar } from '#/server/personagens'



export const Route = createFileRoute('/combate')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    if (context.usuario.papel === 'narrador') throw redirect({ to: '/narrador/combate' })
  },
  loader: async ({ context }) => {
    const dados = await carregarCombate()
    if (context.usuario?.papel === 'narrador') {
      const [modelos, personagens, preCombates, coteries] = await Promise.all([
        listarModelosBestiario(),
        listarPersonagensParaCombate(),
        listarPreCombates(),
        listarCoteriesParaCombate(),
      ])
      return {
        ...dados,
        modelos,
        personagens: personagens as PersonagemCombateOpcao[],
        preCombates,
        coteries,
      }
    }
    return {
      ...dados,
      modelos: [] as ModeloAntagonista[],
      personagens: [] as PersonagemCombateOpcao[],
      preCombates: [] as PreCombate[],
      coteries: [] as CoterieCombateOpcao[],
    }
  },
  component: PaginaCombate,
})

type InimigoPreCombateRascunho = Omit<InimigoPreCombate, 'recursosSobrenaturais'> & {
  recursos?: RecursosSobrenaturais
}

function serializarInimigoPreCombate(i: InimigoPreCombateRascunho): InimigoPreCombate {
  return {
    id: i.id,
    modeloId: i.modeloId,
    nome: i.nome,
    ...(i.recursos !== undefined ? { recursosSobrenaturais: i.recursos } : {}),
    ...(i.vitalidadeMax !== undefined ? { vitalidadeMax: i.vitalidadeMax } : {}),
    ...(i.vontadeMax !== undefined ? { vontadeMax: i.vontadeMax } : {}),
    ...(i.paradas !== undefined ? { paradas: i.paradas } : {}),
    ...(i.fichaCompleta !== undefined ? { fichaCompleta: i.fichaCompleta } : {}),
    ...(i.especiais !== undefined ? { especiais: i.especiais } : {}),
    ...(i.notas !== undefined ? { notas: i.notas } : {}),
  }
}

function rascunhoDeInimigoPreCombate(i: InimigoPreCombate): InimigoPreCombateRascunho {
  const { recursosSobrenaturais, ...resto } = structuredClone(i)
  return {
    ...resto,
    ...(recursosSobrenaturais !== undefined ? { recursos: recursosSobrenaturais } : {}),
  }
}

function clonarInimigoRascunho(i: InimigoPreCombateRascunho): InimigoPreCombateRascunho {
  return rascunhoDeInimigoPreCombate(serializarInimigoPreCombate(i))
}

function acrescentarInimigoRascunho(
  atuais: InimigoPreCombateRascunho[],
  modeloId: string,
  nomeModelo: string,
): InimigoPreCombateRascunho[] {
  let numero = atuais.filter((i) => i.modeloId === modeloId).length + 1
  while (atuais.some((i) => i.nome === `${nomeModelo} #${numero}`)) numero++
  return [...atuais, { id: crypto.randomUUID(), modeloId, nome: `${nomeModelo} #${numero}` }]
}

function duplicarInimigoRascunhoNaLista(
  atuais: InimigoPreCombateRascunho[],
  inimigo: InimigoPreCombateRascunho,
  nomeModelo?: string,
): InimigoPreCombateRascunho[] {
  const prefixo = inimigo.nome.replace(/\s+#\d+$/, '').trim() || nomeModelo || 'Inimigo'
  let numero = atuais.filter((i) => i.modeloId === inimigo.modeloId).length + 1
  while (atuais.some((i) => i.nome === `${prefixo} #${numero}`)) numero++
  return [
    ...atuais,
    {
      ...clonarInimigoRascunho(inimigo),
      id: crypto.randomUUID(),
      nome: `${prefixo} #${numero}`,
    },
  ]
}

/** Card de Inimigo na preparação do Combate ou no Pré-Combate: mesma linguagem visual do Combate real. */
function CardInimigoPreCombate({
  inimigo,
  modelo,
  onRenomear,
  onAlterarRecursos,
  onDuplicar,
  onEditar,
  onRemover,
}: {
  inimigo: InimigoPreCombateRascunho
  modelo: ModeloAntagonista | undefined
  onRenomear: (nome: string) => void
  onAlterarRecursos: (recursos: RecursosSobrenaturais) => void
  onDuplicar: () => void
  onEditar: () => void
  onRemover: () => void
}) {
  const [nomeLocal, setNomeLocal] = useState(inimigo.nome)
  useEffect(() => {
    setNomeLocal(inimigo.nome)
  }, [inimigo.nome])

  const modeloEfetivo = modelo ? aplicarCustomizacaoAoModelo(modelo, inimigo) : undefined
  const resumo = modeloEfetivo ? separarDificuldadeGeral(modeloEfetivo.notas) : null
  const perfilSobrenatural = modeloEfetivo ? obterPerfilSobrenatural(modeloEfetivo) : null
  const temPoderesConfiguraveis = Boolean(
    perfilSobrenatural && (perfilSobrenatural.livres > 0 || Object.keys(perfilSobrenatural.disciplinas).length > 0),
  )
  const temRecursosResumo = Boolean(
    inimigo.recursos &&
      (inimigo.recursos.poderes.length > 0 ||
        inimigo.recursos.rituais.length > 0 ||
        inimigo.recursos.cerimonias.length > 0 ||
        inimigo.recursos.formulas.length > 0),
  )
  const notasVisiveis = resumo?.notas.trim() ?? ''

  return (
    <div data-slide-combate="">
      <CardCombate className="gap-0 py-0 flex h-full flex-col rounded-xl border bg-card overflow-hidden">
        <div className="flex items-start justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Skull className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={nomeLocal}
              onChange={(e) => setNomeLocal(e.target.value)}
              onBlur={() => { if (nomeLocal.trim() && nomeLocal.trim() !== inimigo.nome) onRenomear(nomeLocal.trim()) }}
              aria-label={`Nome de ${inimigo.nome}`}
              className="h-8 -ml-1 border-0 px-1 font-serif text-base font-bold shadow-none focus-visible:ring-1"
            />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              title="Editar este inimigo"
              aria-label={`Editar ${inimigo.nome}`}
              disabled={!modeloEfetivo}
              onClick={onEditar}
            >
              <Edit3 className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              title="Duplicar este inimigo"
              aria-label={`Duplicar ${inimigo.nome}`}
              disabled={!modeloEfetivo}
              onClick={onDuplicar}
            >
              <Copy className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 pb-2">
          {modeloEfetivo?.categoria && <Badge variant="outline" className="text-xs">{modeloEfetivo.categoria}</Badge>}
          {modeloEfetivo?.etiquetas?.map((etiqueta) => (
            <Badge key={etiqueta} variant="outline" className="text-xs text-muted-foreground">{etiqueta}</Badge>
          ))}
          {modeloEfetivo && <Badge variant="secondary" className="text-xs">Vit {modeloEfetivo.vitalidade} · Vont {modeloEfetivo.vontade}</Badge>}
          <ChipDificuldadeAntagonista dificuldade={resumo?.dificuldade ?? null} />
        </div>

        <div className="flex flex-1 flex-col gap-3 px-4 pb-3">
          {!modeloEfetivo ? (
            <p className="text-xs text-destructive">Modelo não encontrado no Bestiário (pode ter sido excluído).</p>
          ) : (
            <>
              {modeloEfetivo.fichaCompleta ? (
                <ResumoFichaAntagonistaCompleta ficha={modeloEfetivo.fichaCompleta} nome={inimigo.nome} />
              ) : (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Físico: <strong className="text-foreground">{modeloEfetivo.paradaFisico}</strong></span>
                  <span>&bull;</span>
                  <span>Social: <strong className="text-foreground">{modeloEfetivo.paradaSocial}</strong></span>
                  <span>&bull;</span>
                  <span>Mental: <strong className="text-foreground">{modeloEfetivo.paradaMental}</strong></span>
                </div>
              )}

              {modeloEfetivo.paradasExcepcionais.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t pt-2">
                  {modeloEfetivo.paradasExcepcionais.map((pe, i) => <ChipParadaExcepcional key={i} nome={pe.nome} valor={pe.valor} />)}
                </div>
              )}

              {(temPoderesConfiguraveis || temRecursosResumo) && (
                <div className="flex flex-wrap items-center gap-2 border-t pt-2">
                  <ConfigurarPoderesAntagonista modelo={modeloEfetivo} valor={inimigo.recursos} onChange={onAlterarRecursos} />
                  <ResumoRecursosSobrenaturais recursos={inimigo.recursos} />
                </div>
              )}

              {modeloEfetivo.especiais.length > 0 && (
                <div className="flex min-w-0 items-center gap-1 border-t pt-2">
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">Especiais:</span>
                  <CarrosselBadges>
                    {modeloEfetivo.especiais.map((esp, i) => <BadgeEspecial key={i} nome={esp.nome} descricao={esp.descricao} />)}
                  </CarrosselBadges>
                </div>
              )}

              {notasVisiveis && (
                <div className="border-t pt-2 text-xs text-muted-foreground italic">
                  <VisualizadorMarkdown markdown={notasVisiveis} />
                </div>
              )}
            </>
          )}

          <div className="mt-auto flex justify-end pt-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-destructive hover:text-destructive"
              title="Remover inimigo"
              aria-label={`Remover ${inimigo.nome}`}
              onClick={onRemover}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardCombate>
    </div>
  )
}

function CardInimigoIncapacitadoNarrador({
  part,
  onAlterarDano,
  onAlternarCondicao,
  onRemover,
  onEditar,
}: {
  part: ParticipanteInimigo
  onAlterarDano: (id: string, tipo: 'vitalidade' | 'vontade', dano: Dano) => Promise<void>
  onAlternarCondicao: (id: string, condId: string) => Promise<void>
  onRemover: (id: string) => Promise<void>
  onEditar: (part: ParticipanteInimigo) => void
}) {
  const ehVampiro = part.categoria?.toLowerCase().includes('vampiro') ?? false

  return (
    <CardCombate estado={calcularEstadoSaude(part.vitalidadeMax, part.danoVitalidade, ehVampiro, part.condicoes).estado}
      className="gap-0 py-0 flex flex-col rounded-lg border border-dashed border-border/70 bg-card/40 opacity-80 hover:opacity-100 transition-opacity text-xs overflow-hidden">
      {/* LINHA 1: IDENTIFICAÇÃO / CATEGORIA / DANO / AÇÕES */}
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <Skull className="size-4 text-muted-foreground shrink-0" />
          <span className="font-serif font-bold text-sm text-foreground truncate">
            {part.nome}
          </span>
          {part.categoria && (
            <Badge variant="outline" className="text-xs py-0 px-1 h-5 text-muted-foreground shrink-0">
              {part.categoria}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs font-mono gap-1 px-2 cursor-pointer"
                title="Ajustar dano do inimigo (reduzir dano agravado abaixo do máximo o reativa na iniciativa)"
              >
                <span className="text-dano-superficial font-bold">{part.danoVitalidade.superficial}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-destructive font-bold">{part.danoVitalidade.agravado}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="end">
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-xs text-foreground">Ajustar Vitalidade</span>
                <TrilhaTatilExpandida
                  rotulo="Vitalidade"
                  dano={part.danoVitalidade}
                  max={part.vitalidadeMax}
                  podeEditar={true}
                  onChange={(novoDano) => onAlterarDano(part.id, 'vitalidade', novoDano)}
                />
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEditar(part)}
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Editar detalhes do inimigo"
          >
            <Edit3 className="size-4" />
          </Button>
        </div>
      </div>

      {/* LINHA 2: ESTADO DE SAÚDE COMO CONDIÇÃO + OUTRAS CONDIÇÕES + REMOVER */}
      <div className="flex items-center justify-between gap-2 px-4 py-1 border-t border-border/40 bg-muted/20 min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          <BadgeSaude
            vitalidadeMax={part.vitalidadeMax}
            dano={part.danoVitalidade}
            ehVampiro={ehVampiro}
            condicoes={part.condicoes}
          />
          <BadgesCondicoes
            participanteId={part.id}
            ehVampiro={ehParticipanteVampiro(part)}
            condicoes={(part.condicoes ?? []).filter(
              (c) => !['morto', 'desacordado', 'incapacitado', 'torpor'].includes(c),
            )}
            podeEditar={true}
            onAlternarCondicao={onAlternarCondicao}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemover(part.id)}
          className="size-7 shrink-0 text-destructive/70 hover:text-destructive ml-auto"
          title="Remover definitivamente do combate"
          aria-label={`Remover ${part.nome}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </CardCombate>
  )
}


function PaginaCombate() {
  const dados = Route.useLoaderData()

  if (dados.papel === 'narrador') {
    return (
      <VisaoNarrador
        combate={dados.combate}
        modelos={dados.modelos}
        personagens={dados.personagens}
        preCombates={dados.preCombates}
        coteries={dados.coteries}
      />
    )
  }

  return <VisaoJogador combate={dados.combate} />
}

type ParticipanteNarrador = EstadoCombateNarrador['participantes'][number]

interface PropsCardConteudoNarrador {
  part: ParticipanteNarrador
  index: number
  ehTurnoAtual: boolean
  ehProximoTurno: boolean
  handleRef?: (el: HTMLElement | null) => void
  onEditarInimigo: (part: ParticipanteInimigo) => void
  onAlternarRevelar: (id: string, revelar?: boolean) => Promise<void>
  onRemover: (id: string) => void
  onAlterarDanoInimigo: (partId: string, tipo: 'vitalidade' | 'vontade', novoDano: Dano) => void
  onAlterarDanoPersonagem: (personagemId: string, tipo: 'vitalidade' | 'vontade', novoDano: Dano) => void
  onAlterarFomePersonagem: (personagemId: string, novaFome: number) => void
  onAlternarCondicao: (partId: string, condicaoId: string) => Promise<void>
}

function CardConteudoNarrador({
  part,
  index,
  ehTurnoAtual,
  ehProximoTurno,
  handleRef,
  onEditarInimigo,
  onAlternarRevelar,
  onRemover,
  onAlterarDanoInimigo,
  onAlterarDanoPersonagem,
  onAlterarFomePersonagem,
  onAlternarCondicao,
}: PropsCardConteudoNarrador) {
  const resumoInimigo = part.tipo === 'inimigo' ? separarDificuldadeGeral(part.notas) : null
  const visibilidadeCondicao = part.tipo === 'personagem' && (
    <BotaoVisibilidadeCondicao revelada={part.revelarCondicao !== false}
      onAlterar={(revelar) => onAlternarRevelar(part.id, revelar)} />
  )
  const saude = part.tipo === 'inimigo'
    ? calcularEstadoSaude(part.vitalidadeMax, part.danoVitalidade, ehParticipanteVampiro(part), part.condicoes)
    : part.condicaoPersonagem
      ? calcularEstadoSaude(part.condicaoPersonagem.vitalidadeMax, part.condicaoPersonagem.danoVitalidade, true, part.condicoes)
      : undefined

  return (
    <CardCombate estado={saude?.estado}
      className={cn(
        'py-4 flex h-full flex-col transition-all duration-150',
        ehTurnoAtual && 'border-2 border-vinho shadow-md bg-vinho/3',
        ehProximoTurno && !ehTurnoAtual && 'border-2 border-dano-superficial/60 shadow-sm bg-dano-superficial/3',
        !ehTurnoAtual && !ehProximoTurno && 'border border-border opacity-95',
      )}
    >
      <CardHeader className="py-2 px-4 flex flex-row items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div
            ref={handleRef}
            data-arrastar-participante=""
            className="cursor-grab active:cursor-grabbing p-1.5 -ml-1 text-muted-foreground/60 hover:text-foreground shrink-0 mt-0.5 touch-none rounded-md hover:bg-muted/50"
            title="Arraste para reordenar a iniciativa"
          >
            <GripVertical className="size-4 pointer-events-none" />
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-bold text-muted-foreground">
            {index + 1}
          </span>
          <div className="flex flex-wrap items-start gap-2 pt-1 min-w-0">
            <CardTitle className="max-w-full font-serif text-xl truncate leading-tight" title={part.nome}>{part.nome}</CardTitle>
            {ehTurnoAtual && (
              <Badge className="bg-vinho text-primary-foreground border-0 text-xs font-semibold shrink-0">
                Agindo agora
              </Badge>
            )}
            {ehProximoTurno && !ehTurnoAtual && (
              <Badge
                variant="outline"
                className="border-dano-superficial/80 bg-dano-superficial/10 text-dano-superficial font-semibold text-xs flex items-center gap-1 shrink-0"
              >
                <ArrowRight className="size-3" />
                Próximo a agir
              </Badge>
            )}
            {part.tipo === 'inimigo' ? (
              <Badge variant="outline" className="text-xs shrink-0">
                Inimigo
              </Badge>
            ) : part.ehPdN || part.ehPdn ? (
              <Badge variant="outline" className="text-xs shrink-0">
                PdN
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs shrink-0">
                {part.jogadorNome ? `PJ • ${part.jogadorNome}` : 'Personagem'}
              </Badge>
            )}
            {part.tipo === 'inimigo' ? (
              <BadgeSaude
                vitalidadeMax={part.vitalidadeMax}
                dano={part.danoVitalidade}
                condicoes={part.condicoes}
                ehVampiro={part.categoria?.toLowerCase().includes('vampiro') ?? false}
              />
            ) : part.condicaoPersonagem ? (
              <BadgeSaude
                vitalidadeMax={part.condicaoPersonagem.vitalidadeMax}
                dano={part.condicaoPersonagem.danoVitalidade}
                condicoes={part.condicoes}
                ehVampiro={true}
              />
            ) : null}
          </div>
        </div>

        {part.tipo === 'inimigo' && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditarInimigo(part as ParticipanteInimigo)}
              className="size-8"
              title="Editar este inimigo no combate (status, especiais, notas)"
            >
              <Edit3 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAlternarRevelar(part.id)}
              className="size-8"
              title={
                part.revelarVitalidade
                  ? 'Ocultar Vitalidade dos Jogadores'
                  : 'Revelar Vitalidade aos Jogadores'
              }
            >
              {part.revelarVitalidade ? (
                <Eye className="size-4 text-vinho" />
              ) : (
                <EyeOff className="size-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-1 pb-3 px-4 flex flex-1 flex-col gap-2">
        {part.tipo === 'inimigo' ? (
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex flex-col gap-2 items-start min-w-0">
                <TrilhaTatilExpandida
                  rotulo="Vitalidade"
                  dano={part.danoVitalidade}
                  max={part.vitalidadeMax}
                  podeEditar={true}
                  onChange={(dano) =>
                    onAlterarDanoInimigo(part.id, 'vitalidade', dano)
                  }
                />
                <TrilhaTatilExpandida
                  rotulo="Força de Vontade"
                  dano={part.danoVontade}
                  max={part.vontadeMax}
                  podeEditar={true}
                  onChange={(dano) =>
                    onAlterarDanoInimigo(part.id, 'vontade', dano)
                  }
                />
              </div>
            </div>

            {part.fichaCompleta && <ResumoFichaAntagonistaCompleta ficha={part.fichaCompleta} nome={part.nome} />}
            <ChipDificuldadeAntagonista dificuldade={resumoInimigo?.dificuldade ?? null} />
            <ResumoRecursosSobrenaturais recursos={part.recursosSobrenaturais} />
            {!part.fichaCompleta && part.paradas && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1 border-t">
                <span>
                  Físico: <strong className="text-foreground">{part.paradas.fisico}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Social: <strong className="text-foreground">{part.paradas.social}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Mental: <strong className="text-foreground">{part.paradas.mental}</strong>
                </span>
              </div>
            )}

            {((part.paradas.excepcionais ?? part.paradas.especiais) ?? []).length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t pt-1">
                <span className="text-xs font-medium text-muted-foreground">Paradas Excepcionais:</span>
                {((part.paradas.excepcionais ?? part.paradas.especiais) ?? []).map((pe, i) => (
                  <ChipParadaExcepcional key={i} nome={pe.nome} valor={pe.valor} />
                ))}
              </div>
            )}

            {resumoInimigo?.notas && (
              <div className="text-xs text-muted-foreground italic">
                <VisualizadorMarkdown markdown={resumoInimigo.notas} />
              </div>
            )}

            {part.especiais && part.especiais.length > 0 && (
              <div className="flex items-center gap-1 pt-1 border-t min-w-0">
                <span className="text-xs font-medium text-muted-foreground shrink-0">Especiais:</span>
                <CarrosselBadges>
                  {part.especiais.map((esp, i) => (
                    <BadgeEspecial key={i} nome={esp.nome} descricao={esp.descricao} />
                  ))}
                </CarrosselBadges>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-3">
            {visibilidadeCondicao}
            {part.condicaoPersonagem ? (
              <div data-condicao-combate="" className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex flex-col gap-2 items-start min-w-0">
                  <TrilhaTatilExpandida
                    rotulo="Vitalidade"
                    dano={part.condicaoPersonagem.danoVitalidade}
                    max={part.condicaoPersonagem.vitalidadeMax}
                    podeEditar={true}
                    onChange={(dano) =>
                      onAlterarDanoPersonagem(part.personagemId, 'vitalidade', dano)
                    }
                  />
                  <TrilhaTatilExpandida
                    rotulo="Força de Vontade"
                    dano={part.condicaoPersonagem.danoVontade}
                    max={part.condicaoPersonagem.vontadeMax}
                    podeEditar={true}
                    onChange={(dano) =>
                      onAlterarDanoPersonagem(part.personagemId, 'vontade', dano)
                    }
                  />
                </div>

                <FomeTatilExpandida
                  fome={part.condicaoPersonagem.fome}
                  podeEditar={true}
                  onChange={(novaFome) =>
                    onAlterarFomePersonagem(part.personagemId, novaFome)
                  }
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Condição indisponível.</p>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1 border-t min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground shrink-0">Condições:</span>
            <BadgesCondicoes
              participanteId={part.id}
              ehVampiro={ehParticipanteVampiro(part)}
              condicoes={part.condicoes}
              podeEditar={true}
              onAlternarCondicao={onAlternarCondicao}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemover(part.id)}
            className="size-8 shrink-0 text-destructive hover:text-destructive ml-auto"
            aria-label="Remover participante"
            title="Remover participante do combate"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </CardCombate>
  )
}

function CarrosselNarrador(props: ComponentProps<typeof CarrosselCombate>) {
  const manager = useDragDropManager()
  const atualizarDestinos = useCallback(() => {
    if (!manager) return
    // A faixa se desloca por transform, sem o evento de scroll que o Dnd observa.
    for (const destino of manager.registry.droppables) destino.refreshShape()
    manager.collisionObserver.forceUpdate()
  }, [manager])
  return <CarrosselCombate {...props} onDeslocar={atualizarDestinos} />
}

function CardParticipanteSortavel({
  part,
  index,
  totalParticipantes,
  ehTurnoAtual,
  ehProximoTurno,
  salvandoOrdem,
  onEditarInimigo,
  onAlternarRevelar,
  onRemover,
  onAlterarDanoInimigo,
  onAlterarDanoPersonagem,
  onAlterarFomePersonagem,
  onAlternarCondicao,
}: PropsCardConteudoNarrador & { totalParticipantes: number; salvandoOrdem: boolean }) {
  const { ref, handleRef, isDragging } = useSortable({
    id: part.id,
    index,
    disabled: salvandoOrdem,
  })

  return (
    <div
      ref={ref}
      data-slide-combate=""
      role="group"
      aria-label={`Participante ${index + 1} de ${totalParticipantes}`}
      style={{
        minHeight: isDragging ? 136 : undefined,
      }}
      className={cn(
        'relative transition-transform duration-200 ease-out',
        isDragging &&
          'rounded-xl border-2 border-dashed border-vinho bg-vinho/10 shadow-inner rotate-0 flex items-center justify-center select-none',
      )}
    >
      {isDragging ? (
        <div className="flex items-center gap-2.5 text-xs font-semibold text-vinho uppercase tracking-wider py-8">
          <GripVertical className="size-4 animate-pulse" />
          <span>Posição na iniciativa</span>
        </div>
      ) : (
        <CardConteudoNarrador
          part={part}
          index={index}
          ehTurnoAtual={ehTurnoAtual}
          ehProximoTurno={ehProximoTurno}
          handleRef={handleRef}
          onEditarInimigo={onEditarInimigo}
          onAlternarRevelar={onAlternarRevelar}
          onRemover={onRemover}
          onAlterarDanoInimigo={onAlterarDanoInimigo}
          onAlterarDanoPersonagem={onAlterarDanoPersonagem}
          onAlterarFomePersonagem={onAlterarFomePersonagem}
          onAlternarCondicao={onAlternarCondicao}
        />
      )}
    </div>
  )
}

// ==========================================
// VISÃO DO NARRADOR
// ==========================================
export function VisaoNarrador({
  combate,
  modelos,
  personagens,
  preCombates,
  coteries,
}: {
  combate: EstadoCombateNarrador | null
  modelos: ModeloAntagonista[]
  personagens: PersonagemCombateOpcao[]
  preCombates: PreCombate[]
  coteries: CoterieCombateOpcao[]
}) {
  const router = useRouter()

  const [mostrarParticipantes, setMostrarParticipantes] = useState(false)
  const [iniciandoCombate, setIniciandoCombate] = useState(false)
  const [adicionandoParticipantes, setAdicionandoParticipantes] = useState(false)
  const [dialogEncerrar, setDialogEncerrar] = useState(false)
  const [confirmacaoAgravado, setConfirmacaoAgravado] = useState<{
    participanteId: string
    nome: string
    novoDano: Dano
    ehVampiro: boolean
  } | null>(null)

  const [modelosAtualizados, setModelosAtualizados] = useState<Record<string, ModeloAntagonista>>({})
  const listaModelos = useMemo(
    () => modelos.map((m) => (m.id && modelosAtualizados[m.id] ? modelosAtualizados[m.id] : m)),
    [modelos, modelosAtualizados],
  )

  const [inimigoEmEdicao, setInimigoEmEdicao] = useState<{
    origem: 'combate' | 'montagem' | 'pre-combate'
    id: string
    modeloId?: string | null
    nome: string
    vitalidadeMax: number
    vontadeMax: number
    fichaCompleta?: FichaAntagonistaCompleta | null
    paradas: {
      fisico: number | null
      social: number | null
      mental: number | null
      excepcionais: Array<{ nome: string; valor: number }>
    }
    especiais: EspecialAntagonista[]
    recursosSobrenaturais?: RecursosSobrenaturais
    notas: string
  } | null>(null)
  const [salvandoEdicaoInimigo, setSalvandoEdicaoInimigo] = useState(false)

  const [selecaoPersonagens, setSelecaoPersonagens] = useState<string[]>([])
  const [inimigosParaAdicionar, setInimigosParaAdicionar] = useState<InimigoPreCombateRascunho[]>([])
  const [mostrarPreCombates, setMostrarPreCombates] = useState(false)
  const [preCombateEmEdicao, setPreCombateEmEdicao] = useState<{
    id?: string
    nome: string
    inimigos: InimigoPreCombateRascunho[]
  } | null>(null)
  const [salvandoPreCombate, setSalvandoPreCombate] = useState(false)
  const [preCombateParaExcluir, setPreCombateParaExcluir] = useState<{ id: string; nome: string } | null>(null)
  const [nomeInimigoAvulso, setNomeInimigoAvulso] = useState<string>('')
  const [personagensAvulsosTemp, setPersonagensAvulsosTemp] = useState<string[]>([])
  const [modelosAvulsosTemp, setModelosAvulsosTemp] = useState<string[]>([])
  const [recursosAvulsos, setRecursosAvulsos] = useState<Record<string, RecursosSobrenaturais>>({})

  const [arrastandoId, setArrastandoId] = useState<string | null>(null)
  const [locaisParticipantes, setLocaisParticipantes] = useState<EstadoCombateNarrador['participantes'] | null>(null)
  const [salvandoOrdem, setSalvandoOrdem] = useState(false)

  const participantesAtivos = combate
    ? combate.participantes.filter((p) => !ehInimigoIncapacitado(p))
    : []
  const inimigosIncapacitados = combate
    ? combate.participantes.filter((p) => ehInimigoIncapacitado(p))
    : []

  const participantesExibidos = locaisParticipantes ?? participantesAtivos
  const arrastandoPart = arrastandoId
    ? participantesExibidos.find((p) => p.id === arrastandoId)
    : null

  const participanteAtual = combate?.participantes[combate.turnoAtual]
  const proximoIndex = combate ? obterProximoIndiceAtivo(combate) : -1
  const proximoParticipante =
    proximoIndex !== -1 && combate ? combate.participantes[proximoIndex] : null

  function abrirEditarInimigo(part: ParticipanteInimigo) {
    setInimigoEmEdicao({
      origem: 'combate',
      id: part.id,
      modeloId: part.modeloId ?? null,
      nome: part.nome,
      vitalidadeMax: part.vitalidadeMax,
      vontadeMax: part.vontadeMax,
      fichaCompleta: part.fichaCompleta ? structuredClone(part.fichaCompleta) : null,
      paradas: {
        fisico: part.paradas.fisico,
        social: part.paradas.social,
        mental: part.paradas.mental,
        excepcionais: (
          part.paradas.excepcionais ??
          (part.paradas as unknown as { especiais?: Array<{ nome: string; valor: number }> }).especiais ??
          []
        ).map((pe) => ({ ...pe })),
      },
      especiais: (part.especiais ?? []).map(normalizarEspecialAntagonista),
      recursosSobrenaturais: part.recursosSobrenaturais ? structuredClone(part.recursosSobrenaturais) : undefined,
      notas: part.notas ?? '',
    })
  }

  function abrirEditarInimigoRascunho(inimigo: InimigoPreCombateRascunho, origem: 'montagem' | 'pre-combate') {
    const modeloBase = listaModelos.find((m) => m.id === inimigo.modeloId)
    if (!modeloBase) return
    const modeloEfetivo = aplicarCustomizacaoAoModelo(modeloBase, inimigo)
    setInimigoEmEdicao({
      origem,
      id: inimigo.id,
      modeloId: inimigo.modeloId,
      nome: inimigo.nome,
      vitalidadeMax: modeloEfetivo.vitalidade,
      vontadeMax: modeloEfetivo.vontade,
      fichaCompleta: modeloEfetivo.fichaCompleta ? structuredClone(modeloEfetivo.fichaCompleta) : null,
      paradas: {
        fisico: modeloEfetivo.paradaFisico,
        social: modeloEfetivo.paradaSocial,
        mental: modeloEfetivo.paradaMental,
        excepcionais: modeloEfetivo.paradasExcepcionais.map((pe) => ({ ...pe })),
      },
      especiais: modeloEfetivo.especiais.map(normalizarEspecialAntagonista),
      recursosSobrenaturais: inimigo.recursos ? structuredClone(inimigo.recursos) : undefined,
      notas: modeloEfetivo.notas ?? '',
    })
  }

  async function salvarEdicaoInimigo(escopo: 'instancia' | 'modelo') {
    if (!inimigoEmEdicao) return
    const nomeLimpo = inimigoEmEdicao.nome.trim()
    if (!nomeLimpo) {
      toast.error('Informe o nome do inimigo.')
      return
    }

    const perfil = obterPerfilSobrenatural(inimigoEmEdicao)
    const temRecursos = Boolean(perfil.livres || Object.keys(perfil.disciplinas).length)
    const recursosFinais = temRecursos ? inimigoEmEdicao.recursosSobrenaturais : undefined
    if (recursosFinais) {
      try {
        validarSelecaoParaModelo(inimigoEmEdicao, recursosFinais)
      } catch {
        toast.error('As Disciplinas ou os Especiais mudaram. Configure os poderes do Inimigo antes de salvar.')
        return
      }
    }

    setSalvandoEdicaoInimigo(true)
    try {
      const paradasLimpa = {
        fisico: inimigoEmEdicao.fichaCompleta ? null : (inimigoEmEdicao.paradas.fisico ?? 1),
        social: inimigoEmEdicao.fichaCompleta ? null : (inimigoEmEdicao.paradas.social ?? 1),
        mental: inimigoEmEdicao.fichaCompleta ? null : (inimigoEmEdicao.paradas.mental ?? 1),
        excepcionais: inimigoEmEdicao.paradas.excepcionais
          .map((pe) => ({ nome: pe.nome.trim(), valor: pe.valor }))
          .filter((pe) => pe.nome.length > 0),
      }
      const especiaisLimpos = inimigoEmEdicao.especiais
        .map((esp) => normalizarEspecialAntagonista({ ...esp, nome: esp.nome.trim() }))
        .filter((esp) => esp.nome.length > 0)

      if (escopo === 'modelo') {
        const modeloOriginal = listaModelos.find((m) => m.id === inimigoEmEdicao.modeloId)
        if (!modeloOriginal?.id) {
          throw new Error('Modelo original não encontrado em Antagonistas.')
        }
        const nomeModelo = nomeLimpo.replace(/\s+#\d+$/, '').trim() || modeloOriginal.nome
        const novoModelo: ModeloAntagonista = {
          id: modeloOriginal.id,
          nome: nomeModelo,
          categoria: modeloOriginal.categoria,
          etiquetas: modeloOriginal.etiquetas ?? [],
          vitalidade: inimigoEmEdicao.vitalidadeMax,
          vontade: inimigoEmEdicao.vontadeMax,
          paradaFisico: paradasLimpa.fisico,
          paradaSocial: paradasLimpa.social,
          paradaMental: paradasLimpa.mental,
          paradasExcepcionais: paradasLimpa.excepcionais,
          fichaCompleta: inimigoEmEdicao.fichaCompleta ? structuredClone(inimigoEmEdicao.fichaCompleta) : null,
          especiais: especiaisLimpos,
          notas: inimigoEmEdicao.notas,
        }
        await salvarModeloBestiario({ data: novoModelo })
        setModelosAtualizados((prev) => ({ ...prev, [modeloOriginal.id!]: novoModelo }))
      }

      if (inimigoEmEdicao.origem === 'combate') {
        await atualizarParticipanteInimigoServer({
          data: {
            participanteId: inimigoEmEdicao.id,
            atualizacao: {
              nome: nomeLimpo,
              vitalidadeMax: inimigoEmEdicao.vitalidadeMax,
              vontadeMax: inimigoEmEdicao.vontadeMax,
              paradas: paradasLimpa,
              fichaCompleta: inimigoEmEdicao.fichaCompleta,
              especiais: especiaisLimpos,
              recursosSobrenaturais: recursosFinais ?? null,
              notas: inimigoEmEdicao.notas,
            },
          },
        })
      } else {
        const aplicarNoRascunho = (item: InimigoPreCombateRascunho): InimigoPreCombateRascunho =>
          escopo === 'modelo'
            ? {
                id: item.id,
                modeloId: item.modeloId,
                nome: nomeLimpo,
                ...(recursosFinais ? { recursos: structuredClone(recursosFinais) } : {}),
              }
            : {
                ...item,
                nome: nomeLimpo,
                vitalidadeMax: inimigoEmEdicao.vitalidadeMax,
                vontadeMax: inimigoEmEdicao.vontadeMax,
                paradas: structuredClone(paradasLimpa),
                fichaCompleta: inimigoEmEdicao.fichaCompleta ? structuredClone(inimigoEmEdicao.fichaCompleta) : null,
                especiais: structuredClone(especiaisLimpos),
                notas: inimigoEmEdicao.notas,
                recursos: recursosFinais ? structuredClone(recursosFinais) : undefined,
              }

        if (inimigoEmEdicao.origem === 'montagem') {
          setInimigosParaAdicionar((atuais) =>
            atuais.map((item) => (item.id === inimigoEmEdicao.id ? aplicarNoRascunho(item) : item)),
          )
        } else {
          atualizarInimigosPreCombateEmEdicao((atuais) =>
            atuais.map((item) => (item.id === inimigoEmEdicao.id ? aplicarNoRascunho(item) : item)),
          )
        }
      }

      setInimigoEmEdicao(null)
      toast.success(
        escopo === 'modelo'
          ? 'Modelo geral e inimigo atualizados.'
          : inimigoEmEdicao.origem === 'combate'
            ? 'Inimigo atualizado no Combate.'
            : 'Inimigo atualizado para este Combate.',
      )
      await router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar inimigo.')
    } finally {
      setSalvandoEdicaoInimigo(false)
    }
  }

  async function handleSalvarEdicaoInimigo(e: React.FormEvent) {
    e.preventDefault()
    await salvarEdicaoInimigo('instancia')
  }

  async function handleAvancarTurno() {
    try {
      await avancarTurnoCombateServer()
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao avançar turno.')
    }
  }

  async function handleVoltarTurno() {
    try {
      await voltarTurnoCombateServer()
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao voltar turno.')
    }
  }

  async function handleEncerrarCombate() {
    try {
      await encerrarCombateServer()
      setDialogEncerrar(false)
      toast.success('Combate encerrado.')
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao encerrar combate.')
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { source } = event.operation
    setArrastandoId(null)

    if (event.canceled || !isSortable(source) || source.initialIndex === source.index) {
      setLocaisParticipantes(null)
      return
    }

    const lista = locaisParticipantes ?? participantesAtivos
    const origem = lista[source.initialIndex]
    const destino = lista[source.index]
    if (!origem || !destino) {
      setLocaisParticipantes(null)
      return
    }

    const novaOrdem = [...lista]
    const [removido] = novaOrdem.splice(source.initialIndex, 1)
    novaOrdem.splice(source.index, 0, removido)

    setLocaisParticipantes(novaOrdem)
    setSalvandoOrdem(true)

    const todosIds = [
      ...novaOrdem.map((p) => p.id),
      ...inimigosIncapacitados.map((p) => p.id),
    ]

    try {
      await reordenarParticipantesCombateServer({ data: { ordemIds: todosIds } })
      await router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao reordenar.')
      await router.invalidate()
    } finally {
      setSalvandoOrdem(false)
      setLocaisParticipantes(null)
    }
  }

  async function handleRemoverParticipante(id: string) {
    try {
      await removerParticipanteCombateServer({ data: { participanteId: id } })
      if (inimigoEmEdicao?.id === id) setInimigoEmEdicao(null)
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao remover.')
    }
  }

  async function handleAlternarRevelar(id: string, revelar?: boolean) {
    try {
      const participante = combate?.participantes.find((p) => p.id === id)
      if (participante?.tipo === 'personagem') {
        await definirRevelarCondicaoCombateServer({ data: { participanteId: id, revelar: revelar ?? participante.revelarCondicao === false } })
      } else {
        await alternarRevelarVitalidadeCombateServer({ data: { participanteId: id } })
      }
      await router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao alternar visibilidade.')
    }
  }

  async function handleAlternarCondicao(participanteId: string, condicaoId: string) {
    try {
      await alternarCondicaoParticipanteCombateServer({
        data: { participanteId, condicaoId },
      })
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao alterar condição.')
    }
  }

  async function handleAlterarDanoInimigo(
    id: string,
    tipoTrilha: 'vitalidade' | 'vontade',
    novoDano: Dano,
    condicaoAdicionar?: string,
  ) {
    if (!combate) return

    const part = combate.participantes.find((p) => p.id === id && p.tipo === 'inimigo') as
      | ParticipanteInimigo
      | undefined

    if (
      tipoTrilha === 'vitalidade' &&
      part &&
      !condicaoAdicionar &&
      novoDano.agravado >= part.vitalidadeMax &&
      part.danoVitalidade.agravado < part.vitalidadeMax
    ) {
      const ehVampiro = part.categoria?.toLowerCase().includes('vampiro') ?? false
      setConfirmacaoAgravado({
        participanteId: id,
        nome: part.nome,
        novoDano,
        ehVampiro,
      })
      return
    }

    try {
      await aplicarDanoInimigoCombateServer({
        data: {
          participanteId: id,
          tipoTrilha,
          dano: novoDano,
          condicaoAdicionar,
        },
      })
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar dano.')
    }
  }

  async function handleAlterarDanoPersonagem(
    personagemId: string,
    tipoTrilha: 'vitalidade' | 'vontade',
    novoDano: Dano,
  ) {
    try {
      const marcas =
        tipoTrilha === 'vitalidade'
          ? { danoVitalidade: novoDano }
          : { danoVontade: novoDano }
      await marcar({ data: { id: personagemId, marcas } })
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar dano do personagem.')
    }
  }

  async function handleAlterarFomePersonagem(personagemId: string, novaFome: number) {
    try {
      await marcar({ data: { id: personagemId, marcas: { fome: novaFome } } })
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar fome do personagem.')
    }
  }

  async function handleIniciarNovoCombate() {
    if (iniciandoCombate) return
    setIniciandoCombate(true)
    try {
      const participantes: ParticipanteCombate[] = []

      for (const pId of selecaoPersonagens) {
        const personagemEscolhido = personagens.find((p) => p.id === pId)
        if (personagemEscolhido) {
          participantes.push({
            id: crypto.randomUUID(),
            tipo: 'personagem',
            personagemId: personagemEscolhido.id,
            nome: personagemEscolhido.nome || '(Sem nome)',
            jogadorNome: personagemEscolhido.jogadorNome ?? null,
            ehPdN: personagemEscolhido.ehPdN,
            ehPdn: personagemEscolhido.ehPdN,
            revelarCondicao: true,
            condicoes: [],
          })
        }
      }

      for (const inimigoInfo of inimigosParaAdicionar) {
        const modeloBase = listaModelos.find((m) => m.id === inimigoInfo.modeloId)
        if (modeloBase) {
          const modeloEfetivo = aplicarCustomizacaoAoModelo(modeloBase, inimigoInfo)
          participantes.push(
            criarInimigoDeModelo(
              modeloEfetivo,
              { id: inimigoInfo.id, nome: inimigoInfo.nome },
              inimigoInfo.recursos ?? sortearRecursosSobrenaturais(modeloEfetivo),
            ),
          )
        }
      }

      if (participantes.length === 0) {
        toast.error('Selecione pelo menos um participante para iniciar o combate.')
        return
      }

      await iniciarCombateServer({ data: { participantes } })
      setSelecaoPersonagens([])
      setInimigosParaAdicionar([])
      setPreCombateEmEdicao(null) // Se veio do carrossel de edição de um Pré-Combate, sai dele.
      setInimigoEmEdicao(null)
      toast.success('Combate iniciado!')
      await router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao iniciar combate.')
    } finally {
      setIniciandoCombate(false)
    }
  }

  function adicionarInimigoNaMontagem(modeloId: string) {
    const modelo = listaModelos.find((m) => m.id === modeloId)
    if (!modelo) return
    setInimigosParaAdicionar((atuais) => acrescentarInimigoRascunho(atuais, modeloId, modelo.nome))
  }

  function duplicarInimigoNaMontagem(inimigo: InimigoPreCombateRascunho) {
    const modelo = listaModelos.find((m) => m.id === inimigo.modeloId)
    setInimigosParaAdicionar((atuais) => duplicarInimigoRascunhoNaLista(atuais, inimigo, modelo?.nome))
  }

  function handleAdicionarCoterieNaSelecao(
    coterieId: string,
    atual: string[],
    setter: (ids: string[]) => void,
    idsIndisponiveis: string[] = [],
  ) {
    const cot = coteries.find((c) => c.id === coterieId)
    if (!cot) return
    const idsDisponiveis = cot.personagemIds.filter(
      (id) => personagens.some((p) => p.id === id) && !idsIndisponiveis.includes(id),
    )
    const novos = idsDisponiveis.filter((id) => !atual.includes(id))
    if (novos.length === 0) {
      toast.error(`Todos os personagens de "${cot.nome}" já estão em uso.`)
      return
    }
    setter([...atual, ...novos])
    toast.success(`${novos.length} personagem(ns) de "${cot.nome}" adicionado(s).`)
  }

  function handleCarregarPreCombate(preCombateId: string) {
    const pc = preCombates.find((p) => p.id === preCombateId)
    if (!pc) return

    const novosInimigos = pc.inimigos.map((inimigo) => ({
      ...rascunhoDeInimigoPreCombate(inimigo),
      id: crypto.randomUUID(),
    }))

    setInimigosParaAdicionar([...inimigosParaAdicionar, ...novosInimigos])
    toast.success(`"${pc.nome}" carregado (${novosInimigos.length} inimigo(s)).`)
  }

  // O nome é preenchido na página. Depois de salvar, a edição dos Inimigos
  // continua no carrossel, com salvamento automático.
  function abrirNovoPreCombate() {
    setPreCombateEmEdicao({ nome: '', inimigos: [] })
  }

  function abrirEditarPreCombate(pc: PreCombate) {
    setPreCombateEmEdicao({
      id: pc.id,
      nome: pc.nome,
      inimigos: pc.inimigos.map((i) => ({
        ...rascunhoDeInimigoPreCombate(i),
        id: i.id ?? crypto.randomUUID(),
      })),
    })
    setMostrarPreCombates(false)
  }

  async function persistirPreCombateEmEdicao(novo: {
    id: string
    nome: string
    inimigos: InimigoPreCombateRascunho[]
  }) {
    try {
      await salvarPreCombate({
        data: {
          id: novo.id,
          nome: novo.nome,
          inimigos: novo.inimigos.map(serializarInimigoPreCombate),
        },
      })
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao salvar Pré-Combate.')
    }
  }

  function atualizarInimigosPreCombateEmEdicao(
    mutar: (atual: NonNullable<typeof preCombateEmEdicao>['inimigos']) => NonNullable<typeof preCombateEmEdicao>['inimigos'],
  ) {
    if (!preCombateEmEdicao?.id) return
    const atualizado = { ...preCombateEmEdicao, inimigos: mutar(preCombateEmEdicao.inimigos) }
    setPreCombateEmEdicao(atualizado)
    void persistirPreCombateEmEdicao(atualizado as { id: string; nome: string; inimigos: typeof atualizado.inimigos })
  }

  function renomearPreCombateEmEdicao(nome: string) {
    if (!preCombateEmEdicao?.id || nome === preCombateEmEdicao.nome) return
    const atualizado = { ...preCombateEmEdicao, nome }
    setPreCombateEmEdicao(atualizado)
    void persistirPreCombateEmEdicao(atualizado as { id: string; nome: string; inimigos: typeof atualizado.inimigos })
  }

  function renomearInimigoPreCombateEmEdicao(inimigoId: string, nome: string) {
    atualizarInimigosPreCombateEmEdicao((atual) => atual.map((i) => i.id === inimigoId ? { ...i, nome } : i))
  }

  function alterarRecursosInimigoPreCombateEmEdicao(inimigoId: string, recursos: RecursosSobrenaturais) {
    atualizarInimigosPreCombateEmEdicao((atual) => atual.map((i) => i.id === inimigoId ? { ...i, recursos } : i))
  }

  function removerInimigoPreCombateEmEdicao(inimigoId: string) {
    if (inimigoEmEdicao?.id === inimigoId) setInimigoEmEdicao(null)
    atualizarInimigosPreCombateEmEdicao((atual) => atual.filter((i) => i.id !== inimigoId))
  }

  function adicionarInimigoAoPreCombateEmEdicao(modeloId: string) {
    if (!preCombateEmEdicao?.id) return
    const modelo = listaModelos.find((m) => m.id === modeloId)
    if (!modelo) return
    atualizarInimigosPreCombateEmEdicao((atual) => acrescentarInimigoRascunho(atual, modeloId, modelo.nome))
  }

  function duplicarInimigoNoPreCombateEmEdicao(inimigo: InimigoPreCombateRascunho) {
    if (!preCombateEmEdicao?.id) return
    const modelo = listaModelos.find((m) => m.id === inimigo.modeloId)
    atualizarInimigosPreCombateEmEdicao((atual) => duplicarInimigoRascunhoNaLista(atual, inimigo, modelo?.nome))
  }

  // Passo 1 → 2: salva só o nome (já cria no banco, com os Inimigos que já estiverem no rascunho)
  // e a própria página passa a mostrar o carrossel de edição.
  async function handleCriarPreCombateBase() {
    if (!preCombateEmEdicao) return
    if (!preCombateEmEdicao.nome.trim()) {
      toast.error('Dê um nome ao Pré-Combate.')
      return
    }
    setSalvandoPreCombate(true)
    try {
      const salvo = await salvarPreCombate({
        data: {
          nome: preCombateEmEdicao.nome.trim(),
          inimigos: preCombateEmEdicao.inimigos.map(serializarInimigoPreCombate),
        },
      })
      setMostrarPreCombates(false)
      setPreCombateEmEdicao({
        id: salvo.id,
        nome: salvo.nome,
        inimigos: salvo.inimigos.map(rascunhoDeInimigoPreCombate),
      })
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao criar Pré-Combate.')
    } finally {
      setSalvandoPreCombate(false)
    }
  }

  // Fecha a edição; se ficou um Pré-Combate sem nenhum Inimigo, descarta o rascunho.
  async function handleFecharEdicaoPreCombate() {
    if (preCombateEmEdicao?.id && preCombateEmEdicao.inimigos.length === 0) {
      try {
        await excluirPreCombate({ data: { id: preCombateEmEdicao.id } })
        router.invalidate()
      } catch {
        // Rascunho vazio: falha silenciosa não impede o Narrador de continuar.
      }
    }
    setPreCombateEmEdicao(null)
    setInimigoEmEdicao(null)
    setMostrarPreCombates(false)
  }

  async function handleExcluirPreCombate() {
    if (!preCombateParaExcluir) return
    try {
      await excluirPreCombate({ data: { id: preCombateParaExcluir.id } })
      setPreCombateParaExcluir(null)
      toast.success('Pré-Combate excluído.')
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao excluir Pré-Combate.')
    }
  }

  // Botão "Ativar Combate" dentro do carrossel de edição: usa os Inimigos já salvos no rascunho.
  function handleAtivarCombateAPartirDoPreCombateEmEdicao() {
    if (!preCombateEmEdicao) return
    setInimigosParaAdicionar(
      preCombateEmEdicao.inimigos.map((i) => rascunhoDeInimigoPreCombate(serializarInimigoPreCombate(i))),
    )
    setPreCombateEmEdicao(null)
    setInimigoEmEdicao(null)
  }

  async function handleConfirmarAdicionarAvulso(tipoNovoPart: 'personagem' | 'inimigo') {
    if (adicionandoParticipantes) return
    setAdicionandoParticipantes(true)
    try {
      if (tipoNovoPart === 'personagem') {
        if (personagensAvulsosTemp.length === 0) {
          toast.error('Selecione pelo menos um Personagem.')
          return
        }
        try {
          for (const pId of personagensAvulsosTemp) {
            const personagemEscolhido = personagens.find((p) => p.id === pId)
            if (!personagemEscolhido) continue
            const part: ParticipantePersonagem = {
              id: crypto.randomUUID(),
              tipo: 'personagem',
              personagemId: personagemEscolhido.id,
              nome: personagemEscolhido.nome || '(Sem nome)',
              jogadorNome: personagemEscolhido.jogadorNome ?? null,
              ehPdN: personagemEscolhido.ehPdN,
              ehPdn: personagemEscolhido.ehPdN,
              revelarCondicao: true,
              condicoes: [],
            }
            await adicionarParticipanteCombateServer({ data: { participante: part } })
          }
          setPersonagensAvulsosTemp([])
          toast.success('Participante(s) adicionado(s) ao combate!')
          router.invalidate()
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : 'Falha ao adicionar participante.')
        }
      } else {
        if (modelosAvulsosTemp.length === 0) {
          toast.error('Selecione pelo menos um Modelo de antagonista.')
          return
        }
        try {
          for (const mId of modelosAvulsosTemp) {
            const modelo = listaModelos.find((m) => m.id === mId)
            if (!modelo) continue
            const contagem =
              (combate?.participantes.filter((p) => p.tipo === 'inimigo' && p.modeloId === modelo.id).length ?? 0) + 1
            const nomeFinal =
              modelosAvulsosTemp.length === 1 && nomeInimigoAvulso.trim()
                ? nomeInimigoAvulso.trim()
                : `${modelo.nome} #${contagem}`

            const part = criarInimigoDeModelo(modelo, { id: crypto.randomUUID(), nome: nomeFinal }, recursosAvulsos[mId] ?? sortearRecursosSobrenaturais(modelo))
            await adicionarParticipanteCombateServer({ data: { participante: part } })
          }
          setModelosAvulsosTemp([])
          setNomeInimigoAvulso('')
          setRecursosAvulsos({})
          toast.success('Inimigo(s) adicionado(s) ao combate!')
          router.invalidate()
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : 'Falha ao adicionar participante.')
        }
      }
    } finally {
      setAdicionandoParticipantes(false)
    }
  }

  return (
    <main className="container-app mx-auto min-h-dvh">
      <BarraApp />
      {preCombateEmEdicao?.id ? (
        <div className="flex flex-col gap-6 pt-2 pb-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Library className="size-5 shrink-0 text-muted-foreground" />
              <Input
                key={preCombateEmEdicao.id}
                defaultValue={preCombateEmEdicao.nome}
                aria-label="Nome do Pré-Combate"
                onBlur={(e) => renomearPreCombateEmEdicao(e.target.value.trim() || preCombateEmEdicao!.nome)}
                className="h-auto max-w-sm border-0 px-1 font-serif text-2xl font-bold shadow-none focus-visible:ring-1"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={handleFecharEdicaoPreCombate}>Voltar</Button>
              <Button onClick={handleAtivarCombateAPartirDoPreCombateEmEdicao} disabled={Boolean(combate) || preCombateEmEdicao.inimigos.length === 0} className="gap-2">
                <Swords className="size-4" />
                Ativar Combate
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Edição salva automaticamente. Monte os Inimigos aqui, igual na tela de Combate, e ative quando quiser.
          </p>

          <div className="flex flex-col gap-2 rounded-lg border border-dashed p-4">
            <Label className="font-semibold flex items-center gap-1">
              <Plus className="size-4" />
              Adicionar Inimigo da lista de Antagonistas
            </Label>
            {listaModelos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum modelo cadastrado em Antagonistas.</p>
            ) : (
              <Combobox
                rotulo="Adicionar Inimigo"
                opcoes={listaModelos.map((m) => ({
                  valor: m.id ?? '',
                  rotulo: m.nome,
                  descricao: `${[m.categoria, ...(m.etiquetas ?? [])].join(' · ')} • Vit ${m.vitalidade}, Vont ${m.vontade}`,
                }))}
                valor={null}
                onChange={(id) => adicionarInimigoAoPreCombateEmEdicao(id)}
                placeholder="Buscar e adicionar Inimigo..."
              />
            )}
          </div>

          {preCombateEmEdicao.inimigos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <Skull className="size-10 text-muted-foreground/60 mb-3" />
              <h3 className="font-serif text-xl font-medium">Nenhum Inimigo ainda</h3>
              <p className="max-w-sm text-sm text-muted-foreground mt-1">Busque modelos da lista de Antagonistas acima para adicionar.</p>
            </div>
          ) : (
            <CarrosselCombate>
              {preCombateEmEdicao.inimigos.map((inimigo) => (
                <CardInimigoPreCombate
                  key={inimigo.id}
                  inimigo={inimigo}
                  modelo={listaModelos.find((m) => m.id === inimigo.modeloId)}
                  onRenomear={(nome) => renomearInimigoPreCombateEmEdicao(inimigo.id, nome)}
                  onAlterarRecursos={(recursos) => alterarRecursosInimigoPreCombateEmEdicao(inimigo.id, recursos)}
                  onDuplicar={() => duplicarInimigoNoPreCombateEmEdicao(inimigo)}
                  onEditar={() => abrirEditarInimigoRascunho(inimigo, 'pre-combate')}
                  onRemover={() => removerInimigoPreCombateEmEdicao(inimigo.id)}
                />
              ))}
            </CarrosselCombate>
          )}
        </div>
      ) : (
      <div className="flex flex-col gap-6 pt-2 pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-display text-balance">Combate</h1>
              <LinkExibicaoPublica recurso="combate" />
              {combate && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-base px-3 py-1 font-serif">
                    Rodada {combate.rodada}
                  </Badge>
                  {participanteAtual && (
                    <Badge variant="outline" className="text-xs border-vinho/50 bg-vinho/10 text-vinho font-semibold">
                      Agindo: {participanteAtual.nome} {participanteAtual.tipo === 'inimigo' ? '(Inimigo)' : ''}
                    </Badge>
                  )}
                  {proximoParticipante && proximoParticipante.id !== participanteAtual?.id && (
                    <Badge variant="outline" className="text-xs border-dano-superficial/70 bg-dano-superficial/10 text-dano-superficial font-semibold flex items-center gap-1">
                      <ArrowRight className="size-3" />
                      Próximo: {proximoParticipante.nome} {proximoParticipante.tipo === 'inimigo' ? '(Inimigo)' : ''}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {combate
                ? 'Cena de conflito com sincronização em tempo real. Arraste os cards para reorganizar a iniciativa.'
                : 'Gerenciador de combate e ordem de turnos para a Crônica.'}
            </p>
          </div>

          {!combate ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={abrirNovoPreCombate}
                className="gap-2 self-start sm:self-auto"
              >
                <Plus className="size-4" />
                Novo Pré-Combate
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoltarTurno}
                disabled={combate.rodada === 1 && combate.turnoAtual === 0}
              >
                Turno Anterior
              </Button>
              <Button size="sm" onClick={handleAvancarTurno} className="gap-1 font-semibold">
                <Play className="size-4 fill-current" />
                Próximo Turno
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-expanded={mostrarParticipantes}
                aria-controls="participantes-combate"
                onClick={() => setMostrarParticipantes(!mostrarParticipantes)}
              >
                <Plus className="size-4 mr-1" />
                Participantes
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-expanded={mostrarPreCombates}
                aria-controls="pre-combates-salvos"
                onClick={() => setMostrarPreCombates(!mostrarPreCombates)}
                className="gap-1"
              >
                <Library className="size-4" />
                Pré-Combates
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDialogEncerrar(true)}
              >
                Encerrar
              </Button>
            </div>
          )}
        </div>

      {/* Montagem rápida disponível sem abrir uma janela. */}
      {!combate && <Card aria-labelledby="titulo-combate-agora">
          <CardHeader>
            <CardTitle id="titulo-combate-agora" role="heading" aria-level={2} className="font-serif text-xl flex items-center gap-2">
              <Swords className="size-5" />
              Combate agora
            </CardTitle>
            <CardDescription>
              Escolha os participantes e inicie. Não precisa dar um nome nem salvar antes.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="font-semibold flex items-center gap-1">
                <Users className="size-4" />
                Personagens e PdNs da Crônica
              </Label>
              <SelectMultiplo
                rotulo="Personagens do Combate"
                opcoes={personagens.map((p) => ({
                  valor: p.id,
                  rotulo: p.nome || '(Sem nome)',
                  detalhe: rotuloOrigemPersonagem(p) ?? undefined,
                }))}
                valores={selecaoPersonagens}
                onChange={setSelecaoPersonagens}
                placeholder="Selecionar personagens..."
              />

              {coteries.length > 0 && (
                <div className="flex items-center gap-2">
                  <Combobox
                    opcoes={coteries.map((c) => ({
                      valor: c.id,
                      rotulo: c.nome,
                      descricao: `${c.personagemIds.length} membro(s)`,
                    }))}
                    valor={null}
                    rotulo="Chamar Coterie"
                    onChange={(id) => handleAdicionarCoterieNaSelecao(id, selecaoPersonagens, setSelecaoPersonagens)}
                    placeholder="...ou chamar uma Coterie inteira"
                    mostrarDescricao={false}
                    className="flex-1"
                  />
                </div>
              )}

              {selecaoPersonagens.length > 0 && (
                <div className="flex flex-col gap-1 border rounded-md p-2">
                  {selecaoPersonagens.map((pId) => {
                    const personagemEscolhido = personagens.find((p) => p.id === pId)
                    if (!personagemEscolhido) return null
                    return (
                      <div key={pId} className="flex items-center justify-between text-sm py-1 border-b last:border-b-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{personagemEscolhido.nome || '(Sem nome)'}</span>
                          {rotuloOrigemPersonagem(personagemEscolhido) && (
                            <span className="text-xs text-muted-foreground">{rotuloOrigemPersonagem(personagemEscolhido)}</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive"
                          aria-label={`Remover ${personagemEscolhido.nome || 'Personagem'}`}
                          onClick={() => {
                            setSelecaoPersonagens(selecaoPersonagens.filter((id) => id !== pId))
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-semibold flex items-center gap-1">
                <Skull className="size-4" />
                Inimigos a partir da lista de Antagonistas
              </Label>

              {listaModelos.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum modelo cadastrado em Antagonistas.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <Combobox
                    rotulo="Adicionar Inimigo"
                    opcoes={listaModelos.map((m) => ({
                      valor: m.id ?? '',
                      rotulo: m.nome,
                      descricao: `${[m.categoria, ...(m.etiquetas ?? [])].join(' · ')} • Vit ${m.vitalidade}, Vont ${m.vontade}`,
                    }))}
                    valor={null}
                    onChange={(id) => adicionarInimigoNaMontagem(id)}
                    placeholder="Buscar e adicionar Inimigo..."
                  />

                  {inimigosParaAdicionar.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {inimigosParaAdicionar.map((inimigo) => (
                        <CardInimigoPreCombate
                          key={inimigo.id}
                          inimigo={inimigo}
                          modelo={listaModelos.find((m) => m.id === inimigo.modeloId)}
                          onRenomear={(nome) => {
                            setInimigosParaAdicionar((atuais) =>
                              atuais.map((i) => (i.id === inimigo.id ? { ...i, nome } : i)),
                            )
                          }}
                          onAlterarRecursos={(recursos) => {
                            setInimigosParaAdicionar((atuais) =>
                              atuais.map((i) => (i.id === inimigo.id ? { ...i, recursos } : i)),
                            )
                          }}
                          onDuplicar={() => duplicarInimigoNaMontagem(inimigo)}
                          onEditar={() => abrirEditarInimigoRascunho(inimigo, 'montagem')}
                          onRemover={() => {
                            if (inimigoEmEdicao?.id === inimigo.id) setInimigoEmEdicao(null)
                            setInimigosParaAdicionar((atuais) => atuais.filter((i) => i.id !== inimigo.id))
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {inimigosParaAdicionar.length > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="self-start gap-1"
                      onClick={() => {
                        setPreCombateEmEdicao({
                          nome: '',
                          inimigos: inimigosParaAdicionar.map((i) => rascunhoDeInimigoPreCombate(serializarInimigoPreCombate(i))),
                        })
                      }}
                    >
                      <Save className="size-4" />
                      Salvar esta lista como Pré-Combate
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap justify-between gap-4 border-t">
            <span className="text-sm text-muted-foreground" role="status">
              {selecaoPersonagens.length} Personagem(ns) · {inimigosParaAdicionar.length} Inimigo(s)
            </span>
            <Button type="button" onClick={handleIniciarNovoCombate}
              disabled={iniciandoCombate || selecaoPersonagens.length + inimigosParaAdicionar.length === 0}>
              <Play className="size-4" />
              {iniciandoCombate ? 'Iniciando...' : 'Iniciar Combate'}
            </Button>
          </CardFooter>
      </Card>}
      {combate && mostrarParticipantes && !preCombateEmEdicao?.id && <Card id="participantes-combate" className="mb-8">
          <CardHeader>
            <CardTitle role="heading" aria-level={2} className="font-serif text-xl">Adicionar Participantes</CardTitle>
            <CardDescription>
              Inclui um novo combatente na ordem de turnos atual.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Label>Modelo(s) da lista de Antagonistas</Label>
                  <SelectMultiplo
                    rotulo="Modelos para adicionar"
                    opcoes={listaModelos.map((m) => ({
                      valor: m.id ?? '',
                      rotulo: m.nome,
                      detalhe: `${[m.categoria, ...(m.etiquetas ?? [])].join(' · ')} • Vit ${m.vitalidade}, Vont ${m.vontade}`,
                    }))}
                    valores={modelosAvulsosTemp}
                    onChange={(vals) => {
                      setModelosAvulsosTemp(vals)
                      setNomeInimigoAvulso('')
                    }}
                    placeholder="Selecionar modelo(s)..."
                  />
                </div>
                {modelosAvulsosTemp.map(mId => {
                  const modelo = listaModelos.find(m => m.id === mId)
                  return modelo ? <div key={mId} className="flex flex-col items-start gap-1">
                    {modelosAvulsosTemp.length > 1 && <span className="text-xs text-muted-foreground">{modelo.nome}</span>}
                    <ConfigurarPoderesAntagonista modelo={modelo} valor={recursosAvulsos[mId]} onChange={recursos => setRecursosAvulsos({ ...recursosAvulsos, [mId]: recursos })} />
                  </div> : null
                })}
                {modelosAvulsosTemp.length === 1 && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="nome-inimigo-avulso">Rótulo / Nome no Combate (opcional)</Label>
                      {(() => {
                        const mod = listaModelos.find((m) => m.id === modelosAvulsosTemp[0])
                        return mod ? (
                          <span className="text-xs text-muted-foreground">
                            Tipo: <strong className="font-medium text-foreground">{mod.categoria}</strong>{(mod.etiquetas?.length ?? 0) > 0 && <> · Etiquetas: {mod.etiquetas?.join(', ')}</>}
                          </span>
                        ) : null
                      })()}
                    </div>
                    <Input
                      id="nome-inimigo-avulso"
                      value={nomeInimigoAvulso}
                      onChange={(e) => setNomeInimigoAvulso(e.target.value)}
                      placeholder="Ex: Guarda da Porta #1"
                    />
                  </div>
                )}
                <Button onClick={() => handleConfirmarAdicionarAvulso('inimigo')} disabled={adicionandoParticipantes || modelosAvulsosTemp.length === 0}>
                  Adicionar Inimigos
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Personagem(ns) ou PdN(s)</Label>
                <SelectMultiplo
                  rotulo="Personagens para adicionar"
                  opcoes={personagens.map((p) => ({
                    valor: p.id,
                    rotulo: p.nome || '(Sem nome)',
                    detalhe: rotuloOrigemPersonagem(p) ?? undefined,
                    desabilitado: combate?.participantes.some(
                      (part) => part.tipo === 'personagem' && part.personagemId === p.id,
                    ),
                  }))}
                  valores={personagensAvulsosTemp}
                  onChange={setPersonagensAvulsosTemp}
                  placeholder="Selecionar personagem(ns)..."
                />

                {coteries.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Combobox
                      opcoes={coteries.map((c) => ({
                        valor: c.id,
                        rotulo: c.nome,
                        descricao: `${c.personagemIds.length} membro(s)`,
                      }))}
                      valor={null}
                      rotulo="Chamar Coterie ao Combate"
                      onChange={(id) => {
                        const jaNoCombate = combate.participantes.flatMap((p) => p.tipo === 'personagem' ? [p.personagemId] : [])
                        handleAdicionarCoterieNaSelecao(id, personagensAvulsosTemp, setPersonagensAvulsosTemp, jaNoCombate)
                      }}
                      placeholder="...ou chamar uma Coterie inteira"
                      mostrarDescricao={false}
                      className="flex-1"
                    />
                  </div>
                )}
                <Button onClick={() => handleConfirmarAdicionarAvulso('personagem')} disabled={adicionandoParticipantes || personagensAvulsosTemp.length === 0}>
                  Adicionar Personagens
                </Button>
              </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" onClick={() => setMostrarParticipantes(false)}>Fechar participantes</Button>
          </CardFooter>
      </Card>}
        {(!combate || mostrarPreCombates) && (
          <section id="pre-combates-salvos" className="flex flex-col gap-4" aria-labelledby="titulo-pre-combates">
            <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="titulo-pre-combates" className="font-serif text-xl">
              Pré-Combates salvos
            </h2>
            {combate && <Button variant="outline" onClick={abrirNovoPreCombate}><Plus className="size-4" />Novo Pré-Combate</Button>}
            </div>
            {preCombates.length === 0 && <p className="text-sm text-muted-foreground">Nenhum Pré-Combate salvo. Monte um Combate agora e salve os Inimigos para reutilizar.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {preCombates.map((pc) => (
                <Card key={pc.id} className="gap-3 py-4">
                  <CardHeader className="px-4">
                    <CardTitle className="font-serif text-base flex items-center gap-2 min-w-0">
                      <Skull className="size-4 text-muted-foreground shrink-0" />
                      <span className="truncate" title={pc.nome}>{pc.nome}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {pc.inimigos.length} inimigo(s)
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        disabled={Boolean(combate) || pc.inimigos.length === 0}
                        aria-label={`Carregar ${pc.nome}`}
                        onClick={() => pc.id && handleCarregarPreCombate(pc.id)}
                        className="gap-1"
                      >
                        <Play className="size-4 fill-current" />
                        Carregar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        title="Editar Pré-Combate"
                        onClick={() => abrirEditarPreCombate(pc)}
                      >
                        <Edit3 className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        title="Excluir Pré-Combate"
                        onClick={() => pc.id && setPreCombateParaExcluir({ id: pc.id, nome: pc.nome })}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            </div>
          </section>
        )}

        {combate && (
          <DragDropProvider
            plugins={pluginsCombate}
            onDragStart={(event) => {
              if (event.operation.source) {
                setArrastandoId(String(event.operation.source.id))
                setLocaisParticipantes(participantesAtivos)
              }
            }}
            onDragEnd={handleDragEnd}
          >
            <div aria-busy={salvandoOrdem}>
            <CarrosselNarrador indiceAtual={participantesExibidos.findIndex((p) => p.id === participanteAtual?.id)} participanteAtualId={participanteAtual?.id} reordenando={arrastandoId !== null}>
              {participantesExibidos.map((part, index) => {
                const ehTurnoAtual = combate
                  ? part.id === combate.participantes[combate.turnoAtual]?.id
                  : false
                const ehProximoTurno =
                  combate && proximoIndex !== -1
                    ? part.id === combate.participantes[proximoIndex]?.id
                    : false

                return (
                  <CardParticipanteSortavel
                    key={part.id}
                    part={part}
                    index={index}
                    totalParticipantes={participantesExibidos.length}
                    ehTurnoAtual={ehTurnoAtual}
                    ehProximoTurno={ehProximoTurno}
                    salvandoOrdem={salvandoOrdem}
                    onEditarInimigo={abrirEditarInimigo}
                    onAlternarRevelar={handleAlternarRevelar}
                    onRemover={handleRemoverParticipante}
                    onAlterarDanoInimigo={handleAlterarDanoInimigo}
                    onAlterarDanoPersonagem={handleAlterarDanoPersonagem}
                    onAlterarFomePersonagem={handleAlterarFomePersonagem}
                    onAlternarCondicao={handleAlternarCondicao}
                  />
                )
              })}
            </CarrosselNarrador>
            </div>

            <DragOverlay>
              {arrastandoPart ? (
                <div
                  style={{ transform: 'rotate(2.5deg)', transformOrigin: 'center center' }}
                  className="shadow-2xl ring-2 ring-vinho/70 rounded-xl bg-card overflow-hidden select-none cursor-grabbing pointer-events-none"
                >
                  <CardConteudoNarrador
                    part={arrastandoPart}
                    index={participantesExibidos.findIndex((p) => p.id === arrastandoPart.id)}
                    ehTurnoAtual={
                      combate ? arrastandoPart.id === combate.participantes[combate.turnoAtual]?.id : false
                    }
                    ehProximoTurno={
                      combate && proximoIndex !== -1
                        ? arrastandoPart.id === combate.participantes[proximoIndex]?.id
                        : false
                    }
                    onEditarInimigo={() => {}}
                    onAlternarRevelar={async () => {}}
                    onRemover={() => {}}
                    onAlterarDanoInimigo={() => {}}
                    onAlterarDanoPersonagem={() => {}}
                    onAlterarFomePersonagem={() => {}}
                    onAlternarCondicao={async () => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>

            {/* SEÇÃO INFERIOR: INIMIGOS FORA DE COMBATE (INCAPACITADOS / MORTOS / TORPOR) */}
            {inimigosIncapacitados.length > 0 && (
              <div className="flex flex-col gap-2 pt-4 border-t border-dashed border-border/80 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skull className="size-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Inimigos Fora de Combate ({inimigosIncapacitados.length})
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Fora da iniciativa até o fim do combate
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {inimigosIncapacitados.map((part) => (
                    <CardInimigoIncapacitadoNarrador
                      key={part.id}
                      part={part as ParticipanteInimigo}
                      onAlterarDano={handleAlterarDanoInimigo}
                      onAlternarCondicao={handleAlternarCondicao}
                      onRemover={handleRemoverParticipante}
                      onEditar={abrirEditarInimigo}
                    />
                  ))}
                </div>
              </div>
            )}
          </DragDropProvider>
        )}
      </div>
      )}

      {preCombateEmEdicao && !preCombateEmEdicao.id && (
        <Card className="mb-8" aria-labelledby="titulo-novo-pre-combate">
              <CardHeader>
                <CardTitle id="titulo-novo-pre-combate" role="heading" aria-level={2} className="font-serif text-xl flex items-center gap-2">
                  <Library className="size-5" />
                  Novo Pré-Combate
                </CardTitle>
                <CardDescription>
                  Dê um nome a esse grupo. Depois a própria página mostra o carrossel pra você montar os Inimigos, igual no Combate normal.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-2">
                <Label htmlFor="nome-pre-combate-inicial">Nome do Pré-Combate</Label>
                <Input
                  id="nome-pre-combate-inicial"
                  autoFocus
                  value={preCombateEmEdicao.nome}
                  onChange={(e) => setPreCombateEmEdicao({ ...preCombateEmEdicao, nome: e.target.value })}
                  placeholder="Ex: Emboscada na Boate"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCriarPreCombateBase()
                    }
                  }}
                />
              </CardContent>

              <CardFooter className="justify-end gap-4">
                <Button type="button" variant="outline" onClick={handleFecharEdicaoPreCombate}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleCriarPreCombateBase}
                  disabled={salvandoPreCombate || !preCombateEmEdicao.nome.trim()}
                >
                  {salvandoPreCombate ? 'Salvando...' : 'Salvar Pré-Combate'}
                </Button>
              </CardFooter>
        </Card>
      )}

      {/* CONFIRMAÇÃO DE EXCLUSÃO DE PRÉ-COMBATE */}
      <AlertDialog open={Boolean(preCombateParaExcluir)} onOpenChange={(aberto) => { if (!aberto) setPreCombateParaExcluir(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">Excluir Pré-Combate?</AlertDialogTitle>
            <AlertDialogDescription>
              "{preCombateParaExcluir?.nome}" será removido definitivamente. Combates já iniciados a partir dele não são afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluirPreCombate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* CONFIRMAÇÃO DE ENCERRAMENTO */}
      <AlertDialog open={dialogEncerrar} onOpenChange={setDialogEncerrar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">Encerrar Combate?</AlertDialogTitle>
            <AlertDialogDescription>
              O combate atual será descartado da Crônica e a ordem de turnos será concluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Combate</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEncerrarCombate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Encerrar Combate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(inimigoEmEdicao)}
        onOpenChange={(aberto) => {
          if (!aberto && !salvandoEdicaoInimigo) setInimigoEmEdicao(null)
        }}
      >
        <DialogContent className="max-w-lg max-h-9/10 overflow-y-auto">
          {inimigoEmEdicao && (
            <form onSubmit={handleSalvarEdicaoInimigo}>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">
                  Editar Inimigo no Combate
                </DialogTitle>
                <DialogDescription>
                  Ajuste os dados apenas para este Combate ou atualize também o Modelo original na lista de Antagonistas.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="nome-instancia">Rótulo / Nome no Combate</Label>
                  <Input
                    id="nome-instancia"
                    autoFocus
                    value={inimigoEmEdicao.nome}
                    onChange={(e) =>
                      setInimigoEmEdicao({ ...inimigoEmEdicao, nome: e.target.value })
                    }
                    placeholder="Ex: Carniçal Ocultista (Líder)"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Formato da Ficha</Label>
                  <Combobox
                    rotulo="Formato da Ficha"
                    opcoes={[
                      { valor: 'simplificada', rotulo: 'Ficha Simplificada (Paradas Gerais)' },
                      { valor: 'completa', rotulo: 'Ficha Completa de Antagonista (Atributos e Habilidades)' },
                    ]}
                    valor={inimigoEmEdicao.fichaCompleta ? 'completa' : 'simplificada'}
                    onChange={(tipo) => {
                      if (tipo === 'completa' && !inimigoEmEdicao.fichaCompleta) {
                        setInimigoEmEdicao({
                          ...inimigoEmEdicao,
                          fichaCompleta: criarFichaAntagonistaCompleta(),
                        })
                      } else if (tipo === 'simplificada' && inimigoEmEdicao.fichaCompleta) {
                        setInimigoEmEdicao({
                          ...inimigoEmEdicao,
                          fichaCompleta: null,
                          paradas: {
                            ...inimigoEmEdicao.paradas,
                            fisico: inimigoEmEdicao.paradas.fisico ?? 4,
                            social: inimigoEmEdicao.paradas.social ?? 3,
                            mental: inimigoEmEdicao.paradas.mental ?? 3,
                          },
                        })
                      }
                    }}
                    placeholder="Escolher formato da Ficha..."
                  />
                </div>

                {inimigoEmEdicao.fichaCompleta ? (
                  <EditorFichaAntagonistaCompleta ficha={inimigoEmEdicao.fichaCompleta} onChange={(fichaCompleta) => setInimigoEmEdicao({ ...inimigoEmEdicao, fichaCompleta })} />
                ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="inst-fisico">Físico</Label>
                    <InputNumero
                      id="inst-fisico"
                      min={0}
                      max={15}
                      value={inimigoEmEdicao.paradas.fisico ?? 0}
                      onChange={(val) =>
                        setInimigoEmEdicao({
                          ...inimigoEmEdicao,
                          paradas: {
                            ...inimigoEmEdicao.paradas,
                            fisico: val,
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="inst-social">Social</Label>
                    <InputNumero
                      id="inst-social"
                      min={0}
                      max={15}
                      value={inimigoEmEdicao.paradas.social ?? 0}
                      onChange={(val) =>
                        setInimigoEmEdicao({
                          ...inimigoEmEdicao,
                          paradas: {
                            ...inimigoEmEdicao.paradas,
                            social: val,
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="inst-mental">Mental</Label>
                    <InputNumero
                      id="inst-mental"
                      min={0}
                      max={15}
                      value={inimigoEmEdicao.paradas.mental ?? 0}
                      onChange={(val) =>
                        setInimigoEmEdicao({
                          ...inimigoEmEdicao,
                          paradas: {
                            ...inimigoEmEdicao.paradas,
                            mental: val,
                          },
                        })
                      }
                      required
                    />
                  </div>
                </div>


                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="inst-vitalidade">Vitalidade Máx</Label>
                    <InputNumero
                      id="inst-vitalidade"
                      min={1}
                      max={30}
                      value={inimigoEmEdicao.vitalidadeMax}
                      onChange={(val) =>
                        setInimigoEmEdicao({
                          ...inimigoEmEdicao,
                          vitalidadeMax: val,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="inst-vontade">Força de Vontade Máx</Label>
                    <InputNumero
                      id="inst-vontade"
                      min={1}
                      max={15}
                      value={inimigoEmEdicao.vontadeMax}
                      onChange={(val) =>
                        setInimigoEmEdicao({
                          ...inimigoEmEdicao,
                          vontadeMax: val,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Paradas Excepcionais */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Paradas Excepcionais</Label>
                      <span className="block text-xs text-muted-foreground">
                        Especialidades deste inimigo (ex: Briga 7, Ocultismo 6).
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs shrink-0"
                      onClick={() =>
                        setInimigoEmEdicao({
                          ...inimigoEmEdicao,
                          paradas: {
                            ...inimigoEmEdicao.paradas,
                            excepcionais: [
                              ...inimigoEmEdicao.paradas.excepcionais,
                              { nome: '', valor: 4 },
                            ],
                          },
                        })
                      }
                    >
                      <Plus className="size-4" />
                      Adicionar
                    </Button>
                  </div>
                  {inimigoEmEdicao.paradas.excepcionais.map((pe, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="Nome (ex: Furtividade)"
                        value={pe.nome}
                        onChange={(e) => {
                          const copia = [...inimigoEmEdicao.paradas.excepcionais]
                          copia[idx] = { ...copia[idx], nome: e.target.value }
                          setInimigoEmEdicao({
                            ...inimigoEmEdicao,
                            paradas: { ...inimigoEmEdicao.paradas, excepcionais: copia },
                          })
                        }}
                        className="flex-1"
                      />
                      <InputNumero
                        min={1}
                        max={15}
                        value={pe.valor}
                        onChange={(val) => {
                          const copia = [...inimigoEmEdicao.paradas.excepcionais]
                          copia[idx] = {
                            ...copia[idx],
                            valor: val,
                          }
                          setInimigoEmEdicao({
                            ...inimigoEmEdicao,
                            paradas: { ...inimigoEmEdicao.paradas, excepcionais: copia },
                          })
                        }}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 shrink-0 text-destructive"
                        onClick={() => {
                          const copia = inimigoEmEdicao.paradas.excepcionais.filter(
                            (_, i) => i !== idx,
                          )
                          setInimigoEmEdicao({
                            ...inimigoEmEdicao,
                            paradas: { ...inimigoEmEdicao.paradas, excepcionais: copia },
                          })
                        }}
                      >
                        <Trash2 className="size-4" />
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
                        Adicione ou remova poderes específicos deste combate.
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs shrink-0"
                      onClick={() =>
                        setInimigoEmEdicao({
                          ...inimigoEmEdicao,
                          especiais: [
                            ...inimigoEmEdicao.especiais,
                            { nome: '', descricao: '' },
                          ],
                        })
                      }
                    >
                      <Plus className="size-4" />
                      Adicionar
                    </Button>
                  </div>
                  {inimigoEmEdicao.especiais.map((esp, idx) => (
                    <div key={idx} className="flex flex-col gap-2 rounded-md border p-3 bg-muted/20">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Nome do Especial (ex: Escopeta de Cano Duplo, Ritual Sombrio)"
                          value={esp.nome}
                          onChange={(e) => {
                            const copia = [...inimigoEmEdicao.especiais]
                            copia[idx] = { ...copia[idx], nome: e.target.value }
                            setInimigoEmEdicao({ ...inimigoEmEdicao, especiais: copia })
                          }}
                          className="flex-1 h-9 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          aria-label={`Remover Especial ${esp.nome}`}
                          onClick={() => {
                            const copia = inimigoEmEdicao.especiais.filter((_, i) => i !== idx)
                            setInimigoEmEdicao({ ...inimigoEmEdicao, especiais: copia })
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <RegraEspecialAntagonista regra={esp.regra} onChange={regra => {
                        const copia = [...inimigoEmEdicao.especiais]
                        copia[idx] = { ...copia[idx], regra }
                        setInimigoEmEdicao({ ...inimigoEmEdicao, especiais: copia })
                      }} />
                      <EditorRichText
                        placeholder="Descrição ou regras do Especial (suporta Markdown)..."
                        rows={3}
                        value={esp.descricao}
                        onChange={(val) => {
                          const copia = [...inimigoEmEdicao.especiais]
                          copia[idx] = { ...copia[idx], descricao: val }
                          setInimigoEmEdicao({ ...inimigoEmEdicao, especiais: copia })
                        }}
                      />
                    </div>
                  ))}
                </div>

                <ConfigurarPoderesAntagonista modelo={inimigoEmEdicao} valor={inimigoEmEdicao.recursosSobrenaturais} aoSalvar
                  onChange={recursosSobrenaturais => setInimigoEmEdicao({ ...inimigoEmEdicao, recursosSobrenaturais })} />

                {/* Notas */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="inst-notas">Notas e Equipamentos na Cena</Label>
                  <EditorRichText
                    id="inst-notas"
                    placeholder="Informações táticas, equipamentos ou armas temporárias..."
                    rows={3}
                    value={inimigoEmEdicao.notas}
                    onChange={(val) =>
                      setInimigoEmEdicao({ ...inimigoEmEdicao, notas: val })
                    }
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInimigoEmEdicao(null)}
                  disabled={salvandoEdicaoInimigo}
                >
                  Cancelar
                </Button>
                {inimigoEmEdicao.modeloId && listaModelos.some((m) => m.id === inimigoEmEdicao.modeloId) && (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={salvandoEdicaoInimigo}
                    onClick={() => void salvarEdicaoInimigo('modelo')}
                  >
                    {salvandoEdicaoInimigo ? 'Salvando...' : 'Salvar no Modelo geral'}
                  </Button>
                )}
                <Button type="submit" disabled={salvandoEdicaoInimigo}>
                  {salvandoEdicaoInimigo ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG: CONFIRMAR MATAR OU DESACORDAR AO PREENCHER VITALIDADE AGRAVADA */}
      <AlertDialog
        open={Boolean(confirmacaoAgravado)}
        onOpenChange={(aberto) => {
          if (!aberto) setConfirmacaoAgravado(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">
              Vitalidade Totalmente Agravada
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              O dano Agravado preencheu toda a Vitalidade de{' '}
              <strong className="text-foreground">{confirmacaoAgravado?.nome}</strong>.
              <br />
              <br />
              Deseja causar a morte permanente do personagem ou apenas deixá-lo inconsciente/incapacitado fora de combate?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setConfirmacaoAgravado(null)}>
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={async () => {
                if (!confirmacaoAgravado) return
                const cond = confirmacaoAgravado.ehVampiro ? 'torpor' : 'desacordado'
                await handleAlterarDanoInimigo(
                  confirmacaoAgravado.participanteId,
                  'vitalidade',
                  confirmacaoAgravado.novoDano,
                  cond,
                )
                setConfirmacaoAgravado(null)
              }}
            >
              {confirmacaoAgravado?.ehVampiro ? 'Colocar em Torpor' : 'Desacordar / Incapacitar'}
            </Button>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
              onClick={async () => {
                if (!confirmacaoAgravado) return
                await handleAlterarDanoInimigo(
                  confirmacaoAgravado.participanteId,
                  'vitalidade',
                  confirmacaoAgravado.novoDano,
                  'morto',
                )
                setConfirmacaoAgravado(null)
              }}
            >
              {confirmacaoAgravado?.ehVampiro ? 'Morte Final' : 'Matar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
