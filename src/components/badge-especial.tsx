import { cn } from 'cn'

import { VisualizadorMarkdown } from '#/components/ui/editor-rich-text'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'

export type BadgeEspecialProps = {
  nome: string
  descricao?: string
  className?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

/**
 * Badge compartilhado com Popover de texto rico Markdown para exibir poderes e especiais de personagens ou antagonistas.
 */
export function BadgeEspecial({
  nome,
  descricao,
  className,
  side = 'top',
  align = 'center',
}: BadgeEspecialProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="secondary"
          asChild
          className={cn(
            'cursor-pointer hover:bg-secondary/80 transition-colors select-none font-medium',
            className,
          )}
        >
          <Button type="button" variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs">
            {nome}
          </Button>
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 max-h-64 overflow-y-auto p-3 text-xs"
        side={side}
        align={align}
      >
        <h4 className="font-semibold text-sm mb-2 text-foreground">{nome}</h4>
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
