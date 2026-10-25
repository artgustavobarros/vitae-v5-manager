import useEmblaCarousel from 'embla-carousel-react'
import { Children, type ReactNode } from 'react'

import { cn } from 'cn'

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
export type CarrosselBadgesOptions = UseCarouselParameters[0]

export interface CarrosselBadgesProps {
  children: ReactNode
  className?: string
  options?: CarrosselBadgesOptions
}

/**
 * Carrossel horizontal livre (drag-free) para badges, pílulas e tags.
 * Quando os badges ultrapassam a largura do contêiner, permite arrastar suavemente com mouse ou toque.
 */
export function CarrosselBadges({
  children,
  className,
  options,
}: CarrosselBadgesProps) {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: 'trimSnaps',
    align: 'start',
    ...options,
  })

  return (
    <div
      ref={emblaRef}
      className={cn(
        'overflow-hidden w-full min-w-0 cursor-grab active:cursor-grabbing select-none',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 py-0.5">
        {Children.map(children, (child) => {
          if (!child) return null
          return <div className="shrink-0">{child}</div>
        })}
      </div>
    </div>
  )
}
