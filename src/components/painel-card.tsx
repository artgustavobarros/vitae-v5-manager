import { Link } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { TrilhaDano, TrilhaFome } from '#/components/ficha/estado'
import { Bolinha, GlifoDano } from '#/components/ficha/marcadores'
import { Card } from '#/components/ui/card'
import type { Condicao } from '#/domain/condicao'
import type { Marcas } from '#/domain/ficha'
import { caixasDano, MAX_FOME, type Dano } from '#/domain/trilhas'
import { marcar } from '#/server/personagens'

export type DadosCardPainel = {
  id: string
  nome: string
  jogador?: string | null
  coteries: string[]
  condicao: Condicao | null
  humanidade?: number
  manchas?: number
  ehMeu?: boolean
  compartilhaCondicao?: boolean
}

type MarcasCondicao = Pick<Marcas, 'danoVitalidade' | 'danoVontade' | 'fome'>

/**
 * Card de Personagem no Painel e nas Coteries. Só o nome leva à Ficha.
 * Com `editavel`, a Condição usa as mesmas trilhas tocáveis da Ficha e salva no toque.
 */
export function PainelCard({ item, editavel = false }: { item: DadosCardPainel; editavel?: boolean }) {
  const naoCompartilhada = item.ehMeu && item.compartilhaCondicao === false

  return (
    <Card className="gap-2 rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-serif text-xl leading-tight text-foreground">
            <Link
              to="/personagens/$id"
              params={{ id: item.id }}
              className="rounded-xs outline-none hover:text-vinho focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.nome}
            </Link>
            {item.ehMeu && <span className="ml-2 font-sans text-xs font-normal text-muted-foreground">· seu</span>}
          </h2>
          {item.coteries.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">{item.coteries.join(' · ')}</p>
          )}
        </div>
        {item.jogador && <span className="shrink-0 text-xs font-medium text-muted-foreground">{item.jogador}</span>}
      </div>

      {!item.condicao ? (
        <div className="pt-2 text-xs text-muted-foreground italic">Condição: oculta</div>
      ) : editavel ? (
        <>
          <CondicaoEditavel
            // Dados novos do servidor (tempo real) recomeçam as marcas locais, como na Ficha.
            key={JSON.stringify(item.condicao)}
            id={item.id}
            condicao={item.condicao}
          />
          {(item.humanidade !== undefined || naoCompartilhada) && (
            <p className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              {item.humanidade !== undefined && (
                <span>
                  <TextoHumanidade humanidade={item.humanidade} manchas={item.manchas} />
                </span>
              )}
              {naoCompartilhada && <span className="italic">(não compartilhada)</span>}
            </p>
          )}
        </>
      ) : (
        <CondicaoLeitura
          condicao={item.condicao}
          humanidade={item.humanidade}
          manchas={item.manchas}
          naoCompartilhada={naoCompartilhada}
        />
      )}
    </Card>
  )
}

/** A marca aparece na hora e volta se o servidor recusar. */
function CondicaoEditavel({ id, condicao }: { id: string; condicao: Condicao }) {
  const [marcas, setMarcas] = useState<MarcasCondicao>({
    danoVitalidade: condicao.danoVitalidade,
    danoVontade: condicao.danoVontade,
    fome: condicao.fome,
  })

  // Só a resposta do toque mais recente vale; as anteriores chegam desatualizadas.
  const ultimoToque = useRef(0)

  async function salvar(mudanca: Partial<MarcasCondicao>) {
    const anteriores = marcas
    const toque = ++ultimoToque.current
    setMarcas({ ...marcas, ...mudanca })
    try {
      const { danoVitalidade, danoVontade, fome } = await marcar({ data: { id, marcas: mudanca } })
      if (toque === ultimoToque.current) setMarcas({ danoVitalidade, danoVontade, fome })
    } catch {
      if (toque === ultimoToque.current) setMarcas(anteriores)
      toast.error('Não deu para salvar a marca. Tente de novo.')
    }
  }

  return (
    <div className="divide-y border-t">
      <TrilhaDano
        rotulo="Vitalidade"
        dano={marcas.danoVitalidade}
        max={condicao.vitalidadeMax}
        onChange={(danoVitalidade) => salvar({ danoVitalidade })}
      />
      <TrilhaDano
        rotulo="Força de Vontade"
        dano={marcas.danoVontade}
        max={condicao.vontadeMax}
        onChange={(danoVontade) => salvar({ danoVontade })}
      />
      <TrilhaFome fome={marcas.fome} onChange={(fome) => salvar({ fome })} />
    </div>
  )
}

function CondicaoLeitura({
  condicao,
  humanidade,
  manchas,
  naoCompartilhada,
}: {
  condicao: Condicao
  humanidade?: number
  manchas?: number
  naoCompartilhada?: boolean
}) {
  return (
    <div className="flex flex-col gap-2 pt-1 text-xs">
      <LinhaDanoLeitura rotulo="Vitalidade" dano={condicao.danoVitalidade} max={condicao.vitalidadeMax} />
      <LinhaDanoLeitura rotulo="Vontade" dano={condicao.danoVontade} max={condicao.vontadeMax} />

      {/* Fome e Humanidade */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-1">
        <div className="flex items-center gap-2">
          <span className={ROTULO}>Fome</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: MAX_FOME }, (_, i) => (
              <Bolinha key={i} cheia={i < condicao.fome} cor="vinho" />
            ))}
          </div>
        </div>

        {humanidade !== undefined && (
          <span className="text-muted-foreground">
            <TextoHumanidade humanidade={humanidade} manchas={manchas} />
          </span>
        )}

        {naoCompartilhada && <span className="text-xs text-muted-foreground italic">(não compartilhada)</span>}
      </div>
    </div>
  )
}

/** Coluna de rótulo larga o bastante para "Vitalidade" por extenso; as caixas ficam alinhadas à direita dela. */
const ROTULO = 'w-20 shrink-0 text-muted-foreground'

function TextoHumanidade({ humanidade, manchas }: { humanidade: number; manchas?: number }) {
  return (
    <>
      Humanidade {humanidade}
      {manchas !== undefined && manchas > 0 && ` · ${manchas} ${manchas === 1 ? 'Mancha' : 'Manchas'}`}
    </>
  )
}

function LinhaDanoLeitura({ rotulo, dano, max }: { rotulo: string; dano: Dano; max: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={ROTULO}>{rotulo}</span>
      <div className="flex flex-wrap items-center gap-1">
        {caixasDano(dano, max).map((c, i) => (
          <GlifoDano key={i} estado={c} pequeno />
        ))}
      </div>
    </div>
  )
}
