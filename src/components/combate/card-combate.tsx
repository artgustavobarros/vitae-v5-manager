import type { ComponentProps } from 'react'

import { Card } from '#/components/ui/card'
import type { EstadoSaude } from '#/domain/combate'
import { cn } from '#/lib/utils'

import './card-combate.css'

/** A aparência usa apenas o estado de saúde já autorizado, nunca uma trilha oculta. */
export function CardCombate({ estado, className, children, ...props }: ComponentProps<typeof Card> & { estado?: EstadoSaude }) {
  return <Card {...props} data-ferimento={estado} className={cn('card-combate-ferimento relative isolate overflow-hidden', className)}>
    {children}
  </Card>
}
