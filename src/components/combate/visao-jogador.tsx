import { useRouter } from '@tanstack/react-router'
import { cn } from 'cn'
import { ArrowRight, Maximize2, Minimize2, Play, Plus, Skull, Swords, X } from 'lucide-react'
import { useState, type ComponentType, type ReactNode } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { CardCombate } from '#/components/combate/card-combate'
import { BadgeEspecial } from '#/components/badge-especial'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { CarrosselBadges } from '#/components/ui/carrossel-badges'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { SelectMultiplo } from '#/components/ui/select-multiplo'
import {
  calcularEstadoSaude, CONDICOES_COMBATE_V5, ehInimigoIncapacitado,
  ehParticipanteVampiro, obterCondicaoCombate, obterProximoIndiceAtivo,
  type CombateVisivel, type EstadoSaude, type InfoEstadoSaude, type ParticipanteVisivel,
} from '#/domain/combate'
import type { Dano } from '#/domain/trilhas'
import { avancarTurnoCombateServer, alternarCondicaoParticipanteCombateServer } from '#/server/combate'
import { marcar } from '#/server/personagens'

function obterClasseCorEstadoSaude(estado: EstadoSaude): string {
  switch (estado) {
    case 'morto':
      return 'bg-destructive/20 text-destructive border-destructive/40 font-bold'
    case 'torpor':
      return 'bg-saude-torpor/15 text-saude-torpor border-saude-torpor/30 font-semibold'
    case 'debilitado':
      return 'bg-destructive/15 text-destructive border-destructive/30 font-semibold'
    case 'ferido':
      return 'bg-saude-ferido/15 text-saude-ferido border-saude-ferido/30'
    case 'escoriado':
      return 'bg-saude-escoriado/15 text-saude-escoriado border-saude-escoriado/30'
    case 'saudavel':
    default:
      return 'bg-saude-saudavel/15 text-saude-saudavel border-saude-saudavel/30'
  }
}

function obterClasseCorCondicao(condId: string, categoria?: string): string {
  switch (condId) {
    case 'morto':
      return 'bg-destructive/20 text-destructive border-destructive/40 font-bold'
    case 'torpor':
      return 'bg-saude-torpor/15 text-saude-torpor border-saude-torpor/30 font-semibold'
    case 'desacordado':
      return 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30 font-medium'
    case 'frenesi':
      return 'bg-destructive/15 text-destructive border-destructive/30 font-semibold'
    case 'em-chamas':
      return 'bg-condicao-chamas/15 text-condicao-chamas border-condicao-chamas/30'
    case 'estacado':
      return 'bg-saude-torpor/15 text-saude-torpor border-saude-torpor/30'
    case 'imobilizado':
      return 'bg-destructive/15 text-destructive border-destructive/30'
    default:
      if (categoria === 'buff') {
        return 'bg-saude-saudavel/15 text-saude-saudavel border-saude-saudavel/30'
      }
      return 'bg-dano-superficial/15 text-dano-superficial border-dano-superficial/30'
  }
}

export function BadgeSaude({
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

  const classeCor = obterClasseCorEstadoSaude(info.estado)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className={cn(
            'inline-flex h-auto items-center gap-1 rounded-md border text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer select-none',
            soTag
              ? 'size-6 p-0 items-center justify-center shrink-0'
              : 'px-2 py-1',
            classeCor,
          )}
          title={`Estado de Saúde: ${info.rotulo}`}
        >
          <span className="size-2 rounded-full bg-current shrink-0" />
          {!soTag && <span>{info.rotulo}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 text-xs" side="top">
        <div className="flex items-center justify-between gap-2 border-b pb-1 mb-2">
          <span className="font-semibold text-sm text-foreground">Estado de Saúde</span>
          <Badge variant="outline" className={cn('text-xs font-semibold', classeCor)}>
            {info.rotulo}
          </Badge>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-2">{info.descricao}</p>
        <div className="flex flex-col gap-1 text-xs bg-muted/50 rounded p-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Penalidade:</span>
            <span className="font-semibold text-foreground">{info.penalidade}</span>
          </div>
          {total !== null && !ocultarNumeros && dano && vitalidadeMax ? (
            <div className="flex justify-between items-center pt-1 border-t border-border/40">
              <span className="text-muted-foreground font-medium">Dano na Trilha:</span>
              <span className="font-mono text-foreground flex items-center gap-1">
                <span className="text-dano-superficial font-bold">{dano.superficial}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-destructive font-bold">{dano.agravado}</span>
                <span className="text-muted-foreground text-xs">({total}/{vitalidadeMax})</span>
              </span>
            </div>
          ) : (
            <div className="text-muted-foreground italic text-xs pt-1 border-t border-border/40">
              Valores exatos da trilha ocultos pelo Narrador.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function TrilhaTatilExpandida({
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
    <div data-trilha-combate="" className="flex items-start gap-3 select-none py-1">
      <span className="text-sm sm:text-base font-semibold text-foreground shrink-0 w-28 sm:w-36 pt-1">
        {rotulo}:
      </span>
      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: max }, (_, i) => {
          const ehAgravado = i < dano.agravado
          const ehSuperficial = !ehAgravado && i < dano.agravado + dano.superficial

          return (
            <Button
              variant="ghost"
              size="sm"
              key={i}
              type="button"
              disabled={!podeEditar}
              onClick={() => handleCliqueBox(i)}
              className={cn(
                'size-7 p-0 rounded-md border-2 flex items-center justify-center font-mono text-sm font-bold transition-all',
                podeEditar ? 'cursor-pointer hover:border-foreground active:scale-95' : 'cursor-default',
                ehAgravado && 'border-destructive bg-destructive/20 text-destructive',
                ehSuperficial && 'border-dano-superficial/80 bg-dano-superficial/20 text-dano-superficial',
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
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export function FomeTatilExpandida({
  fome,
  podeEditar,
  onChange,
}: {
  fome: number
  podeEditar: boolean
  onChange?: (novoValor: number) => void
}) {
  return (
    <div data-trilha-combate="" className="flex items-start gap-3 select-none py-1 shrink-0">
      <span className="text-sm sm:text-base font-semibold text-foreground shrink-0 w-28 sm:w-auto pt-1">
        Fome:
      </span>
      <div className="flex items-center gap-1 pt-1">
        {Array.from({ length: 5 }, (_, i) => {
          const cheia = i < fome
          return (
            <Button
              variant="ghost"
              size="sm"
              key={i}
              type="button"
              disabled={!podeEditar}
              className={cn(
                'size-6 p-0 rounded-full border-2 transition-all',
                podeEditar ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default',
                cheia
                  ? 'border-vinho bg-vinho '
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

export function TrackersNumericosLinha({
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
      <span className="text-xs text-muted-foreground italic px-1 py-1">
        Condição oculta (não compartilhada na Coterie)
      </span>
    )
  }

  return (
    <CarrosselBadges>
      {vitalidadeOculta ? (
        <span className="text-xs text-muted-foreground italic px-1 py-1 shrink-0">
          Vitalidade oculta
        </span>
      ) : danoVitalidade && vitalidadeMax !== undefined ? (
        <div
          className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs select-none shrink-0"
          title={`Vitalidade: ${danoVitalidade.superficial} superficial, ${danoVitalidade.agravado} agravado (máximo ${vitalidadeMax})`}
        >
          <span className="font-medium text-muted-foreground">Vitalidade</span>
          <span className="font-mono font-bold text-dano-superficial">
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
          className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs select-none shrink-0"
          title={`Força de Vontade: ${danoVontade.superficial} superficial, ${danoVontade.agravado} agravado (máximo ${vontadeMax})`}
        >
          <span className="font-medium text-muted-foreground">Vontade</span>
          <span className="font-mono font-bold text-dano-superficial">
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
          className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs select-none shrink-0"
          title={`Fome atual: ${fome}`}
        >
          <span className="font-medium text-muted-foreground">Fome</span>
          <span className="font-mono font-bold text-fome">
            {fome}
          </span>
        </div>
      ) : null}
    </CarrosselBadges>
  )
}

export function BadgesCondicoes({
  participanteId,
  condicoes = [],
  podeEditar,
  onAlternarCondicao,
  ehVampiro = true,
}: {
  participanteId: string
  condicoes?: string[]
  podeEditar: boolean
  onAlternarCondicao: (participanteId: string, condicaoId: string) => Promise<void>
  ehVampiro?: boolean
}) {
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

  const opcoesCondicoes = CONDICOES_COMBATE_V5.filter(
    (c) => ehVampiro || c.id !== 'torpor' || condicoes.includes(c.id),
  )

  return (
    <div className="flex items-center justify-between gap-2 min-w-0 flex-1">
      <CarrosselBadges className="min-w-0 flex-1">
        {condicoesValidas.map((cond) => (
          <Popover key={cond.id}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className={cn(
                  'inline-flex h-auto items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer select-none',
                  obterClasseCorCondicao(cond.id, cond.categoria),
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
                    className="ml-1 rounded-full p-1 hover:bg-muted"
                    title={`Remover ${cond.nome}`}
                  >
                    <X className="size-3" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3 text-xs" side="top">
              <div className="flex items-center justify-between gap-2 border-b pb-1 mb-2">
                <span className="font-semibold text-sm text-foreground">{cond.nome}</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {cond.categoria}
                </Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-2">{cond.descricao}</p>
              <div className="bg-muted/60 p-2 rounded text-xs leading-tight text-foreground">
                <span className="font-semibold block mb-1 text-muted-foreground">Efeito Mecânico:</span>
                {cond.efeitoMecanico}
              </div>
              {podeEditar && (
                <div className="mt-2 pt-2 border-t flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive gap-1"
                    onClick={() => handleToggle(cond.id)}
                    disabled={salvandoId === cond.id}
                  >
                    <X className="size-4" />
                    Remover Condição
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        ))}

      </CarrosselBadges>

      {podeEditar && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-auto gap-1 border-dashed px-2 py-1 text-xs text-muted-foreground shrink-0"
              title="Adicionar ou alternar condição/debuff"
            >
              <Plus className="size-3" />
              Condição
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2" side="bottom" align="end">
            <SelectMultiplo
              rotulo="Condições de combate"
              placeholder="Selecionar condições"
              opcoes={opcoesCondicoes.map((c) => ({
                valor: c.id,
                rotulo: c.nome,
                detalhe: c.efeitoMecanico,
              }))}
              valores={condicoes}
              disabled={salvandoId !== null}
              onChange={async (novasCondicoes) => {
                const alteradas = [...new Set([...condicoes, ...novasCondicoes])]
                  .filter((id) => condicoes.includes(id) !== novasCondicoes.includes(id))
                try {
                  setSalvandoId('lote')
                  for (const id of alteradas) {
                    await onAlternarCondicao(participanteId, id)
                  }
                } finally {
                  setSalvandoId(null)
                }
              }}
            />
          </PopoverContent>
        </Popover>
      )}
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
    <CardCombate estado={part.estadoSaude?.estado} className="gap-0 py-0 flex flex-col rounded-lg border border-border/50 bg-card/30 text-xs text-muted-foreground overflow-hidden">
      {/* LINHA 1: IDENTIFICAÇÃO / CATEGORIA / DANO SE REVELADO */}
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

        {!part.vitalidadeOculta && part.danoVitalidade && (
          <div className="flex items-center gap-1 shrink-0 font-mono text-xs">
            <span className="text-dano-superficial font-bold">{part.danoVitalidade.superficial}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-destructive font-bold">{part.danoVitalidade.agravado}</span>
          </div>
        )}
      </div>

      {/* LINHA 2: ESTADO DE SAÚDE COMO CONDIÇÃO + OUTRAS CONDIÇÕES */}
      <div className="flex items-center gap-1 px-4 py-1 border-t border-border/40 bg-muted/10 min-w-0">
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
          ehVampiro={ehParticipanteVampiro(part)}
          condicoes={(part.condicoes ?? []).filter(
            (c) => !['morto', 'desacordado', 'incapacitado', 'torpor'].includes(c),
          )}
          podeEditar={false}
          onAlternarCondicao={async () => {}}
        />
      </div>
    </CardCombate>
  )
}

// ==========================================
// VISÃO DO JOGADOR
// ==========================================
function ListaParticipantes({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function VisaoJogador({ combate: entrada, publico = false, ContainerParticipantes = ListaParticipantes }: {
  combate: CombateVisivel | null
  publico?: boolean
  ContainerParticipantes?: ComponentType<{ children: ReactNode; indiceAtual?: number; participanteAtualId?: string }>
}) {
  // A exibição coletiva nunca herda os controles do dono de um Personagem.
  const combate = publico && entrada
    ? { ...entrada, participantes: entrada.participantes.map((p) => ({ ...p, ehMeu: false })) }
    : entrada
  const Conteiner = publico ? 'section' : 'main'
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
    <Conteiner className={publico ? undefined : "container-app mx-auto min-h-dvh"} aria-label="Combate">
      {!publico && <BarraApp />}
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
                  <Badge variant="outline" className="text-xs border-dano-superficial/70 bg-dano-superficial/10 text-dano-superficial font-semibold flex items-center gap-1">
                    <ArrowRight className="size-3" />
                    Próximo: {proximoParticipante.nome} {proximoParticipante.tipo === 'inimigo' ? '(Inimigo)' : ''}
                  </Badge>
                )}
                {ehMeuTurno && (
                  <Button
                    size="sm"
                    onClick={handlePassarMeuTurno}
                    disabled={passandoTurno}
                    className="gap-1 font-semibold bg-vinho hover:bg-vinho/90 text-primary-foreground ml-auto sm:ml-0"
                  >
                    <Play className="size-4 fill-current" />
                    {passandoTurno ? 'Passando...' : 'Concluir Meu Turno'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={alternarModoCompactoGeral}
                  className="gap-1 ml-auto sm:ml-0"
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
            <h2 className="font-serif text-2xl font-medium">{publico ? 'Nenhum Combate ativo' : 'Nenhum Combate em andamento'}</h2>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              {publico ? 'O Combate aparecerá aqui quando o Narrador iniciar a cena.' : 'Aguarde o Narrador iniciar a cena de conflito. Você será notificado quando seu Personagem entrar em combate.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ContainerParticipantes indiceAtual={participantesAtivos.findIndex((p) => p.id === participanteAtual?.id)} participanteAtualId={participanteAtual?.id}>
            {participantesAtivos.map((part, index) => {
              const ehTurnoAtual = combate ? part.id === combate.participantes[combate.turnoAtual]?.id : false
              const ehProximoTurno = combate && proximoIndex !== -1 ? part.id === combate.participantes[proximoIndex]?.id : false

              return (
                <div key={part.id} data-slide-combate="" role="group" aria-label={`Participante ${index + 1} de ${participantesAtivos.length}`}>
                  {estaMinimizado(part.id) ? (
                    /* MODO MINIMIZADO: FITA TÁTICA (3 LINHAS) - JOGADOR */
                    <CardCombate estado={part.estadoSaude?.estado}
                      className={cn(
                        'gap-0 py-0 flex flex-col rounded-xl border bg-card transition-all shadow-xs overflow-hidden',
                        ehTurnoAtual && 'border-2 border-vinho shadow-md bg-vinho/2',
                        ehProximoTurno && !ehTurnoAtual && 'border-2 border-dano-superficial/60 bg-dano-superficial/2',
                        !ehTurnoAtual && !ehProximoTurno && 'border-border/80 hover:border-border',
                      )}
                    >
                      {/* LINHA 1: IDENTIDADE / VEZ / ESTADO DE SAÚDE / MAXIMIZAR */}
                      <div className="flex items-start justify-between gap-3 px-4 py-2">
                        <div className="flex items-start gap-2 min-w-0">
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

                        {/* Direita: Dot de Saúde + Botão Maximizar */}
                        <div className="flex items-center gap-2 shrink-0 pt-1">
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
                            <Maximize2 className="size-4" />
                          </Button>
                        </div>
                      </div>

                      {/* LINHA 2: TRACKERS EM VALORES NUMÉRICOS (CARROSSEL DRAG-FREE) */}
                      <div className="flex items-center px-4 py-1 border-t border-border/40 bg-muted/5 min-w-0 text-xs">
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
                          <span className="text-xs text-muted-foreground italic px-1 py-1">
                            {part.condicaoOculta ? 'Condição oculta' : 'Condição indisponível'}
                          </span>
                        )}
                      </div>

                      {/* LINHA 3: CONDIÇÕES / DEBUFFS (JUSTIFY-BETWEEN) */}
                      <div className="flex items-center justify-between gap-3 px-4 py-1 bg-muted/20 border-t border-border/50 text-xs min-h-9">
                        <BadgesCondicoes
                          participanteId={part.id}
                          ehVampiro={ehParticipanteVampiro(part)}
                          condicoes={part.condicoes}
                          podeEditar={part.ehMeu === true}
                          onAlternarCondicao={handleAlternarCondicao}
                        />
                        {ehTurnoAtual && part.ehMeu && (
                          <Button
                            size="sm"
                            onClick={handlePassarMeuTurno}
                            disabled={passandoTurno}
                            className="h-7 text-xs gap-1 font-semibold bg-vinho hover:bg-vinho/90 text-primary-foreground shrink-0 ml-2 shadow-sm"
                          >
                            <Play className="size-3 fill-current" />
                            {passandoTurno ? 'Passando...' : 'Concluir Turno'}
                          </Button>
                        )}
                      </div>
                    </CardCombate>
                  ) : (
                    /* MODO MAXIMIZADO: CARD COMPLETO COM py-4 - JOGADOR */
                    <CardCombate estado={part.estadoSaude?.estado}
                      className={cn(
                        'py-4 transition-all duration-150',
                        ehTurnoAtual && 'border-2 border-vinho shadow-md bg-vinho/3',
                        ehProximoTurno && !ehTurnoAtual && 'border-2 border-dano-superficial/60 shadow-sm bg-dano-superficial/3',
                        !ehTurnoAtual && !ehProximoTurno && 'border border-border opacity-95',
                      )}
                    >
                      <CardHeader className="py-2 px-4 flex flex-row items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                          <div className="flex flex-wrap items-start gap-2 pt-1 min-w-0">
                            <CardTitle className="font-serif text-xl truncate leading-tight">{part.nome}</CardTitle>
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

                        <div className="flex items-center gap-1 shrink-0 pt-1">
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

                      <CardContent className="pt-1 pb-3 px-4 flex flex-col gap-2">
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
                                podeEditar={false}
                                onAlternarCondicao={handleAlternarCondicao}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {part.condicaoOculta ? (
                              <p className="text-xs text-muted-foreground italic">
                                {publico ? 'Condição oculta pelo Narrador.' : 'Condição oculta (não compartilhada na Coterie).'}
                              </p>
                            ) : part.condicao ? (
                              <div data-condicao-combate="" className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
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

                            <div className="flex items-center gap-1 pt-1 border-t min-w-0">
                              <span className="text-xs font-medium text-muted-foreground shrink-0">Condições:</span>
                              <BadgesCondicoes
                                participanteId={part.id}
                                ehVampiro={ehParticipanteVampiro(part)}
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
                              className="gap-1 font-semibold bg-vinho hover:bg-vinho/90 text-primary-foreground shadow-sm"
                            >
                              <Play className="size-4 fill-current" />
                              {passandoTurno ? 'Passando...' : 'Concluir Meu Turno'}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </CardCombate>
                  )}
                </div>
              )
            })}
            </ContainerParticipantes>

            {/* SEÇÃO INFERIOR: INIMIGOS FORA DE COMBATE (JOGADOR) */}
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
    </Conteiner>
  )
}
