import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '#/components/ui/button'
import { TabsList, TabsTrigger } from '#/components/ui/tabs'
import type { EfeitoRelogio } from '#/domain/relogios'

export function AbasEfeitosRelogio({ efeitos, selecionado, ocupado }: {
  efeitos: EfeitoRelogio[]; selecionado: string | undefined; ocupado: boolean
}) {
  const faixaRef = useRef<HTMLDivElement>(null)
  const listaRef = useRef<HTMLDivElement>(null)
  const [rolagem, setRolagem] = useState({ excede: false, anterior: false, proximo: false })

  useEffect(() => {
    const faixa = faixaRef.current
    const lista = listaRef.current
    if (!faixa || !lista) return
    function atualizar() {
      if (!faixa || !lista) return
      setRolagem({
        excede: lista.scrollWidth > faixa.clientWidth + 1,
        anterior: lista.scrollLeft > 1,
        proximo: lista.scrollLeft + lista.clientWidth < lista.scrollWidth - 1,
      })
    }
    const observador = new ResizeObserver(atualizar)
    observador.observe(faixa)
    observador.observe(lista)
    lista.addEventListener('scroll', atualizar, { passive: true })
    atualizar()
    return () => { observador.disconnect(); lista.removeEventListener('scroll', atualizar) }
  }, [efeitos.length])

  useEffect(() => {
    const lista = listaRef.current
    if (!lista) return
    function mostrarSelecionado() {
      lista?.querySelector('[data-state="active"]')?.scrollIntoView({
        block: 'nearest', inline: 'nearest', behavior: 'instant',
      })
    }
    const observador = new ResizeObserver(mostrarSelecionado)
    observador.observe(lista)
    mostrarSelecionado()
    return () => observador.disconnect()
  }, [selecionado])

  function percorrer(direcao: number) {
    const lista = listaRef.current
    if (lista) lista.scrollBy({ left: direcao * lista.clientWidth })
  }

  return (
    <div ref={faixaRef} className="flex min-w-0 items-center gap-2">
      <Button type="button" variant="outline" size="icon-lg" className="shrink-0" hidden={!rolagem.excede}
        aria-label="Ver efeitos anteriores" disabled={ocupado || !rolagem.anterior} onClick={() => percorrer(-1)}>
        <ChevronLeft />
      </Button>
      <TabsList ref={listaRef} aria-label="Efeitos do Relógio"
        className="w-full min-w-0 flex-nowrap justify-start gap-2 overflow-x-auto overscroll-x-contain scroll-smooth scroll-px-2 snap-x snap-proximity p-2 motion-reduce:scroll-auto group-data-[orientation=horizontal]/tabs:h-auto">
        {efeitos.map((efeito, indice) => (
          <TabsTrigger key={efeito.id} value={efeito.id} disabled={ocupado} className="h-12 flex-none snap-start select-none px-4 text-base">
            Efeito {indice + 1}
          </TabsTrigger>
        ))}
      </TabsList>
      <Button type="button" variant="outline" size="icon-lg" className="shrink-0" hidden={!rolagem.excede}
        aria-label="Ver próximos efeitos" disabled={ocupado || !rolagem.proximo} onClick={() => percorrer(1)}>
        <ChevronRight />
      </Button>
    </div>
  )
}
