import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { Combobox } from '#/components/combobox'
import { TermoRegra } from '#/components/consulta-regra'
import { CamposVantagens, ListaVantagens } from '#/components/ficha/catalogo'
import { Button } from '#/components/ui/button'
import { tipoCoterie, TIPOS_COTERIE, VANTAGENS_COTERIE_DISPONIVEIS } from '#/domain/catalogo/index'
import type { CatalogoCoterie } from '#/domain/coterie'
import { salvarCatalogoCoterie } from '#/server/coteries'

const SEM_TIPO = 'sem-tipo'

/**
 * Tipo de Coterie e Vantagens e Defeitos da Coterie. Só o Narrador edita, sem conta de pontos;
 * os membros só leem. O Tipo é descritivo: mostra o Domínio e as Vantagens sugeridas, sem aplicar nada.
 */
export function CatalogoDaCoterie({
  id,
  inicial,
  ehNarrador,
}: {
  id: string
  inicial: CatalogoCoterie
  ehNarrador: boolean
}) {
  const router = useRouter()
  const [catalogo, setCatalogo] = useState(inicial)
  const [alterado, setAlterado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const tipo = catalogo.tipo ? tipoCoterie(catalogo.tipo) : null

  async function salvar(novo: CatalogoCoterie) {
    setSalvando(true)
    try {
      await salvarCatalogoCoterie({ data: { id, catalogo: novo } })
      setAlterado(false)
      router.invalidate()
    } catch {
      toast.error('Não foi possível salvar. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  function mudar(parcial: Partial<CatalogoCoterie>) {
    setCatalogo((atual) => ({ ...atual, ...parcial }))
    setAlterado(true)
  }

  return (
    <>
      <section className="flex flex-col gap-3 border-t pt-4">
        <h2 className="font-serif text-2xl">Tipo de Coterie</h2>
        {ehNarrador && (
          <Combobox
            rotulo="Tipo de Coterie"
            opcoes={[
              { valor: SEM_TIPO, rotulo: 'Sem Tipo' },
              ...TIPOS_COTERIE.map((t) => ({
                valor: t.id,
                rotulo: t.nome,
                original: t.nomeOriginal,
                descricao: t.descricao,
              })),
            ]}
            valor={catalogo.tipo ?? SEM_TIPO}
            onChange={(v) => {
              const novo = { ...catalogo, tipo: v === SEM_TIPO ? null : v }
              setCatalogo(novo)
              salvar(novo)
            }}
            busca="Buscar Tipo"
            disabled={salvando}
          />
        )}
        {catalogo.tipo && !tipo && <p className="text-sm text-vinho">Item removido do Catálogo</p>}
        {tipo && (
          <div className="flex flex-col gap-1 text-sm">
            <TermoRegra tipo="catalogo" id={tipo.id} className="self-start">
              {tipo.nome}
            </TermoRegra>
            <p className="text-muted-foreground">{tipo.descricao}</p>
            <p>
              <span className="text-muted-foreground">Domínio sugerido: </span>
              {tipo.dominio}
            </p>
            <p>
              <span className="text-muted-foreground">Vantagens sugeridas: </span>
              {tipo.vantagensSugeridas}
            </p>
          </div>
        )}
        {!catalogo.tipo && !ehNarrador && <p className="text-sm text-muted-foreground">Sem Tipo.</p>}
      </section>

      <section className="flex flex-col gap-4 border-t pt-4">
        <h2 className="font-serif text-2xl">Vantagens e Defeitos</h2>
        {ehNarrador ? (
          <>
            <CamposVantagens
              escolhidas={catalogo.vantagens}
              tipo="vantagem"
              catalogo={VANTAGENS_COTERIE_DISPONIVEIS}
              regras={false}
              onChange={(vantagens) => mudar({ vantagens })}
            />
            <CamposVantagens
              escolhidas={catalogo.defeitos}
              tipo="defeito"
              catalogo={VANTAGENS_COTERIE_DISPONIVEIS}
              regras={false}
              onChange={(defeitos) => mudar({ defeitos })}
            />
            {alterado && (
              <Button className="self-start" disabled={salvando} onClick={() => salvar(catalogo)}>
                Salvar Vantagens e Defeitos
              </Button>
            )}
          </>
        ) : (
          <>
            <ListaVantagens titulo="Vantagens" escolhidas={catalogo.vantagens} />
            <ListaVantagens titulo="Defeitos" escolhidas={catalogo.defeitos} />
          </>
        )}
      </section>
    </>
  )
}
