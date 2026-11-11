import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'

import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import type { CaixaDano } from '#/domain/trilhas'
import { cn } from '#/lib/utils'

export type FormatoTalisma = 'original' | 'cortejo' | 'altar'

type Props = {
  nome: string
  descricao: string
  tipo: 'relogio' | 'vitalidade'
  caixas: CaixaDano[]
  oculto?: boolean
  destaque?: string
  formato?: FormatoTalisma
  escala?: 'normal' | 'destaque'
  onMarcar?: (indice: number) => void
  onDesfazer?: () => void
}

const papel = 'M4 4 23 2 44 5 65 1 90 4 116 2 114 108 118 211 115 304 118 473 95 478 66 474 43 479 20 475 3 478 5 352 1 251 4 157Z'
const corte = 'M0 26 19 11 34 9 53-3 67-4 120-28 107-8 89-7 77 3 59 4 43 15 27 16 14 29 9 19Z'
const corteOposto = 'M0-26 19-11 34-9 53 3 67 4 120 28 107 8 89 7 77-3 59-4 43-15 27-16 14-29 9-19Z'
const ruptura = 'M0 445 16 449 24 440 37 449 49 444 62 453 75 442 88 449 101 442 120 447V460L101 453 88 460 75 453 62 464 49 455 37 460 24 451 16 461 0 455Z'

function Rasgos({ caixa, indice, total, mascara = false }: { caixa: CaixaDano; indice: number; total: number; mascara?: boolean }) {
  const y = 108 + (indice + 0.5) * 320 / total
  return <g transform={`translate(0 ${y})`} data-marca={mascara ? undefined : caixa}>
    {caixa === 'vazio' ? (!mascara && <path d="M52 0h16" stroke="var(--background)" opacity="0.3" />) : <>
      <path d={corte} data-rasgo={mascara ? 'superficial' : undefined} />
      {caixa === 'agravado' && <path d={corteOposto} data-rasgo={mascara ? 'agravado' : undefined} />}
      {!mascara && <path d="m28 5 3 7m17-13 3-7m35-2 2 6" stroke="var(--foreground)" strokeWidth="1" />}
    </>}
  </g>
}

function PapelRasgado({ caixas, oculto, completo }: Pick<Props, 'caixas' | 'oculto'> & { completo: boolean }) {
  const mascaraId = useId()
  return <svg viewBox="0 0 120 480" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
    {!oculto && <defs><mask id={mascaraId} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="480">
      <path d={papel} fill="white" />
      <g fill="black">{caixas.map((caixa, indice) => <Rasgos key={indice} caixa={caixa} indice={indice} total={caixas.length} mascara />)}
        {completo && <path d={ruptura} />}
      </g>
    </mask></defs>}
    <g mask={oculto ? undefined : `url(#${mascaraId})`}>
      <path d={papel} fill="var(--foreground)" />
      <path d="m18 0 8 100-12 75 20 108-16 100 8 97M82 0l-10 84 18 107-15 114 21 100-10 75M0 153l48 20 72-34M0 338l64-20 56 35"
        fill="none" stroke="var(--background)" opacity="0.12" />
    </g>
    {!oculto && <g fill="none" stroke="var(--vinho)" strokeWidth="4" strokeLinejoin="bevel">
      {caixas.map((caixa, indice) => <Rasgos key={indice} caixa={caixa} indice={indice} total={caixas.length} />)}
      {completo && <path d={ruptura} strokeWidth="2" />}
    </g>}
    <path d="M46 36h28M60 22v28m-16 10 16 22 16-22" fill="none" stroke="var(--background)" strokeWidth="2" opacity="0.6" />
  </svg>
}

function DetalhesTalisma({ nome, descricao, tipo, caixas, oculto, destaque, formato = 'original', escala, onMarcar, onDesfazer, atual, completo, editavel }: Props & { atual: number; completo: boolean; editavel: boolean }) {
  const suspenso = formato !== 'original'
  return <CardContent className={cn('min-w-0 space-y-3 px-0', suspenso ? 'w-full' : 'flex-1 pt-12')}>
    {destaque && <p className="text-sm font-medium text-fome">{destaque}</p>}
    <h3 className={cn('break-words font-serif', escala === 'destaque' ? 'text-2xl' : 'text-xl')}>{nome}</h3>
    <p className="break-words text-sm text-muted-foreground">{descricao}</p>
    {oculto ? <p className="text-sm text-muted-foreground">Vitalidade oculta</p> : <>
      <p className="text-sm tabular-nums" role="status">{atual} de {caixas.length} {tipo === 'relogio' ? 'etapas' : 'caixas preenchidas'}{completo ? ' · No limite' : ''}</p>
      {editavel && <div className={cn('flex flex-wrap gap-2', suspenso && 'justify-center')}>
        {onDesfazer && <Button variant="outline" className="size-11 touch-manipulation" disabled={atual === 0}
          onClick={onDesfazer} aria-label={`Desfazer marca de ${nome}`}><Minus className="size-4" /></Button>}
        {tipo === 'relogio' && <Button variant="outline" className="size-11 touch-manipulation" disabled={completo}
          onClick={() => onMarcar?.(0)} aria-label={`Avançar ${nome}`}><Plus className="size-4" /></Button>}
      </div>}
    </>}
  </CardContent>
}

/** Estudo visual independente: sem regras de CAIN nem acesso ao servidor. */
export function Talisma(props: Props) {
  const { nome, tipo, caixas, oculto = false, formato = 'original', escala = 'normal', onMarcar, onDesfazer } = props
  const atual = caixas.filter((caixa) => caixa !== 'vazio').length
  const completo = caixas.length > 0 && atual === caixas.length
  const editavel = Boolean(onMarcar) && !oculto
  const integridade = completo ? 'rompido' : atual === 0 ? 'intacto' : atual / caixas.length >= 0.5 ? 'fendido' : 'cortado'
  const suspenso = formato !== 'original'
  const detalhes = <DetalhesTalisma {...props} atual={atual} completo={completo} editavel={editavel} />

  return <Card className={cn('items-start gap-5 rounded-none border-0 bg-transparent p-0 text-foreground',
    suspenso ? 'items-center text-center' : 'flex-row')} aria-label={nome}>
    {suspenso && detalhes}
    <div className={cn('relative mt-8 shrink-0', escala === 'destaque' ? 'h-128 w-40' : 'h-116 w-28')}
      data-integridade={oculto ? undefined : integridade}>
      {/* Papel e selo desenhados para o Vitae; nenhuma arte da referência é reutilizada. */}
      <PapelRasgado caixas={caixas} oculto={oculto} completo={completo} />
      <svg viewBox="0 0 48 48" className="pointer-events-none absolute -top-8 left-1/2 size-12 -translate-x-1/2 text-muted-foreground" aria-hidden="true">
        <circle cx="24" cy="22" r="16" fill="var(--card)" stroke="currentColor" />
        <path d="m14 15 10 23 10-23M24 1v12M3 22h12M33 22h12" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      {oculto ? <span className="absolute inset-x-0 top-20 text-center text-2xl text-background" aria-hidden="true">?</span> : <>
        <span className="absolute inset-x-0 top-20 text-center text-2xl font-semibold tabular-nums text-vinho" aria-hidden="true">
          {atual}<span className="px-1 text-base text-background/60">/</span><span className="text-base">{caixas.length}</span>
        </span>
        <meter className="sr-only" min={0} max={Math.max(1, caixas.length)} value={atual} aria-label={`${nome}: ${atual} de ${caixas.length}`}>
          {atual} de {caixas.length}
        </meter>
        {editavel && caixas.map((caixa, indice) => <Button key={indice} variant="ghost"
            className="absolute left-0 min-h-11 w-full touch-manipulation select-none rounded-none p-0 hover:bg-background/10 focus-visible:ring-background active:bg-background/15"
            style={{ top: `${(108 + indice * 320 / caixas.length) / 480 * 100}%`, height: `${320 / caixas.length / 480 * 100}%` }}
            aria-label={tipo === 'relogio' ? `Marcar uma etapa em ${nome}` : `${nome}: posição ${indice + 1}, ${caixa}`}
            onClick={() => onMarcar?.(indice)}
            onContextMenu={(evento) => { if (onDesfazer) { evento.preventDefault(); onDesfazer() } }}>
          </Button>)}
      </>}
    </div>
    {!suspenso && detalhes}
  </Card>
}
