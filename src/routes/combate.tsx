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
  X,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
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
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
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
  CONDICOES_COMBATE_V5,
  ehInimigoIncapacitado,
  obterCondicaoCombate,
  obterProximoIndiceAtivo,
  type CombateVisivel,
  type InfoEstadoSaude,
  type ParticipanteCombate,
  type ParticipanteInimigo,
  type ParticipantePersonagem,
  type ParticipanteVisivel,
} from '#/domain/combate'
import type { Dano } from '#/domain/trilhas'
import { listarModelosBestiario } from '#/server/bestiario'
import {
  adicionarParticipanteCombateServer,
  alternarCondicaoParticipanteCombateServer,
  alternarRevelarVitalidadeCombateServer,
  aplicarDanoInimigoCombateServer,
  atualizarParticipanteInimigoServer,
  avancarTurnoCombateServer,
  carregarCombate,
  encerrarCombateServer,
  iniciarCombateServer,
  removerParticipanteCombateServer,
  reordenarParticipantesCombateServer,
  voltarTurnoCombateServer,
  type EstadoCombateNarrador,
} from '#/server/combate'
import { marcar } from '#/server/personagens'
import { listarPersonagensParaSorteio } from '#/server/sorteios'

type PersonagemSorteio = {
  id: string
  nome: string
  ehPdn: boolean
  donoNome: string
}

function BadgeSaude({
  vitalidadeMax,
  dano,
  ehVampiro = false,
  condicoes,
  infoCalculada,
  ocultarNumeros = false,
  soTag = false,
}: {
  vitalidadeMax?: number
  dano?: Dano
  ehVampiro?: boolean
  condicoes?: string[]
  infoCalculada?: InfoEstadoSaude
  ocultarNumeros?: boolean
  soTag?: boolean
}) {
  const info =
    infoCalculada ??
    (vitalidadeMax !== undefined && dano !== undefined
      ? calcularEstadoSaude(vitalidadeMax, dano, ehVampiro, condicoes)
      : undefined)

  if (!info) return null

  const total =
    vitalidadeMax !== undefined && dano !== undefined
      ? Math.min(vitalidadeMax, dano.superficial + dano.agravado)
      : null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer select-none',
            soTag
              ? 'size-6 p-0 items-center justify-center shrink-0'
              : 'px-2 py-0.5',
            info.classeCor,
          )}
          title={`Estado de Saúde: ${info.rotulo}`}
        >
          <span className="size-2 rounded-full bg-current shrink-0" />
          {!soTag && <span>{info.rotulo}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 text-xs" side="top">
        <div className="flex items-center justify-between gap-2 border-b pb-1.5 mb-2">
          <span className="font-semibold text-sm text-foreground">Estado de Saúde</span>
          <Badge variant="outline" className={cn('text-xs font-semibold', info.classeCor)}>
            {info.rotulo}
          </Badge>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-2">{info.descricao}</p>
        <div className="flex flex-col gap-1 text-[11px] bg-muted/50 rounded p-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Penalidade:</span>
            <span className="font-semibold text-foreground">{info.penalidade}</span>
          </div>
          {total !== null && !ocultarNumeros && dano && vitalidadeMax ? (
            <div className="flex justify-between items-center pt-1 border-t border-border/40">
              <span className="text-muted-foreground font-medium">Dano na Trilha:</span>
              <span className="font-mono text-foreground">
                {dano.superficial} Sup. / {dano.agravado} Agr. ({total}/{vitalidadeMax})
              </span>
            </div>
          ) : (
            <div className="text-muted-foreground italic text-[10px] pt-1 border-t border-border/40">
              Valores exatos da trilha ocultos pelo Narrador.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function TrilhaTatilExpandida({
  rotulo,
  dano,
  max,
  podeEditar,
  onChange,
}: {
  rotulo: string
  dano: Dano
  max: number
  podeEditar: boolean
  onChange?: (novoDano: Dano) => void
}) {
  function handleCliqueBox(index: number) {
    if (!podeEditar || !onChange) return
    const agravados = dano.agravado
    const superficiais = dano.superficial

    // box index < agravados: é X. Clicar limpa esse X (vira vazio).
    if (index < agravados) {
      onChange({ superficial: superficiais, agravado: agravados - 1 })
      return
    }

    // box index < agravados + superficiais: é /. Clicar transforma esse / em X.
    if (index < agravados + superficiais) {
      onChange({ superficial: superficiais - 1, agravado: agravados + 1 })
      return
    }

    // box vazio: Clicar adiciona 1 superficial /.
    onChange({ superficial: superficiais + 1, agravado: agravados })
  }

  return (
    <div className="flex items-start gap-3 select-none py-0.5">
      <span className="text-sm sm:text-base font-semibold text-foreground shrink-0 w-28 sm:w-36 pt-0.5">
        {rotulo}:
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {Array.from({ length: max }, (_, i) => {
          const ehAgravado = i < dano.agravado
          const ehSuperficial = !ehAgravado && i < dano.agravado + dano.superficial

          return (
            <button
              key={i}
              type="button"
              disabled={!podeEditar}
              onClick={() => handleCliqueBox(i)}
              className={cn(
                'size-7 rounded-md border-2 flex items-center justify-center font-mono text-sm font-bold transition-all',
                podeEditar ? 'cursor-pointer hover:border-foreground active:scale-95' : 'cursor-default',
                ehAgravado && 'border-destructive bg-destructive/20 text-destructive',
                ehSuperficial && 'border-amber-500/80 bg-amber-500/20 text-amber-600 dark:text-amber-400',
                !ehAgravado && !ehSuperficial && 'border-border/80 bg-background/50 text-transparent',
              )}
              title={
                podeEditar
                  ? ehAgravado
                    ? 'Agravado (clique para limpar)'
                    : ehSuperficial
                      ? 'Superficial (clique para virar Agravado)'
                      : 'Vazio (clique para marcar Superficial)'
                  : undefined
              }
            >
              {ehAgravado ? 'X' : ehSuperficial ? '/' : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FomeTatilExpandida({
  fome,
  podeEditar,
  onChange,
}: {
  fome: number
  podeEditar: boolean
  onChange?: (novoValor: number) => void
}) {
  return (
    <div className="flex items-start gap-3 select-none py-0.5 shrink-0">
      <span className="text-sm sm:text-base font-semibold text-foreground shrink-0 w-28 sm:w-auto pt-0.5">
        Fome:
      </span>
      <div className="flex items-center gap-1.5 pt-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          const cheia = i < fome
          return (
            <button
              key={i}
              type="button"
              disabled={!podeEditar}
              className={cn(
                'size-6 rounded-full border-2 transition-all',
                podeEditar ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default',
                cheia
                  ? 'border-vinho bg-vinho shadow-[0_0_8px_rgba(159,18,57,0.4)]'
                  : 'border-border/80 bg-background/50',
              )}
              onClick={() => {
                if (!podeEditar || !onChange) return
                const novoValor = fome === i + 1 ? i : i + 1
                onChange(novoValor)
              }}
              title={podeEditar ? `Definir Fome como ${i + 1}` : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}

function TrackersNumericosLinha({
  danoVitalidade,
  vitalidadeMax,
  danoVontade,
  vontadeMax,
  fome,
  vitalidadeOculta = false,
  condicaoOculta = false,
}: {
  danoVitalidade?: Dano
  vitalidadeMax?: number
  danoVontade?: Dano
  vontadeMax?: number
  fome?: number
  vitalidadeOculta?: boolean
  condicaoOculta?: boolean
}) {
  if (condicaoOculta) {
    return (
      <span className="text-xs text-muted-foreground italic px-1 py-0.5">
        Condição oculta (não compartilhada na Coterie)
      </span>
    )
  }

  return (
    <CarrosselBadges>
      {vitalidadeOculta ? (
        <span className="text-xs text-muted-foreground italic px-1 py-0.5 shrink-0">
          Vitalidade oculta
        </span>
      ) : danoVitalidade && vitalidadeMax !== undefined ? (
        <div
          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2 py-0.5 text-xs select-none shrink-0"
          title={`Vitalidade: ${danoVitalidade.superficial} superficial, ${danoVitalidade.agravado} agravado (máximo ${vitalidadeMax})`}
        >
          <span className="font-medium text-muted-foreground">Vitalidade</span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
            {danoVitalidade.superficial}
          </span>
          <span className="text-muted-foreground/60">/</span>
          <span className="font-mono font-bold text-destructive">
            {danoVitalidade.agravado}
          </span>
        </div>
      ) : null}

      {danoVontade && vontadeMax !== undefined ? (
        <div
          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2 py-0.5 text-xs select-none shrink-0"
          title={`Força de Vontade: ${danoVontade.superficial} superficial, ${danoVontade.agravado} agravado (máximo ${vontadeMax})`}
        >
          <span className="font-medium text-muted-foreground">Vontade</span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
            {danoVontade.superficial}
          </span>
          <span className="text-muted-foreground/60">/</span>
          <span className="font-mono font-bold text-destructive">
            {danoVontade.agravado}
          </span>
        </div>
      ) : null}

      {fome !== undefined ? (
        <div
          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2 py-0.5 text-xs select-none shrink-0"
          title={`Fome atual: ${fome}`}
        >
          <span className="font-medium text-muted-foreground">Fome</span>
          <span className="font-mono font-bold text-vinho dark:text-rose-400">
            {fome}
          </span>
        </div>
      ) : null}
    </CarrosselBadges>
  )
}

function BadgesCondicoes({
  participanteId,
  condicoes = [],
  podeEditar,
  onAlternarCondicao,
}: {
  participanteId: string
  condicoes?: string[]
  podeEditar: boolean
  onAlternarCondicao: (participanteId: string, condicaoId: string) => Promise<void>
}) {
  const [aberto, setAberto] = useState(false)
  const [salvandoId, setSalvandoId] = useState<string | null>(null)

  async function handleToggle(condId: string) {
    try {
      setSalvandoId(condId)
      await onAlternarCondicao(participanteId, condId)
    } finally {
      setSalvandoId(null)
    }
  }

  const condicoesValidas = condicoes
    .map((cId) => obterCondicaoCombate(cId))
    .filter((c): c is NonNullable<typeof c> => !!c)

  return (
    <div className="flex items-center gap-1.5 min-w-0 flex-1">
      <CarrosselBadges className="min-w-0 flex-1">
        {condicoesValidas.map((cond) => (
          <Popover key={cond.id}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer select-none',
                  cond.classeCor,
                )}
              >
                <span>{cond.nome}</span>
                {podeEditar && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggle(cond.id)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation()
                        handleToggle(cond.id)
                      }
                    }}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                    title={`Remover ${cond.nome}`}
                  >
                    <X className="size-3" />
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3 text-xs" side="top">
              <div className="flex items-center justify-between gap-2 border-b pb-1.5 mb-2">
                <span className="font-semibold text-sm text-foreground">{cond.nome}</span>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {cond.categoria}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-2">{cond.descricao}</p>
              <div className="bg-muted/60 p-2 rounded text-[11px] leading-tight text-foreground">
                <span className="font-semibold block mb-0.5 text-muted-foreground">Efeito Mecânico:</span>
                {cond.efeitoMecanico}
              </div>
              {podeEditar && (
                <div className="mt-2.5 pt-2 border-t flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive gap-1"
                    onClick={() => handleToggle(cond.id)}
                    disabled={salvandoId === cond.id}
                  >
                    <X className="size-3.5" />
                    Remover Condição
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        ))}

        {podeEditar && (
          <Popover open={aberto} onOpenChange={setAberto}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/40 hover:border-foreground/60 bg-transparent px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                title="Adicionar ou alternar condição/debuff"
              >
                <Plus className="size-3" />
                <span>Condição</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 max-h-80 overflow-y-auto p-2 text-xs" side="bottom" align="start">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1">
                Condições & Debuffs (V5)
              </div>
              <div className="flex flex-col gap-1">
                {CONDICOES_COMBATE_V5.map((c) => {
                  const ativa = condicoes.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleToggle(c.id)}
                      disabled={salvandoId === c.id}
                      className={cn(
                        'flex items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors cursor-pointer',
                        ativa
                          ? 'bg-secondary font-semibold text-secondary-foreground'
                          : 'hover:bg-muted text-foreground',
                      )}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                        <span className="font-medium truncate">{c.nome}</span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {c.efeitoMecanico}
                        </span>
                      </div>
                      {ativa && <span className="text-xs text-vinho font-bold shrink-0">✓</span>}
                    </button>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </CarrosselBadges>
    </div>
  )
}

function BadgeEspecial({ nome, descricao }: { nome: string; descricao?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
        >
          {nome}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-64 overflow-y-auto p-3 text-xs" side="top">
        <h4 className="font-semibold text-sm mb-1.5 text-foreground">{nome}</h4>
        {descricao?.trim() ? (
          <div className="text-muted-foreground text-xs leading-relaxed">
            <VisualizadorMarkdown markdown={descricao} />
          </div>
        ) : (
          <p className="text-muted-foreground italic text-xs">Sem detalhes adicionais.</p>
        )}
      </PopoverContent>
    </Popover>
  )
}

export const Route = createFileRoute('/combate')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
  },
  loader: async ({ context }) => {
    const dados = await carregarCombate()
    if (context.usuario?.papel === 'narrador') {
      const [modelos, personagens] = await Promise.all([
        listarModelosBestiario(),
        listarPersonagensParaSorteio(),
      ])
      return {
        ...dados,
        modelos,
        personagens: personagens as PersonagemSorteio[],
      }
    }
    return {
      ...dados,
      modelos: [] as ModeloAntagonista[],
      personagens: [] as PersonagemSorteio[],
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
    <div className="flex flex-col rounded-lg border border-dashed border-border/70 bg-card/40 opacity-80 hover:opacity-100 transition-opacity text-xs overflow-hidden">
      {/* LINHA 1: IDENTIFICAÇÃO / CATEGORIA / DANO / AÇÕES */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <Skull className="size-4 text-muted-foreground shrink-0" />
          <span className="font-serif font-bold text-sm text-foreground truncate">
            {part.nome}
          </span>
          {part.categoria && (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4.5 text-muted-foreground shrink-0">
              {part.categoria}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs font-mono gap-1 px-2 cursor-pointer"
                title="Ajustar dano do inimigo (reduzir dano agravado abaixo do máximo o reativa na iniciativa)"
              >
                <span className="text-amber-500 font-bold">{part.danoVitalidade.superficial}</span>
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
            <Edit3 className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemover(part.id)}
            className="size-7 text-destructive/70 hover:text-destructive"
            title="Remover definitivamente do combate"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* LINHA 2: ESTADO DE SAÚDE COMO CONDIÇÃO + OUTRAS CONDIÇÕES */}
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 border-t border-border/40 bg-muted/20 min-w-0">
        <BadgeSaude
          vitalidadeMax={part.vitalidadeMax}
          dano={part.danoVitalidade}
          ehVampiro={ehVampiro}
          condicoes={part.condicoes}
        />
        <BadgesCondicoes
          participanteId={part.id}
          condicoes={(part.condicoes ?? []).filter(
            (c) => !['morto', 'desacordado', 'incapacitado', 'torpor'].includes(c),
          )}
          podeEditar={true}
          onAlternarCondicao={onAlternarCondicao}
        />
      </div>
    </div>
  )
}

function CardInimigoIncapacitadoJogador({
  part,
}: {
  part: ParticipanteVisivel
}) {
  const ehVampiro = part.categoria?.toLowerCase().includes('vampiro') ?? false

  return (
    <div className="flex flex-col rounded-lg border border-border/50 bg-card/30 text-xs text-muted-foreground overflow-hidden">
      {/* LINHA 1: IDENTIFICAÇÃO / CATEGORIA / DANO SE REVELADO */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <Skull className="size-4 text-muted-foreground shrink-0" />
          <span className="font-serif font-bold text-sm text-foreground truncate">
            {part.nome}
          </span>
          {part.categoria && (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4.5 text-muted-foreground shrink-0">
              {part.categoria}
            </Badge>
          )}
        </div>

        {!part.vitalidadeOculta && part.danoVitalidade && (
          <div className="flex items-center gap-1 shrink-0 font-mono text-xs">
            <span className="text-amber-500 font-bold">{part.danoVitalidade.superficial}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-destructive font-bold">{part.danoVitalidade.agravado}</span>
          </div>
        )}
      </div>

      {/* LINHA 2: ESTADO DE SAÚDE COMO CONDIÇÃO + OUTRAS CONDIÇÕES */}
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 border-t border-border/40 bg-muted/10 min-w-0">
        <BadgeSaude
          vitalidadeMax={part.vitalidadeMax}
          dano={part.danoVitalidade}
          ehVampiro={ehVampiro}
          condicoes={part.condicoes}
          infoCalculada={part.estadoSaude}
          ocultarNumeros={part.vitalidadeOculta}
        />
        <BadgesCondicoes
          participanteId={part.id}
          condicoes={(part.condicoes ?? []).filter(
            (c) => !['morto', 'desacordado', 'incapacitado', 'torpor'].includes(c),
          )}
          podeEditar={false}
          onAlternarCondicao={async () => {}}
        />
      </div>
    </div>
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

// ==========================================
// VISÃO DO NARRADOR
// ==========================================
function VisaoNarrador({
  combate,
  modelos,
  personagens,
}: {
  combate: EstadoCombateNarrador | null
  modelos: ModeloAntagonista[]
  personagens: PersonagemSorteio[]
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
    paradas: {
      fisico: number
      social: number
      mental: number
      excepcionais: Array<{ nome: string; valor: number }>
    }
    especiais: Array<{ nome: string; descricao: string }>
    notas: string
  } | null>(null)
  const [salvandoEdicaoInimigo, setSalvandoEdicaoInimigo] = useState(false)

  const [selecaoPersonagens, setSelecaoPersonagens] = useState<string[]>([])
  const [inimigosParaAdicionar, setInimigosParaAdicionar] = useState<
    Array<{ modeloId: string; nome: string }>
  >([])
  const [personagensTemp, setPersonagensTemp] = useState<string[]>([])
  const [modelosTemp, setModelosTemp] = useState<string[]>([])

  const [tipoNovoPart, setTipoNovoPart] = useState<'personagem' | 'inimigo'>('inimigo')
  const [nomeInimigoAvulso, setNomeInimigoAvulso] = useState<string>('')
  const [personagensAvulsosTemp, setPersonagensAvulsosTemp] = useState<string[]>([])
  const [modelosAvulsosTemp, setModelosAvulsosTemp] = useState<string[]>([])

  const [arrastandoId, setArrastandoId] = useState<string | null>(null)
  const [destinoId, setDestinoId] = useState<string | null>(null)

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
      especiais: (part.especiais ?? []).map((esp) => ({ ...esp })),
      notas: part.notas ?? '',
    })
  }

  async function handleSalvarEdicaoInimigo(e: React.FormEvent) {
    e.preventDefault()
    if (!inimigoEmEdicao) return
    setSalvandoEdicaoInimigo(true)
    try {
      await atualizarParticipanteInimigoServer({
        data: {
          participanteId: inimigoEmEdicao.id,
          atualizacao: {
            nome: inimigoEmEdicao.nome,
            vitalidadeMax: inimigoEmEdicao.vitalidadeMax,
            vontadeMax: inimigoEmEdicao.vontadeMax,
            paradas: inimigoEmEdicao.paradas,
            especiais: inimigoEmEdicao.especiais,
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

  async function handleDropCard(partIdDestino: string) {
    if (!combate || !arrastandoId || arrastandoId === partIdDestino) {
      setArrastandoId(null)
      setDestinoId(null)
      return
    }

    const idsAtivos = participantesAtivos.map((p) => p.id)
    const indexOrigem = idsAtivos.indexOf(arrastandoId)
    const indexDestino = idsAtivos.indexOf(partIdDestino)
    if (indexOrigem === -1 || indexDestino === -1) {
      setArrastandoId(null)
      setDestinoId(null)
      return
    }

    const novosIds = [...idsAtivos]
    const [removido] = novosIds.splice(indexOrigem, 1)
    novosIds.splice(indexDestino, 0, removido)

    const todosIds = [...novosIds, ...inimigosIncapacitados.map((p) => p.id)]

    try {
      await reordenarParticipantesCombateServer({ data: { ordemIds: todosIds } })
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao reordenar.')
    } finally {
      setArrastandoId(null)
      setDestinoId(null)
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

  async function handleAlternarRevelar(id: string) {
    try {
      await alternarRevelarVitalidadeCombateServer({ data: { participanteId: id } })
      router.invalidate()
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
    const participantes: ParticipanteCombate[] = []

    for (const pId of selecaoPersonagens) {
      const char = personagens.find((p) => p.id === pId)
      if (char) {
        participantes.push({
          id: crypto.randomUUID(),
          tipo: 'personagem',
          personagemId: char.id,
          nome: char.nome,
          ehPdn: char.ehPdn,
          condicoes: [],
        })
      }
    }

    for (const inimigoInfo of inimigosParaAdicionar) {
      const modelo = modelos.find((m) => m.id === inimigoInfo.modeloId)
      if (modelo) {
        participantes.push({
          id: crypto.randomUUID(),
          tipo: 'inimigo',
          nome: inimigoInfo.nome,
          modeloId: modelo.id,
          categoria: modelo.categoria,
          vitalidadeMax: modelo.vitalidade,
          danoVitalidade: { superficial: 0, agravado: 0 },
          vontadeMax: modelo.vontade,
          danoVontade: { superficial: 0, agravado: 0 },
          paradas: {
            fisico: modelo.paradaFisico,
            social: modelo.paradaSocial,
            mental: modelo.paradaMental,
            excepcionais: modelo.paradasExcepcionais,
          },
          especiais: modelo.especiais,
          notas: modelo.notas,
          revelarVitalidade: false,
          condicoes: [],
        })
      }
    }

    if (participantes.length === 0) {
      toast.error('Selecione pelo menos um participante para iniciar o combate.')
      return
    }

    try {
      await iniciarCombateServer({ data: { participantes } })
      setDialogNovoCombate(false)
      setSelecaoPersonagens([])
      setInimigosParaAdicionar([])
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
            nome: char.nome,
            ehPdn: char.ehPdn,
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

          const part: ParticipanteInimigo = {
            id: crypto.randomUUID(),
            tipo: 'inimigo',
            nome: nomeFinal,
            modeloId: modelo.id,
            categoria: modelo.categoria,
            vitalidadeMax: modelo.vitalidade,
            danoVitalidade: { superficial: 0, agravado: 0 },
            vontadeMax: modelo.vontade,
            danoVontade: { superficial: 0, agravado: 0 },
            paradas: {
              fisico: modelo.paradaFisico,
              social: modelo.paradaSocial,
              mental: modelo.paradaMental,
              excepcionais: modelo.paradasExcepcionais,
            },
            especiais: modelo.especiais,
            notas: modelo.notas,
            revelarVitalidade: false,
            condicoes: [],
          }
          await adicionarParticipanteCombateServer({ data: { participante: part } })
        }
        setDialogAdicionarParticipante(false)
        setModelosAvulsosTemp([])
        setNomeInimigoAvulso('')
        toast.success('Inimigo(s) adicionado(s) ao combate!')
        router.invalidate()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Falha ao adicionar participante.')
      }
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp />
      <div className="flex flex-col gap-6 pt-2 pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-display text-balance">Combate</h1>
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
                    <Badge variant="outline" className="text-xs border-amber-500/70 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
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
                  setPersonagensTemp([])
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
                <Play className="size-3.5 fill-current" />
                Próximo Turno
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={alternarModoCompactoGeral}
                className="gap-1.5"
                title={modoCompactoGeral ? 'Expandir todos os cards' : 'Minimizar todos os cards'}
              >
                {modoCompactoGeral ? (
                  <>
                    <Maximize2 className="size-3.5" />
                    <span>Expandir Cards</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="size-3.5" />
                    <span>Minimizar Cards</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTipoNovoPart('inimigo')
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
              Monte os participantes (Personagens, PdNs e Inimigos do Bestiário) para iniciar a ordem de turnos.
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
          <div className="flex flex-col gap-3">
            {participantesAtivos.map((part, index) => {
              const ehTurnoAtual = combate ? part.id === combate.participantes[combate.turnoAtual]?.id : false
              const ehProximoTurno = combate && proximoIndex !== -1 ? part.id === combate.participantes[proximoIndex]?.id : false

              return (
                <div
                  key={part.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', part.id)
                    e.dataTransfer.effectAllowed = 'move'
                    setArrastandoId(part.id)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    if (destinoId !== part.id) {
                      setDestinoId(part.id)
                    }
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return
                    if (destinoId === part.id) {
                      setDestinoId(null)
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleDropCard(part.id)
                  }}
                  onDragEnd={() => {
                    setArrastandoId(null)
                    setDestinoId(null)
                  }}
                  className="relative"
                >
                  {estaMinimizado(part.id) ? (
                    /* MODO MINIMIZADO: FITA TÁTICA (3 LINHAS) - NARRADOR */
                    <div
                      className={cn(
                        'flex flex-col rounded-xl border bg-card transition-all shadow-xs overflow-hidden',
                        ehTurnoAtual && 'border-2 border-vinho shadow-md bg-vinho/[0.02]',
                        ehProximoTurno && !ehTurnoAtual && 'border-2 border-amber-500/60 bg-amber-500/[0.02]',
                        !ehTurnoAtual && !ehProximoTurno && 'border-border/80 hover:border-border',
                        arrastandoId === part.id && 'opacity-40 border-dashed border-primary scale-[0.99]',
                        destinoId === part.id && arrastandoId !== part.id && 'ring-2 ring-primary ring-offset-2',
                      )}
                    >
                      {/* LINHA 1: IDENTIDADE / VEZ / ESTADO DE SAÚDE / AÇÕES */}
                      <div className="flex items-start justify-between gap-3 px-4 py-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/60 hover:text-foreground shrink-0 mt-0.5"
                            title="Arraste para reordenar a iniciativa"
                          >
                            <GripVertical className="size-4" />
                          </div>
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                          <div className="flex flex-wrap items-start gap-2 min-w-0 pt-0.5">
                            <span className="font-serif font-bold text-base text-foreground truncate leading-tight">
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
                                className="relative flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40"
                                title="Próximo a agir"
                              >
                                <span className="size-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                              </span>
                            )}

                            {part.tipo === 'inimigo' ? (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4.5 text-muted-foreground shrink-0">
                                Inimigo
                              </Badge>
                            ) : part.ehPdn ? (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4.5 text-muted-foreground shrink-0">
                                PdN
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4.5 shrink-0">
                                Personagem
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Direita: Dot de Saúde + Ações Narrador + Maximizar */}
                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
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
                            onClick={() => handleReordenar(part.id, 'cima')}
                            className="size-7"
                            aria-label="Mover para cima"
                          >
                            <ArrowUp className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={index === participantesAtivos.length - 1}
                            onClick={() => handleReordenar(part.id, 'baixo')}
                            className="size-7"
                            aria-label="Mover para baixo"
                          >
                            <ArrowDown className="size-3.5" />
                          </Button>
                          {part.tipo === 'inimigo' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => abrirEditarInimigo(part)}
                                className="size-7"
                                title="Editar este inimigo no combate"
                              >
                                <Edit3 className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAlternarRevelar(part.id)}
                                className="size-7"
                                title={
                                  part.revelarVitalidade
                                    ? 'Ocultar Vitalidade dos Jogadores'
                                    : 'Revelar Vitalidade aos Jogadores'
                                }
                              >
                                {part.revelarVitalidade ? (
                                  <Eye className="size-3.5 text-vinho" />
                                ) : (
                                  <EyeOff className="size-3.5 text-muted-foreground" />
                                )}
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => alternarMinimizado(part.id)}
                            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Expandir card completo"
                          >
                            <Maximize2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoverParticipante(part.id)}
                            className="size-7 text-destructive hover:text-destructive"
                            aria-label="Remover participante"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* LINHA 2: TRACKERS EM VALORES NUMÉRICOS (CARROSSEL DRAG-FREE) */}
                      <div className="flex items-center px-4 py-1.5 border-t border-border/40 bg-muted/5 min-w-0 text-xs">
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
                          <span className="text-xs text-muted-foreground italic px-1 py-0.5">
                            Condição indisponível
                          </span>
                        )}
                      </div>

                      {/* LINHA 3: CONDIÇÕES / DEBUFFS (JUSTIFY-BETWEEN) */}
                      <div className="flex items-center justify-between gap-3 px-4 py-1.5 bg-muted/20 border-t border-border/50 text-xs min-h-9">
                        <BadgesCondicoes
                          participanteId={part.id}
                          condicoes={part.condicoes}
                          podeEditar={true}
                          onAlternarCondicao={handleAlternarCondicao}
                        />
                      </div>
                    </div>
                  ) : (
                    /* MODO MAXIMIZADO: CARD COMPLETO COM py-4 */
                    <Card
                      className={cn(
                        'py-4 transition-all duration-150',
                        ehTurnoAtual && 'border-2 border-vinho shadow-md bg-vinho/[0.03]',
                        ehProximoTurno && !ehTurnoAtual && 'border-2 border-amber-500/60 shadow-sm bg-amber-500/[0.03]',
                        !ehTurnoAtual && !ehProximoTurno && 'border border-border opacity-95',
                        arrastandoId === part.id && 'opacity-40 border-dashed border-primary scale-[0.99]',
                        destinoId === part.id && arrastandoId !== part.id && 'ring-2 ring-primary ring-offset-2',
                      )}
                    >
                      <CardHeader className="py-2.5 px-4 flex flex-row items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/60 hover:text-foreground shrink-0 mt-0.5"
                            title="Arraste para reordenar a iniciativa"
                          >
                            <GripVertical className="size-4" />
                          </div>
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                          <div className="flex flex-wrap items-start gap-2 pt-0.5 min-w-0">
                            <CardTitle className="font-serif text-xl truncate leading-tight">{part.nome}</CardTitle>
                            {ehTurnoAtual && (
                              <Badge className="bg-vinho text-white border-0 text-xs font-semibold shrink-0">
                                Agindo agora
                              </Badge>
                            )}
                            {ehProximoTurno && !ehTurnoAtual && (
                              <Badge
                                variant="outline"
                                className="border-amber-500/80 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs flex items-center gap-1 shrink-0"
                              >
                                <ArrowRight className="size-3" />
                                Próximo a agir
                              </Badge>
                            )}
                            {part.tipo === 'inimigo' ? (
                              <Badge variant="outline" className="text-xs shrink-0">
                                Inimigo
                              </Badge>
                            ) : part.ehPdn ? (
                              <Badge variant="outline" className="text-xs shrink-0">
                                PdN
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                Personagem
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

                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={index === 0}
                            onClick={() => handleReordenar(part.id, 'cima')}
                            className="size-8"
                            aria-label="Mover para cima"
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={index === participantesAtivos.length - 1}
                            onClick={() => handleReordenar(part.id, 'baixo')}
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
                                onClick={() => abrirEditarInimigo(part)}
                                className="size-8"
                                title="Editar este inimigo no combate (status, especiais, notas)"
                              >
                                <Edit3 className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAlternarRevelar(part.id)}
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
                            onClick={() => alternarMinimizado(part.id)}
                            className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Minimizar card"
                          >
                            <Minimize2 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoverParticipante(part.id)}
                            className="size-8 text-destructive hover:text-destructive"
                            aria-label="Remover participante"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-1 pb-3 px-4 flex flex-col gap-2.5">
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
                                    handleAlterarDanoInimigo(part.id, 'vitalidade', dano)
                                  }
                                />
                                <TrilhaTatilExpandida
                                  rotulo="Força de Vontade"
                                  dano={part.danoVontade}
                                  max={part.vontadeMax}
                                  podeEditar={true}
                                  onChange={(dano) =>
                                    handleAlterarDanoInimigo(part.id, 'vontade', dano)
                                  }
                                />
                              </div>
                            </div>

                            {part.paradas && (
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
                                {((part.paradas.excepcionais ?? part.paradas.especiais) ?? []).length > 0 && (
                                  <>
                                    <span>&bull;</span>
                                    {((part.paradas.excepcionais ?? part.paradas.especiais) ?? []).map((pe, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {pe.nome}: {pe.valor}
                                      </Badge>
                                    ))}
                                  </>
                                )}
                              </div>
                            )}

                            {part.notas && (
                              <div className="text-xs text-muted-foreground italic">
                                <VisualizadorMarkdown markdown={part.notas} />
                              </div>
                            )}

                            {part.especiais && part.especiais.length > 0 && (
                              <div className="flex items-center gap-1.5 pt-1 border-t min-w-0">
                                <span className="text-xs font-medium text-muted-foreground shrink-0">Especiais:</span>
                                <CarrosselBadges>
                                  {part.especiais.map((esp, i) => (
                                    <BadgeEspecial key={i} nome={esp.nome} descricao={esp.descricao} />
                                  ))}
                                </CarrosselBadges>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 pt-1.5 border-t min-w-0">
                              <span className="text-xs font-medium text-muted-foreground shrink-0">Condições:</span>
                              <BadgesCondicoes
                                participanteId={part.id}
                                condicoes={part.condicoes}
                                podeEditar={true}
                                onAlternarCondicao={handleAlternarCondicao}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {part.condicaoPersonagem ? (
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex flex-col gap-2 items-start min-w-0">
                                  <TrilhaTatilExpandida
                                    rotulo="Vitalidade"
                                    dano={part.condicaoPersonagem.danoVitalidade}
                                    max={part.condicaoPersonagem.vitalidadeMax}
                                    podeEditar={true}
                                    onChange={(dano) =>
                                      handleAlterarDanoPersonagem(part.personagemId, 'vitalidade', dano)
                                    }
                                  />
                                  <TrilhaTatilExpandida
                                    rotulo="Força de Vontade"
                                    dano={part.condicaoPersonagem.danoVontade}
                                    max={part.condicaoPersonagem.vontadeMax}
                                    podeEditar={true}
                                    onChange={(dano) =>
                                      handleAlterarDanoPersonagem(part.personagemId, 'vontade', dano)
                                    }
                                  />
                                </div>

                                <FomeTatilExpandida
                                  fome={part.condicaoPersonagem.fome}
                                  podeEditar={true}
                                  onChange={(novaFome) =>
                                    handleAlterarFomePersonagem(part.personagemId, novaFome)
                                  }
                                />
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">Condição indisponível.</p>
                            )}

                            <div className="flex items-center gap-1.5 pt-1.5 border-t min-w-0">
                              <span className="text-xs font-medium text-muted-foreground shrink-0">Condições:</span>
                              <BadgesCondicoes
                                participanteId={part.id}
                                condicoes={part.condicoes}
                                podeEditar={true}
                                onAlternarCondicao={handleAlternarCondicao}
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )
            })}

            {/* SEÇÃO INFERIOR: INIMIGOS FORA DE COMBATE (INCAPACITADOS / MORTOS / TORPOR) */}
            {inimigosIncapacitados.length > 0 && (
              <div className="flex flex-col gap-2.5 pt-4 border-t border-dashed border-border/80 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skull className="size-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Inimigos Fora de Combate ({inimigosIncapacitados.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
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
          </div>
        )}
      </div>

      {/* DIALOG: NOVO COMBATE */}
      <Dialog open={dialogNovoCombate} onOpenChange={setDialogNovoCombate}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
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
              <Label className="font-semibold flex items-center gap-1.5">
                <Users className="size-4" />
                Personagens e PdNs da Crônica
              </Label>
              <SelectMultiplo
                opcoes={personagens.map((p) => ({
                  valor: p.id,
                  rotulo: p.nome,
                  detalhe: p.ehPdn ? '(PdN)' : undefined,
                  desabilitado: selecaoPersonagens.includes(p.id),
                }))}
                valores={personagensTemp}
                onChange={setPersonagensTemp}
                placeholder="Selecionar personagens..."
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={personagensTemp.length === 0}
                onClick={() => {
                  setSelecaoPersonagens([
                    ...selecaoPersonagens,
                    ...personagensTemp.filter((id) => !selecaoPersonagens.includes(id)),
                  ])
                  setPersonagensTemp([])
                }}
                className="self-start gap-1.5"
              >
                <Plus className="size-3.5" />
                Adicionar {personagensTemp.length > 0 ? `(${personagensTemp.length})` : ''}
              </Button>

              {selecaoPersonagens.length > 0 && (
                <div className="flex flex-col gap-1 border rounded-md p-2 max-h-40 overflow-y-auto">
                  {selecaoPersonagens.map((pId) => {
                    const char = personagens.find((p) => p.id === pId)
                    if (!char) return null
                    return (
                      <div key={pId} className="flex items-center justify-between text-sm py-1 border-b last:border-b-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{char.nome}</span>
                          {char.ehPdn && <span className="text-xs text-muted-foreground">(PdN)</span>}
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
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="font-semibold flex items-center gap-1.5">
                <Skull className="size-4" />
                Inimigos a partir do Bestiário
              </Label>
              {modelos.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum modelo cadastrado no Bestiário.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  <SelectMultiplo
                    opcoes={modelos.map((m) => ({
                      valor: m.id ?? '',
                      rotulo: m.nome,
                      detalhe: `${m.categoria} • Vit ${m.vitalidade}, Vont ${m.vontade}`,
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
                            modeloId: modelo.id,
                            nome: nomeSugerido,
                          })
                        }
                      }
                      setInimigosParaAdicionar(novosInimigos)
                      setModelosTemp([])
                    }}
                    className="self-start gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    Adicionar {modelosTemp.length > 0 ? `(${modelosTemp.length})` : ''}
                  </Button>

                  {inimigosParaAdicionar.length > 0 && (
                    <div className="flex flex-col gap-1 border rounded-md p-2 max-h-48 overflow-y-auto">
                      {inimigosParaAdicionar.map((inimigo, idx) => {
                        const mod = modelos.find((m) => m.id === inimigo.modeloId)
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 text-sm py-1.5 border-b last:border-b-0"
                          >
                            <div className="flex flex-col flex-1 min-w-0">
                              <Input
                                value={inimigo.nome}
                                onChange={(e) => {
                                  const copia = [...inimigosParaAdicionar]
                                  copia[idx].nome = e.target.value
                                  setInimigosParaAdicionar(copia)
                                }}
                                className="h-7 text-xs"
                              />
                              {mod?.categoria && (
                                <span className="text-[10px] text-muted-foreground mt-0.5 ml-0.5">
                                  Categoria: <strong className="font-medium text-foreground">{mod.categoria}</strong>
                                </span>
                              )}
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
                              <Trash2 className="size-3.5" />
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
                  setModelosAvulsosTemp([])
                  setNomeInimigoAvulso('')
                }}
              >
                Inimigo (Bestiário)
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
                <div className="flex flex-col gap-1.5">
                  <Label>Modelo(s) do Bestiário</Label>
                  <SelectMultiplo
                    opcoes={modelos.map((m) => ({
                      valor: m.id ?? '',
                      rotulo: m.nome,
                      detalhe: `${m.categoria} • Vit ${m.vitalidade}, Vont ${m.vontade}`,
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
                {modelosAvulsosTemp.length === 1 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="nome-inimigo-avulso">Rótulo / Nome no Combate (opcional)</Label>
                      {(() => {
                        const mod = modelos.find((m) => m.id === modelosAvulsosTemp[0])
                        return mod ? (
                          <span className="text-[11px] text-muted-foreground">
                            Categoria: <strong className="font-medium text-foreground">{mod.categoria}</strong>
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
              <div className="flex flex-col gap-1.5">
                <Label>Personagem(ns) ou PdN(s)</Label>
                <SelectMultiplo
                  opcoes={personagens.map((p) => ({
                    valor: p.id,
                    rotulo: p.nome,
                    detalhe: p.ehPdn ? '(PdN)' : undefined,
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {inimigoEmEdicao && (
            <form onSubmit={handleSalvarEdicaoInimigo}>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">
                  Editar Inimigo no Combate
                </DialogTitle>
                <DialogDescription>
                  Customizações feitas aqui afetam apenas este combate, sem alterar o Modelo original do Bestiário.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-1.5">
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

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="inst-fisico">Físico</Label>
                    <InputNumero
                      id="inst-fisico"
                      min={1}
                      max={15}
                      value={inimigoEmEdicao.paradas.fisico}
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
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="inst-social">Social</Label>
                    <InputNumero
                      id="inst-social"
                      min={1}
                      max={15}
                      value={inimigoEmEdicao.paradas.social}
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
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="inst-mental">Mental</Label>
                    <InputNumero
                      id="inst-mental"
                      min={1}
                      max={15}
                      value={inimigoEmEdicao.paradas.mental}
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
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
                  <div className="flex flex-col gap-1.5">
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
                      <Plus className="size-3.5" />
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
                      <Plus className="size-3.5" />
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
                          onClick={() => {
                            const copia = inimigoEmEdicao.especiais.filter((_, i) => i !== idx)
                            setInimigoEmEdicao({ ...inimigoEmEdicao, especiais: copia })
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
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
            <AlertDialogTitle className="font-serif text-lg">
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

// ==========================================
// VISÃO DO JOGADOR
// ==========================================
function VisaoJogador({ combate }: { combate: CombateVisivel | null }) {
  const router = useRouter()
  const [passandoTurno, setPassandoTurno] = useState(false)

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

  const participanteAtual = combate?.participantes[combate.turnoAtual]
  const ehMeuTurno = participanteAtual?.tipo === 'personagem' && participanteAtual?.ehMeu === true

  const proximoIndex = combate ? obterProximoIndiceAtivo(combate) : -1
  const proximoParticipante =
    proximoIndex !== -1 && combate ? combate.participantes[proximoIndex] : null

  async function handlePassarMeuTurno() {
    setPassandoTurno(true)
    try {
      await avancarTurnoCombateServer()
      toast.success('Turno concluído com sucesso!')
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao passar turno.')
    } finally {
      setPassandoTurno(false)
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

  async function handleAlterarDanoMeuPersonagem(
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
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar dano.')
    }
  }

  async function handleAlterarFomeMeuPersonagem(personagemId: string, novaFome: number) {
    try {
      await marcar({ data: { id: personagemId, marcas: { fome: novaFome } } })
      router.invalidate()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar fome.')
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp />
      <div className="flex flex-col gap-6 pt-2 pb-12">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-display text-balance">Combate</h1>
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
                  <Badge variant="outline" className="text-xs border-amber-500/70 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <ArrowRight className="size-3" />
                    Próximo: {proximoParticipante.nome} {proximoParticipante.tipo === 'inimigo' ? '(Inimigo)' : ''}
                  </Badge>
                )}
                {ehMeuTurno && (
                  <Button
                    size="sm"
                    onClick={handlePassarMeuTurno}
                    disabled={passandoTurno}
                    className="gap-1.5 font-semibold bg-vinho hover:bg-vinho/90 text-white ml-auto sm:ml-0"
                  >
                    <Play className="size-3.5 fill-current" />
                    {passandoTurno ? 'Passando...' : 'Concluir Meu Turno'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={alternarModoCompactoGeral}
                  className="gap-1.5 ml-auto sm:ml-0"
                  title={modoCompactoGeral ? 'Expandir todos os cards' : 'Minimizar todos os cards'}
                >
                  {modoCompactoGeral ? (
                    <>
                      <Maximize2 className="size-3.5" />
                      <span>Expandir Cards</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="size-3.5" />
                      <span>Minimizar Cards</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {combate
              ? 'Acompanhamento do conflito em tempo real.'
              : 'Nenhum Combate em andamento no momento.'}
          </p>
        </div>

        {!combate ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center">
            <Swords className="size-12 text-muted-foreground/60 mb-3" />
            <h3 className="font-serif text-2xl font-medium">Nenhum Combate em andamento</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Aguarde o Narrador iniciar a cena de conflito. Você será notificado quando seu Personagem entrar em combate.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {participantesAtivos.map((part, index) => {
              const ehTurnoAtual = combate ? part.id === combate.participantes[combate.turnoAtual]?.id : false
              const ehProximoTurno = combate && proximoIndex !== -1 ? part.id === combate.participantes[proximoIndex]?.id : false

              return (
                <div key={part.id}>
                  {estaMinimizado(part.id) ? (
                    /* MODO MINIMIZADO: FITA TÁTICA (3 LINHAS) - JOGADOR */
                    <div
                      className={cn(
                        'flex flex-col rounded-xl border bg-card transition-all shadow-xs overflow-hidden',
                        ehTurnoAtual && 'border-2 border-vinho shadow-md bg-vinho/[0.02]',
                        ehProximoTurno && !ehTurnoAtual && 'border-2 border-amber-500/60 bg-amber-500/[0.02]',
                        !ehTurnoAtual && !ehProximoTurno && 'border-border/80 hover:border-border',
                      )}
                    >
                      {/* LINHA 1: IDENTIDADE / VEZ / ESTADO DE SAÚDE / MAXIMIZAR */}
                      <div className="flex items-start justify-between gap-3 px-4 py-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                          <div className="flex flex-wrap items-start gap-2 min-w-0 pt-0.5">
                            <span className="font-serif font-bold text-base text-foreground truncate leading-tight">
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
                                className="relative flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40"
                                title="Próximo a agir"
                              >
                                <span className="size-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                              </span>
                            )}

                            {part.tipo === 'inimigo' ? (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4.5 text-muted-foreground shrink-0">
                                Inimigo
                              </Badge>
                            ) : part.ehPdn ? (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4.5 text-muted-foreground shrink-0">
                                PdN
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4.5 shrink-0">
                                Personagem
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Direita: Dot de Saúde + Botão Maximizar */}
                        <div className="flex items-center gap-2 shrink-0 pt-0.5">
                          {part.tipo === 'inimigo' ? (
                            <BadgeSaude
                              vitalidadeMax={part.vitalidadeMax}
                              dano={part.danoVitalidade}
                              condicoes={part.condicoes}
                              ehVampiro={part.categoria?.toLowerCase().includes('vampiro') ?? false}
                              infoCalculada={part.estadoSaude}
                              ocultarNumeros={part.vitalidadeOculta}
                              soTag={true}
                            />
                          ) : (
                            <BadgeSaude
                              vitalidadeMax={part.condicao?.vitalidadeMax}
                              dano={part.condicao?.danoVitalidade}
                              condicoes={part.condicoes}
                              ehVampiro={true}
                              infoCalculada={part.estadoSaude}
                              ocultarNumeros={part.condicaoOculta}
                              soTag={true}
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => alternarMinimizado(part.id)}
                            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Expandir card completo"
                          >
                            <Maximize2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* LINHA 2: TRACKERS EM VALORES NUMÉRICOS (CARROSSEL DRAG-FREE) */}
                      <div className="flex items-center px-4 py-1.5 border-t border-border/40 bg-muted/5 min-w-0 text-xs">
                        {part.tipo === 'inimigo' ? (
                          <TrackersNumericosLinha
                            danoVitalidade={part.danoVitalidade}
                            vitalidadeMax={part.vitalidadeMax}
                            vitalidadeOculta={part.vitalidadeOculta}
                          />
                        ) : part.condicao ? (
                          <TrackersNumericosLinha
                            danoVitalidade={part.condicao.danoVitalidade}
                            vitalidadeMax={part.condicao.vitalidadeMax}
                            danoVontade={part.condicao.danoVontade}
                            vontadeMax={part.condicao.vontadeMax}
                            fome={part.condicao.fome}
                            condicaoOculta={part.condicaoOculta}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground italic px-1 py-0.5">
                            {part.condicaoOculta ? 'Condição oculta' : 'Condição indisponível'}
                          </span>
                        )}
                      </div>

                      {/* LINHA 3: CONDIÇÕES / DEBUFFS (JUSTIFY-BETWEEN) */}
                      <div className="flex items-center justify-between gap-3 px-4 py-1.5 bg-muted/20 border-t border-border/50 text-xs min-h-9">
                        <BadgesCondicoes
                          participanteId={part.id}
                          condicoes={part.condicoes}
                          podeEditar={part.ehMeu === true}
                          onAlternarCondicao={handleAlternarCondicao}
                        />
                        {ehTurnoAtual && part.ehMeu && (
                          <Button
                            size="sm"
                            onClick={handlePassarMeuTurno}
                            disabled={passandoTurno}
                            className="h-7 text-xs gap-1 font-semibold bg-vinho hover:bg-vinho/90 text-white shrink-0 ml-2 shadow-sm"
                          >
                            <Play className="size-3 fill-current" />
                            {passandoTurno ? 'Passando...' : 'Concluir Turno'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* MODO MAXIMIZADO: CARD COMPLETO COM py-4 - JOGADOR */
                    <Card
                      className={cn(
                        'py-4 transition-all duration-150',
                        ehTurnoAtual && 'border-2 border-vinho shadow-md bg-vinho/[0.03]',
                        ehProximoTurno && !ehTurnoAtual && 'border-2 border-amber-500/60 shadow-sm bg-amber-500/[0.03]',
                        !ehTurnoAtual && !ehProximoTurno && 'border border-border opacity-95',
                      )}
                    >
                      <CardHeader className="py-2.5 px-4 flex flex-row items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                          <div className="flex flex-wrap items-start gap-2 pt-0.5 min-w-0">
                            <CardTitle className="font-serif text-xl truncate leading-tight">{part.nome}</CardTitle>
                            {ehTurnoAtual && (
                              <Badge className="bg-vinho text-white border-0 text-xs font-semibold shrink-0">
                                Agindo agora
                              </Badge>
                            )}
                            {ehProximoTurno && !ehTurnoAtual && (
                              <Badge
                                variant="outline"
                                className="border-amber-500/80 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs flex items-center gap-1 shrink-0"
                              >
                                <ArrowRight className="size-3" />
                                Próximo a agir
                              </Badge>
                            )}
                            {part.tipo === 'inimigo' ? (
                              <Badge variant="outline" className="text-xs shrink-0">
                                Inimigo
                              </Badge>
                            ) : part.ehPdn ? (
                              <Badge variant="outline" className="text-xs shrink-0">
                                PdN
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                Personagem
                              </Badge>
                            )}
                            {part.tipo === 'inimigo' ? (
                              <BadgeSaude
                                vitalidadeMax={part.vitalidadeMax}
                                dano={part.danoVitalidade}
                                condicoes={part.condicoes}
                                ehVampiro={part.categoria?.toLowerCase().includes('vampiro') ?? false}
                                infoCalculada={part.estadoSaude}
                                ocultarNumeros={part.vitalidadeOculta}
                              />
                            ) : (
                              <BadgeSaude
                                vitalidadeMax={part.condicao?.vitalidadeMax}
                                dano={part.condicao?.danoVitalidade}
                                condicoes={part.condicoes}
                                ehVampiro={true}
                                infoCalculada={part.estadoSaude}
                                ocultarNumeros={part.condicaoOculta}
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 pt-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => alternarMinimizado(part.id)}
                            className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Minimizar card"
                          >
                            <Minimize2 className="size-4" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-1 pb-3 px-4 flex flex-col gap-2.5">
                        {part.tipo === 'inimigo' ? (
                          <div className="flex flex-col gap-3">
                            {part.vitalidadeOculta ? (
                              <p className="text-xs text-muted-foreground italic">
                                Vitalidade oculta pelo Narrador.
                              </p>
                            ) : (
                              <div className="flex flex-col gap-2 items-start min-w-0">
                                <TrilhaTatilExpandida
                                  rotulo="Vitalidade"
                                  dano={part.danoVitalidade ?? { superficial: 0, agravado: 0 }}
                                  max={part.vitalidadeMax ?? 3}
                                  podeEditar={false}
                                />
                              </div>
                            )}
                            {part.especiais && part.especiais.length > 0 && (
                              <div className="flex items-center gap-1.5 pt-1.5 border-t min-w-0">
                                <span className="text-xs font-medium text-muted-foreground shrink-0">Especiais:</span>
                                <CarrosselBadges>
                                  {part.especiais.map((esp, i) => (
                                    <BadgeEspecial key={i} nome={esp.nome} descricao={esp.descricao} />
                                  ))}
                                </CarrosselBadges>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 pt-1.5 border-t min-w-0">
                              <span className="text-xs font-medium text-muted-foreground shrink-0">Condições:</span>
                              <BadgesCondicoes
                                participanteId={part.id}
                                condicoes={part.condicoes}
                                podeEditar={false}
                                onAlternarCondicao={handleAlternarCondicao}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {part.condicaoOculta ? (
                              <p className="text-xs text-muted-foreground italic">
                                Condição oculta (não compartilhada na Coterie).
                              </p>
                            ) : part.condicao ? (
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex flex-col gap-2 items-start min-w-0">
                                  <TrilhaTatilExpandida
                                    rotulo="Vitalidade"
                                    dano={part.condicao.danoVitalidade}
                                    max={part.condicao.vitalidadeMax}
                                    podeEditar={part.ehMeu === true}
                                    onChange={
                                      part.ehMeu
                                        ? (dano) =>
                                            handleAlterarDanoMeuPersonagem(
                                              part.personagemId!,
                                              'vitalidade',
                                              dano,
                                            )
                                        : undefined
                                    }
                                  />
                                  <TrilhaTatilExpandida
                                    rotulo="Força de Vontade"
                                    dano={part.condicao.danoVontade}
                                    max={part.condicao.vontadeMax}
                                    podeEditar={part.ehMeu === true}
                                    onChange={
                                      part.ehMeu
                                        ? (dano) =>
                                            handleAlterarDanoMeuPersonagem(
                                              part.personagemId!,
                                              'vontade',
                                              dano,
                                            )
                                        : undefined
                                    }
                                  />
                                </div>

                                <FomeTatilExpandida
                                  fome={part.condicao.fome}
                                  podeEditar={part.ehMeu === true}
                                  onChange={
                                    part.ehMeu
                                      ? (novaFome) =>
                                          handleAlterarFomeMeuPersonagem(part.personagemId!, novaFome)
                                      : undefined
                                  }
                                />
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">Condição indisponível.</p>
                            )}

                            <div className="flex items-center gap-1.5 pt-1.5 border-t min-w-0">
                              <span className="text-xs font-medium text-muted-foreground shrink-0">Condições:</span>
                              <BadgesCondicoes
                                participanteId={part.id}
                                condicoes={part.condicoes}
                                podeEditar={part.ehMeu === true}
                                onAlternarCondicao={handleAlternarCondicao}
                              />
                            </div>
                          </div>
                        )}

                        {ehTurnoAtual && part.ehMeu && (
                          <div className="pt-2 border-t flex justify-end">
                            <Button
                              size="sm"
                              onClick={handlePassarMeuTurno}
                              disabled={passandoTurno}
                              className="gap-1.5 font-semibold bg-vinho hover:bg-vinho/90 text-white shadow-sm"
                            >
                              <Play className="size-3.5 fill-current" />
                              {passandoTurno ? 'Passando...' : 'Concluir Meu Turno'}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )
            })}

            {/* SEÇÃO INFERIOR: INIMIGOS FORA DE COMBATE (JOGADOR) */}
            {inimigosIncapacitados.length > 0 && (
              <div className="flex flex-col gap-2.5 pt-4 border-t border-dashed border-border/80 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skull className="size-4 text-muted-foreground" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Inimigos Fora de Combate ({inimigosIncapacitados.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Fora da iniciativa
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {inimigosIncapacitados.map((part) => (
                    <CardInimigoIncapacitadoJogador
                      key={part.id}
                      part={part}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
