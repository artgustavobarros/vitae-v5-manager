import { rotuloOrigemPersonagem } from '#/domain/permissoes-ficha'
import { ChipDificuldadeAntagonista } from '#/components/chip-dificuldade-antagonista'
import { separarDificuldadeGeral } from '#/domain/dificuldade-antagonista'
import { ConfigurarPoderesAntagonista, ResumoRecursosSobrenaturais } from '#/components/poderes-antagonista'
import { obterPerfilSobrenatural, sortearRecursosSobrenaturais, type RecursosSobrenaturais } from '#/domain/poderes-antagonista'
import { RegraEspecialAntagonista } from '#/components/regra-especial-antagonista'
import { normalizarEspecialAntagonista, type EspecialAntagonista } from '#/domain/bestiario'
import { EditorFichaAntagonistaCompleta, ResumoFichaAntagonistaCompleta } from '#/components/ficha-antagonista-completa'
import type { FichaAntagonistaCompleta } from '#/domain/ficha-antagonista'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { cn } from 'cn'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Edit3,
  Eye,
  EyeOff,
  GripVertical,
  Maximize2,
  Minimize2,
  Play,
  Plus,
  Skull,
  Swords,
  Trash2,
  Users,
} from 'lucide-react'
import { Accessibility, defaultPreset } from '@dnd-kit/dom'
import { OptimisticSortingPlugin } from '@dnd-kit/dom/sortable'
import { DragDropProvider, DragOverlay, useDragDropManager, type DragEndEvent, type DragOverEvent } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'
import { useCallback, useState, type ComponentProps } from 'react'
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
import { BadgeSaude, TrilhaTatilExpandida, FomeTatilExpandida, TrackersNumericosLinha, BadgesCondicoes, VisaoJogador } from '#/components/combate/visao-jogador'
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
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '#/components/ui/card'
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
import { listarModelosBestiario } from '#/server/bestiario'
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
  listarPersonagensParaCombate,
  removerParticipanteCombateServer,
  reordenarParticipantesCombateServer,
  voltarTurnoCombateServer,
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
      const [modelos, personagens] = await Promise.all([
        listarModelosBestiario(),
        listarPersonagensParaCombate(),
      ])
      return {
        ...dados,
        modelos,
        personagens: personagens as PersonagemCombateOpcao[],
      }
    }
    return {
      ...dados,
      modelos: [] as ModeloAntagonista[],
      personagens: [] as PersonagemCombateOpcao[],
    }
  },
  component: PaginaCombate,
})

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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemover(part.id)}
            className="size-7 text-destructive/70 hover:text-destructive"
            title="Remover definitivamente do combate"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* LINHA 2: ESTADO DE SAÚDE COMO CONDIÇÃO + OUTRAS CONDIÇÕES */}
      <div className="flex items-center gap-1 px-4 py-1 border-t border-border/40 bg-muted/20 min-w-0">
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
      />
    )
  }

  return <VisaoJogador combate={dados.combate} />
}

type ParticipanteNarrador = EstadoCombateNarrador['participantes'][number]

interface PropsCardConteudoNarrador {
  part: ParticipanteNarrador
  index: number
  totalParticipantes: number
  ehTurnoAtual: boolean
  ehProximoTurno: boolean
  minimizado: boolean
  handleRef?: (el: HTMLElement | null) => void
  onAlternarMinimizado: (id: string) => void
  onReordenar: (id: string, direcao: 'cima' | 'baixo') => void
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
  totalParticipantes,
  ehTurnoAtual,
  ehProximoTurno,
  minimizado,
  handleRef,
  onAlternarMinimizado,
  onReordenar,
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
    <BotaoVisibilidadeCondicao revelada={part.revelarCondicao === true}
      onAlterar={(revelar) => onAlternarRevelar(part.id, revelar)} />
  )
  const saude = part.tipo === 'inimigo'
    ? calcularEstadoSaude(part.vitalidadeMax, part.danoVitalidade, ehParticipanteVampiro(part), part.condicoes)
    : part.condicaoPersonagem
      ? calcularEstadoSaude(part.condicaoPersonagem.vitalidadeMax, part.condicaoPersonagem.danoVitalidade, true, part.condicoes)
      : undefined

  if (minimizado) {
    return (
      <CardCombate estado={saude?.estado}
        className={cn(
          'gap-0 py-0 flex flex-col rounded-xl border bg-card transition-all shadow-xs overflow-hidden',
          ehTurnoAtual && 'border-2 border-vinho shadow-md bg-vinho/2',
          ehProximoTurno && !ehTurnoAtual && 'border-2 border-dano-superficial/60 bg-dano-superficial/2',
          !ehTurnoAtual && !ehProximoTurno && 'border-border/80 hover:border-border',
        )}
      >
        {/* LINHA 1: IDENTIDADE / VEZ / ESTADO DE SAÚDE / AÇÕES */}
        <div className="flex flex-col gap-3 px-4 py-2">
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
            <div className="flex flex-wrap items-start gap-2 min-w-0 pt-1">
              <div className="flex max-w-full min-w-0 items-center gap-2">
                <span className="font-serif font-bold text-base text-foreground truncate leading-tight" title={part.nome}>
                  {part.nome}
                </span>

                {ehTurnoAtual && (
                  <span
                    className="relative flex size-5 shrink-0 items-center justify-center rounded-full bg-vinho/20 border border-vinho/40"
                    title="Agindo agora"
                  >
                    <span className="size-2 rounded-full bg-vinho animate-pulse" />
                  </span>
                )}
                {ehProximoTurno && !ehTurnoAtual && (
                  <span
                    className="relative flex size-5 shrink-0 items-center justify-center rounded-full bg-dano-superficial/20 border border-dano-superficial/40"
                    title="Próximo a agir"
                  >
                    <span className="size-2 rounded-full bg-dano-superficial" />
                  </span>
                )}
              </div>

              {part.tipo === 'inimigo' ? (
                <Badge variant="outline" className="text-xs py-0 px-1 h-5 text-muted-foreground shrink-0">
                  Inimigo
                </Badge>
              ) : part.ehPdN || part.ehPdn ? (
                <Badge variant="outline" className="text-xs py-0 px-1 h-5 text-muted-foreground shrink-0">
                  PdN
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs py-0 px-1 h-5 shrink-0">
                  {part.jogadorNome ? `PJ • ${part.jogadorNome}` : 'Personagem'}
                </Badge>
              )}
            </div>
          </div>

          {/* Direita: Dot de Saúde + Ações Narrador + Maximizar */}
          <div className="flex flex-wrap items-center justify-end gap-1 pt-1">
            {part.tipo === 'inimigo' ? (
              <BadgeSaude
                vitalidadeMax={part.vitalidadeMax}
                dano={part.danoVitalidade}
                condicoes={part.condicoes}
                ehVampiro={part.categoria?.toLowerCase().includes('vampiro') ?? false}
                soTag={true}
              />
            ) : part.condicaoPersonagem ? (
              <BadgeSaude
                vitalidadeMax={part.condicaoPersonagem.vitalidadeMax}
                dano={part.condicaoPersonagem.danoVitalidade}
                condicoes={part.condicoes}
                ehVampiro={true}
                soTag={true}
              />
            ) : null}

            <Button
              variant="ghost"
              size="icon"
              disabled={index === 0}
              onClick={() => onReordenar(part.id, 'cima')}
              className="size-7"
              aria-label="Mover para cima"
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={index === totalParticipantes - 1}
              onClick={() => onReordenar(part.id, 'baixo')}
              className="size-7"
              aria-label="Mover para baixo"
            >
              <ArrowDown className="size-4" />
            </Button>
            {part.tipo === 'inimigo' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditarInimigo(part as ParticipanteInimigo)}
                  className="size-7"
                  title="Editar este inimigo no combate"
                >
                  <Edit3 className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAlternarRevelar(part.id)}
                  className="size-7"
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
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAlternarMinimizado(part.id)}
              className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Expandir card completo"
            >
              <Maximize2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemover(part.id)}
              className="size-7 text-destructive hover:text-destructive"
              aria-label="Remover participante"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* LINHA 2: TRACKERS EM VALORES NUMÉRICOS (CARROSSEL DRAG-FREE) */}
        <div className="flex items-center px-4 py-1 border-t border-border/40 bg-muted/5 min-w-0 text-xs">
          {part.tipo === 'inimigo' ? (
            <TrackersNumericosLinha
              danoVitalidade={part.danoVitalidade}
              vitalidadeMax={part.vitalidadeMax}
              danoVontade={part.danoVontade}
              vontadeMax={part.vontadeMax}
            />
          ) : part.condicaoPersonagem ? (
            <TrackersNumericosLinha
              danoVitalidade={part.condicaoPersonagem.danoVitalidade}
              vitalidadeMax={part.condicaoPersonagem.vitalidadeMax}
              danoVontade={part.condicaoPersonagem.danoVontade}
              vontadeMax={part.condicaoPersonagem.vontadeMax}
              fome={part.condicaoPersonagem.fome}
            />
          ) : (
            <span className="text-xs text-muted-foreground italic px-1 py-1">
              Condição indisponível
            </span>
          )}
        </div>

        {part.tipo === 'inimigo' && (part.recursosSobrenaturais || resumoInimigo?.dificuldade) && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-1">
            <ChipDificuldadeAntagonista dificuldade={resumoInimigo?.dificuldade ?? null} />
            <ResumoRecursosSobrenaturais recursos={part.recursosSobrenaturais} />
          </div>
        )}

        {/* LINHA 3: CONDIÇÕES / DEBUFFS (JUSTIFY-BETWEEN) */}
        {visibilidadeCondicao && <div className="px-4 py-2">{visibilidadeCondicao}</div>}
        <div className="flex items-center justify-between gap-3 px-4 py-1 bg-muted/20 border-t border-border/50 text-xs min-h-9">
          <BadgesCondicoes
            participanteId={part.id}
            ehVampiro={ehParticipanteVampiro(part)}
            condicoes={part.condicoes}
            podeEditar={true}
            onAlternarCondicao={onAlternarCondicao}
          />
        </div>
      </CardCombate>
    )
  }

  return (
    <CardCombate estado={saude?.estado}
      className={cn(
        'py-4 transition-all duration-150',
        ehTurnoAtual && 'border-2 border-vinho shadow-md bg-vinho/3',
        ehProximoTurno && !ehTurnoAtual && 'border-2 border-dano-superficial/60 shadow-sm bg-dano-superficial/3',
        !ehTurnoAtual && !ehProximoTurno && 'border border-border opacity-95',
      )}
    >
      <CardHeader className="py-2 px-4 flex flex-col items-stretch gap-2">
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

        <div className="flex flex-wrap items-center justify-end gap-1 pt-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={index === 0}
            onClick={() => onReordenar(part.id, 'cima')}
            className="size-8"
            aria-label="Mover para cima"
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={index === totalParticipantes - 1}
            onClick={() => onReordenar(part.id, 'baixo')}
            className="size-8"
            aria-label="Mover para baixo"
          >
            <ArrowDown className="size-4" />
          </Button>
          {part.tipo === 'inimigo' && (
            <>
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
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAlternarMinimizado(part.id)}
            className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Minimizar card"
          >
            <Minimize2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemover(part.id)}
            className="size-8 text-destructive hover:text-destructive"
            aria-label="Remover participante"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-1 pb-3 px-4 flex flex-col gap-2">
        {part.tipo === 'inimigo' ? (
          <div className="flex flex-col gap-3">
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

            <div className="flex items-center gap-1 pt-1 border-t min-w-0">
              <span className="text-xs font-medium text-muted-foreground shrink-0">Condições:</span>
              <BadgesCondicoes
                participanteId={part.id}
                ehVampiro={ehParticipanteVampiro(part)}
                condicoes={part.condicoes}
                podeEditar={true}
                onAlternarCondicao={onAlternarCondicao}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
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

            <div className="flex items-center gap-1 pt-1 border-t min-w-0">
              <span className="text-xs font-medium text-muted-foreground shrink-0">Condições:</span>
              <BadgesCondicoes
                participanteId={part.id}
                ehVampiro={ehParticipanteVampiro(part)}
                condicoes={part.condicoes}
                podeEditar={true}
                onAlternarCondicao={onAlternarCondicao}
              />
            </div>
          </div>
        )}
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
  minimizado,
  salvandoOrdem,
  onAlternarMinimizado,
  onReordenar,
  onEditarInimigo,
  onAlternarRevelar,
  onRemover,
  onAlterarDanoInimigo,
  onAlterarDanoPersonagem,
  onAlterarFomePersonagem,
  onAlternarCondicao,
}: PropsCardConteudoNarrador & { salvandoOrdem: boolean }) {
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
        minHeight: isDragging ? (minimizado ? 72 : 136) : undefined,
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
          totalParticipantes={totalParticipantes}
          ehTurnoAtual={ehTurnoAtual}
          ehProximoTurno={ehProximoTurno}
          minimizado={minimizado}
          handleRef={handleRef}
          onAlternarMinimizado={onAlternarMinimizado}
          onReordenar={onReordenar}
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
}: {
  combate: EstadoCombateNarrador | null
  modelos: ModeloAntagonista[]
  personagens: PersonagemCombateOpcao[]
}) {
  const router = useRouter()

  const [dialogNovoCombate, setDialogNovoCombate] = useState(false)
  const [dialogAdicionarParticipante, setDialogAdicionarParticipante] = useState(false)
  const [dialogEncerrar, setDialogEncerrar] = useState(false)
  const [confirmacaoAgravado, setConfirmacaoAgravado] = useState<{
    participanteId: string
    nome: string
    novoDano: Dano
    ehVampiro: boolean
  } | null>(null)

  const [inimigoEmEdicao, setInimigoEmEdicao] = useState<{
    id: string
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
  const [inimigosParaAdicionar, setInimigosParaAdicionar] = useState<
    Array<{ id: string; modeloId: string; nome: string; recursos?: RecursosSobrenaturais }>
  >([])
  const [modelosTemp, setModelosTemp] = useState<string[]>([])

  const [tipoNovoPart, setTipoNovoPart] = useState<'personagem' | 'inimigo'>('inimigo')
  const [nomeInimigoAvulso, setNomeInimigoAvulso] = useState<string>('')
  const [personagensAvulsosTemp, setPersonagensAvulsosTemp] = useState<string[]>([])
  const [modelosAvulsosTemp, setModelosAvulsosTemp] = useState<string[]>([])
  const [recursosAvulsos, setRecursosAvulsos] = useState<Record<string, RecursosSobrenaturais>>({})

  const [arrastandoId, setArrastandoId] = useState<string | null>(null)
  const [locaisParticipantes, setLocaisParticipantes] = useState<EstadoCombateNarrador['participantes'] | null>(null)
  const [salvandoOrdem, setSalvandoOrdem] = useState(false)

  const [cardsMinimizados, setCardsMinimizados] = useState<Record<string, boolean>>({})
  const [modoCompactoGeral, setModoCompactoGeral] = useState(false)

  function estaMinimizado(id: string) {
    return cardsMinimizados[id] ?? modoCompactoGeral
  }

  function alternarMinimizado(id: string) {
    setCardsMinimizados((prev) => ({
      ...prev,
      [id]: !estaMinimizado(id),
    }))
  }

  function alternarModoCompactoGeral() {
    const novo = !modoCompactoGeral
    setModoCompactoGeral(novo)
    setCardsMinimizados({})
  }

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
      id: part.id,
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

  async function handleSalvarEdicaoInimigo(e: React.FormEvent) {
    e.preventDefault()
    if (!inimigoEmEdicao) return
    setSalvandoEdicaoInimigo(true)
    try {
      const perfil = obterPerfilSobrenatural(inimigoEmEdicao)
      await atualizarParticipanteInimigoServer({
        data: {
          participanteId: inimigoEmEdicao.id,
          atualizacao: {
            nome: inimigoEmEdicao.nome,
            vitalidadeMax: inimigoEmEdicao.vitalidadeMax,
            vontadeMax: inimigoEmEdicao.vontadeMax,
            paradas: inimigoEmEdicao.paradas,
            fichaCompleta: inimigoEmEdicao.fichaCompleta,
            especiais: inimigoEmEdicao.especiais,
            recursosSobrenaturais: perfil.livres || Object.keys(perfil.disciplinas).length
              ? inimigoEmEdicao.recursosSobrenaturais : null,
            notas: inimigoEmEdicao.notas,
          },
        },
      })
      setInimigoEmEdicao(null)
      toast.success('Inimigo atualizado no combate.')
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar inimigo.')
    } finally {
      setSalvandoEdicaoInimigo(false)
    }
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

  async function handleReordenar(id: string, direcao: 'cima' | 'baixo') {
    if (!combate) return
    const idsAtivos = participantesAtivos.map((p) => p.id)
    const index = idsAtivos.indexOf(id)
    if (index === -1) return

    const novoIndex = direcao === 'cima' ? index - 1 : index + 1
    if (novoIndex < 0 || novoIndex >= idsAtivos.length) return

    const temp = idsAtivos[index]
    idsAtivos[index] = idsAtivos[novoIndex]
    idsAtivos[novoIndex] = temp

    const todosIds = [...idsAtivos, ...inimigosIncapacitados.map((p) => p.id)]

    try {
      await reordenarParticipantesCombateServer({ data: { ordemIds: todosIds } })
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao reordenar.')
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
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao remover.')
    }
  }

  async function handleAlternarRevelar(id: string, revelar?: boolean) {
    try {
      const participante = combate?.participantes.find((p) => p.id === id)
      if (participante?.tipo === 'personagem') {
        await definirRevelarCondicaoCombateServer({ data: { participanteId: id, revelar: revelar ?? !participante.revelarCondicao } })
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
    try {
      const participantes: ParticipanteCombate[] = []

      for (const pId of selecaoPersonagens) {
        const char = personagens.find((p) => p.id === pId)
        if (char) {
          participantes.push({
            id: crypto.randomUUID(),
            tipo: 'personagem',
            personagemId: char.id,
            nome: char.nome || '(Sem nome)',
            jogadorNome: char.jogadorNome ?? null,
            ehPdN: char.ehPdN,
            ehPdn: char.ehPdN,
            condicoes: [],
          })
        }
      }

      const inimigosFinais = [...inimigosParaAdicionar]
      for (const mId of modelosTemp) {
        const modelo = modelos.find((m) => m.id === mId)
        if (modelo && modelo.id) {
          const contagem = inimigosFinais.filter((i) => i.modeloId === modelo.id).length + 1
          const nomeSugerido = `${modelo.nome} #${contagem}`
          inimigosFinais.push({
            id: crypto.randomUUID(),
            modeloId: modelo.id,
            nome: nomeSugerido,
          })
        }
      }

      for (const inimigoInfo of inimigosFinais) {
        const modelo = modelos.find((m) => m.id === inimigoInfo.modeloId)
        if (modelo) {
          participantes.push(criarInimigoDeModelo(modelo, { id: inimigoInfo.id, nome: inimigoInfo.nome }, inimigoInfo.recursos ?? sortearRecursosSobrenaturais(modelo)))
        }
      }

      if (participantes.length === 0) {
        toast.error('Selecione pelo menos um participante para iniciar o combate.')
        return
      }

      await iniciarCombateServer({ data: { participantes } })
      setDialogNovoCombate(false)
      setSelecaoPersonagens([])
      setInimigosParaAdicionar([])
      setModelosTemp([])
      toast.success('Combate iniciado!')
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao iniciar combate.')
    }
  }

  async function handleConfirmarAdicionarAvulso() {
    if (tipoNovoPart === 'personagem') {
      if (personagensAvulsosTemp.length === 0) {
        toast.error('Selecione pelo menos um Personagem.')
        return
      }
      try {
        for (const pId of personagensAvulsosTemp) {
          const char = personagens.find((p) => p.id === pId)
          if (!char) continue
          const part: ParticipantePersonagem = {
            id: crypto.randomUUID(),
            tipo: 'personagem',
            personagemId: char.id,
            nome: char.nome || '(Sem nome)',
            jogadorNome: char.jogadorNome ?? null,
            ehPdN: char.ehPdN,
            ehPdn: char.ehPdN,
            condicoes: [],
          }
          await adicionarParticipanteCombateServer({ data: { participante: part } })
        }
        setDialogAdicionarParticipante(false)
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
          const modelo = modelos.find((m) => m.id === mId)
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
        setDialogAdicionarParticipante(false)
        setModelosAvulsosTemp([])
        setNomeInimigoAvulso('')
        setRecursosAvulsos({})
        toast.success('Inimigo(s) adicionado(s) ao combate!')
        router.invalidate()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Falha ao adicionar participante.')
      }
    }
  }

  return (
    <main className="container-app mx-auto min-h-dvh">
      <BarraApp />
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
                onClick={() => {
                  setSelecaoPersonagens([])
                  setInimigosParaAdicionar([])
                  setModelosTemp([])
                  setDialogNovoCombate(true)
                }}
                className="gap-2 self-start sm:self-auto"
              >
                <Swords className="size-4" />
                Iniciar Combate
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
                onClick={alternarModoCompactoGeral}
                className="gap-1"
                title={modoCompactoGeral ? 'Expandir todos os cards' : 'Minimizar todos os cards'}
              >
                {modoCompactoGeral ? (
                  <>
                    <Maximize2 className="size-4" />
                    <span>Expandir Cards</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="size-4" />
                    <span>Minimizar Cards</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTipoNovoPart('inimigo')
                  setRecursosAvulsos({})
                  setModelosAvulsosTemp([])
                  setPersonagensAvulsosTemp([])
                  setNomeInimigoAvulso('')
                  setDialogAdicionarParticipante(true)
                }}
              >
                <Plus className="size-4 mr-1" />
                Participante
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

        {!combate && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
            <Swords className="size-12 text-muted-foreground/60 mb-3" />
            <h3 className="font-serif text-2xl font-medium">Nenhum Combate em andamento</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
              Monte os participantes (Personagens, PdNs e Inimigos da lista de Antagonistas) para iniciar a ordem de turnos.
            </p>
            <Button
              onClick={() => {
                setSelecaoPersonagens([])
                setInimigosParaAdicionar([])
                setDialogNovoCombate(true)
              }}
              className="gap-2"
            >
              <Swords className="size-4" />
              Iniciar Novo Combate
            </Button>
          </div>
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
                    minimizado={estaMinimizado(part.id)}
                    salvandoOrdem={salvandoOrdem}
                    onAlternarMinimizado={alternarMinimizado}
                    onReordenar={handleReordenar}
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
                    totalParticipantes={participantesExibidos.length}
                    ehTurnoAtual={
                      combate ? arrastandoPart.id === combate.participantes[combate.turnoAtual]?.id : false
                    }
                    ehProximoTurno={
                      combate && proximoIndex !== -1
                        ? arrastandoPart.id === combate.participantes[proximoIndex]?.id
                        : false
                    }
                    minimizado={estaMinimizado(arrastandoPart.id)}
                    onAlternarMinimizado={() => {}}
                    onReordenar={() => {}}
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

      {/* DIALOG: NOVO COMBATE */}
      <Dialog open={dialogNovoCombate} onOpenChange={setDialogNovoCombate}>
        <DialogContent className="max-w-xl max-h-9/10 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Swords className="size-5" />
              Iniciar Novo Combate
            </DialogTitle>
            <DialogDescription>
              Selecione os participantes iniciais. Você poderá reordenar ou adicionar mais participantes a qualquer momento.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-4">
            <div className="flex flex-col gap-2">
              <Label className="font-semibold flex items-center gap-1">
                <Users className="size-4" />
                Personagens e PdNs da Crônica
              </Label>
              <SelectMultiplo
                opcoes={personagens.map((p) => ({
                  valor: p.id,
                  rotulo: p.nome || '(Sem nome)',
                  detalhe: rotuloOrigemPersonagem(p) ?? undefined,
                }))}
                valores={selecaoPersonagens}
                onChange={setSelecaoPersonagens}
                placeholder="Selecionar personagens..."
              />

              {selecaoPersonagens.length > 0 && (
                <div className="flex flex-col gap-1 border rounded-md p-2 max-h-40 overflow-y-auto">
                  {selecaoPersonagens.map((pId) => {
                    const char = personagens.find((p) => p.id === pId)
                    if (!char) return null
                    return (
                      <div key={pId} className="flex items-center justify-between text-sm py-1 border-b last:border-b-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{char.nome || '(Sem nome)'}</span>
                          {rotuloOrigemPersonagem(char) && (
                            <span className="text-xs text-muted-foreground">{rotuloOrigemPersonagem(char)}</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive"
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
              {modelos.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum modelo cadastrado em Antagonistas.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  <SelectMultiplo
                    opcoes={modelos.map((m) => ({
                      valor: m.id ?? '',
                      rotulo: m.nome,
                      detalhe: `${[m.categoria, ...(m.etiquetas ?? [])].join(' · ')} • Vit ${m.vitalidade}, Vont ${m.vontade}`,
                    }))}
                    valores={modelosTemp}
                    onChange={setModelosTemp}
                    placeholder="Selecionar modelos de inimigo..."
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={modelosTemp.length === 0}
                    onClick={() => {
                      const novosInimigos = [...inimigosParaAdicionar]
                      for (const mId of modelosTemp) {
                        const modelo = modelos.find((m) => m.id === mId)
                        if (modelo && modelo.id) {
                          const contagem = novosInimigos.filter((i) => i.modeloId === modelo.id).length + 1
                          const nomeSugerido = `${modelo.nome} #${contagem}`
                          novosInimigos.push({
                            id: crypto.randomUUID(),
                            modeloId: modelo.id,
                            nome: nomeSugerido,
                          })
                        }
                      }
                      setInimigosParaAdicionar(novosInimigos)
                      setModelosTemp([])
                    }}
                    className="self-start gap-1"
                  >
                    <Plus className="size-4" />
                    Adicionar {modelosTemp.length > 0 ? `(${modelosTemp.length})` : ''}
                  </Button>

                  {inimigosParaAdicionar.length > 0 && (
                    <div className="flex flex-col gap-1 border rounded-md p-2 max-h-48 overflow-y-auto">
                      {inimigosParaAdicionar.map((inimigo, idx) => {
                        const mod = modelos.find((m) => m.id === inimigo.modeloId)
                        return (
                          <div
                            key={inimigo.id}
                            className="flex items-center justify-between gap-2 text-sm py-1 border-b last:border-b-0"
                          >
                            <div className="flex flex-col flex-1 min-w-0">
                              <Input
                                value={inimigo.nome}
                                onChange={(e) => {
                                  setInimigosParaAdicionar(inimigosParaAdicionar.map(i => i.id === inimigo.id ? { ...i, nome: e.target.value } : i))
                                }}
                                className="h-7 text-xs"
                              />
                              {mod?.categoria && (
                                <span className="text-xs text-muted-foreground mt-1 ml-1">
                                  Tipo: <strong className="font-medium text-foreground">{mod.categoria}</strong>{(mod.etiquetas?.length ?? 0) > 0 && <> · Etiquetas: {mod.etiquetas?.join(', ')}</>}
                                </span>
                              )}
                              {mod && <ConfigurarPoderesAntagonista modelo={mod} valor={inimigo.recursos} onChange={recursos => setInimigosParaAdicionar(inimigosParaAdicionar.map(i => i.id === inimigo.id ? { ...i, recursos } : i))} />}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive shrink-0"
                              onClick={() => {
                                setInimigosParaAdicionar(
                                  inimigosParaAdicionar.filter((_, i) => i !== idx),
                                )
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
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogNovoCombate(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleIniciarNovoCombate}>
              Iniciar Combate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: ADICIONAR PARTICIPANTE AVULSO */}
      <Dialog open={dialogAdicionarParticipante} onOpenChange={setDialogAdicionarParticipante}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Adicionar Participante</DialogTitle>
            <DialogDescription>
              Inclui um novo combatente na ordem de turnos atual.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={tipoNovoPart === 'inimigo' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setTipoNovoPart('inimigo')
                  setRecursosAvulsos({})
                  setModelosAvulsosTemp([])
                  setNomeInimigoAvulso('')
                }}
              >
                Inimigo (Antagonistas)
              </Button>
              <Button
                type="button"
                variant={tipoNovoPart === 'personagem' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setTipoNovoPart('personagem')
                  setPersonagensAvulsosTemp([])
                }}
              >
                Personagem / PdN
              </Button>
            </div>

            {tipoNovoPart === 'inimigo' ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Label>Modelo(s) da lista de Antagonistas</Label>
                  <SelectMultiplo
                    opcoes={modelos.map((m) => ({
                      valor: m.id ?? '',
                      rotulo: m.nome,
                      detalhe: `${[m.categoria, ...(m.etiquetas ?? [])].join(' · ')} • Vit ${m.vitalidade}, Vont ${m.vontade}`,
                    }))}
                    valores={modelosAvulsosTemp}
                    onChange={(vals) => {
                      setModelosAvulsosTemp(vals)
                      if (vals.length === 1) {
                        const mod = modelos.find((m) => m.id === vals[0])
                        if (mod) setNomeInimigoAvulso(mod.nome)
                      }
                    }}
                    placeholder="Selecionar modelo(s)..."
                  />
                </div>
                {modelosAvulsosTemp.map(mId => {
                  const modelo = modelos.find(m => m.id === mId)
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
                        const mod = modelos.find((m) => m.id === modelosAvulsosTemp[0])
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
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Label>Personagem(ns) ou PdN(s)</Label>
                <SelectMultiplo
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
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogAdicionarParticipante(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarAdicionarAvulso}
              disabled={
                tipoNovoPart === 'inimigo'
                  ? modelosAvulsosTemp.length === 0
                  : personagensAvulsosTemp.length === 0
              }
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* DIALOG: EDITAR INSTÂNCIA DE INIMIGO NO COMBATE */}
      <Dialog
        open={Boolean(inimigoEmEdicao)}
        onOpenChange={(aberto) => {
          if (!aberto) setInimigoEmEdicao(null)
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
                  Customizações feitas aqui afetam apenas este combate, sem alterar o Modelo original da lista de Antagonistas.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="nome-instancia">Rótulo / Nome no Combate</Label>
                  <Input
                    id="nome-instancia"
                    value={inimigoEmEdicao.nome}
                    onChange={(e) =>
                      setInimigoEmEdicao({ ...inimigoEmEdicao, nome: e.target.value })
                    }
                    placeholder="Ex: Carniçal Ocultista (Líder)"
                    required
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInimigoEmEdicao(null)}
                  disabled={salvandoEdicaoInimigo}
                >
                  Cancelar
                </Button>
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
