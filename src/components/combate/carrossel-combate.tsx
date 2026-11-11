import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Children, useEffect, useState, type ReactNode } from 'react'

import { Button } from '#/components/ui/button'

import './card-combate.css'

export function CarrosselCombate({ children, indiceAtual, participanteAtualId, reordenando = false, onDeslocar }: {
  children: ReactNode
  indiceAtual?: number
  participanteAtualId?: string
  reordenando?: boolean
  onDeslocar?: () => void
}) {
  const total = Children.count(children)
  const [viewportRef, api] = useEmblaCarousel({
    align: 'start', containScroll: 'trimSnaps', loop: false,
    watchDrag: (_api, event) => !(event.target instanceof Element && event.target.closest(
      'button, a, input, textarea, [role="button"], [contenteditable="true"], [data-arrastar-participante], [data-carrossel-badges]',
    )),
  })
  const [limites, setLimites] = useState({ anterior: false, proximo: false })

  useEffect(() => {
    if (!api || !reordenando || !onDeslocar) return
    api.on('scroll', onDeslocar)
    return () => { api.off('scroll', onDeslocar) }
  }, [api, reordenando, onDeslocar])

  useEffect(() => {
    if (!api || reordenando || indiceAtual === undefined || indiceAtual < 0) return
    // Remover quem age pode trocar o participante sem mudar o índice.
    api.scrollTo(indiceAtual, window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [api, indiceAtual, participanteAtualId, reordenando])

  useEffect(() => {
    if (!api || !reordenando) return
    const viewport = api.rootNode()
    const documento = viewport.ownerDocument
    let ponteiro: { x: number; y: number } | undefined
    let ultimoAvanco = 0
    let quadro: number
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function acompanhar(evento: PointerEvent) {
      ponteiro = { x: evento.clientX, y: evento.clientY }
    }
    function parar() { ponteiro = undefined }
    function navegar(agora: number) {
      if (ponteiro && agora - ultimoAvanco >= 350) {
        const { left, right, top, bottom, width } = viewport.getBoundingClientRect()
        const margem = Math.min(48, width / 4)
        if (ponteiro.y >= top && ponteiro.y <= bottom && ponteiro.x >= left - margem && ponteiro.x <= right + margem) {
          if (ponteiro.x <= left + margem && api?.canScrollPrev()) {
            api.scrollPrev(semMovimento)
            ultimoAvanco = agora
          } else if (ponteiro.x >= right - margem && api?.canScrollNext()) {
            api.scrollNext(semMovimento)
            ultimoAvanco = agora
          }
        }
      }
      quadro = requestAnimationFrame(navegar)
    }

    // O Dnd não rola o viewport oculto do Embla; manter a alça na borda revela os próximos destinos.
    documento.addEventListener('pointermove', acompanhar, { passive: true })
    documento.addEventListener('pointerup', parar)
    documento.addEventListener('pointercancel', parar)
    quadro = requestAnimationFrame(navegar)
    return () => {
      cancelAnimationFrame(quadro)
      documento.removeEventListener('pointermove', acompanhar)
      documento.removeEventListener('pointerup', parar)
      documento.removeEventListener('pointercancel', parar)
    }
  }, [api, reordenando])

  useEffect(() => {
    if (!api) return
    function atualizar() {
      if (api) setLimites({ anterior: api.canScrollPrev(), proximo: api.canScrollNext() })
    }
    atualizar()
    api.on('select', atualizar)
    api.on('reInit', atualizar)
    return () => {
      api.off('select', atualizar)
      api.off('reInit', atualizar)
    }
  }, [api])

  function mover(direcao: 'anterior' | 'proximo') {
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (direcao === 'anterior') api?.scrollPrev(semMovimento)
    else api?.scrollNext(semMovimento)
  }

  return <section className="carrossel-combate min-w-0 space-y-3" aria-label="Participantes do Combate"
    aria-roledescription="carrossel" tabIndex={0}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget) return
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        mover(event.key === 'ArrowLeft' ? 'anterior' : 'proximo')
      }
    }}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{total} {total === 1 ? 'participante' : 'participantes'}{total > 1 && ' · Arraste para navegar'}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" className="size-11" aria-label="Participante anterior"
          disabled={!limites.anterior} onClick={() => mover('anterior')}><ArrowLeft className="size-4" /></Button>
        <Button variant="outline" size="icon" className="size-11" aria-label="Próximo participante"
          disabled={!limites.proximo} onClick={() => mover('proximo')}><ArrowRight className="size-4" /></Button>
      </div>
    </div>
    <div ref={viewportRef} className="overflow-hidden touch-pan-y touch-pinch-zoom">
      <div className="-ml-4 flex items-stretch">
        {children}
      </div>
    </div>
  </section>
}
