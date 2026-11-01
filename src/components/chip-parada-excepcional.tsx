import { useState } from 'react'
import { Tag } from 'lucide-react'

import { separarEspecialidadeParada } from '#/domain/parada-excepcional'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'

export function ChipParadaExcepcional({ nome: nomeCompleto, valor }: { nome: string; valor: number }) {
  const { nome, especialidade } = separarEspecialidadeParada(nomeCompleto)
  const [aberto, setAberto] = useState(false)
  const [dica, setDica] = useState(false)
  const rotulo = <>{nome}: <span className="tabular-nums">{valor}</span></>

  if (!especialidade) return <Badge variant="secondary" className="max-w-full whitespace-normal px-2 py-1 text-xs">{rotulo}</Badge>

  return (
    <Tooltip open={!aberto && dica} onOpenChange={setDica}>
      <Popover open={aberto} onOpenChange={valor => { setAberto(valor); if (valor) setDica(false) }}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Badge asChild variant="secondary" className="max-w-full font-medium">
              <Button type="button" variant="ghost" size="sm" className="h-auto gap-1 whitespace-normal px-2 py-1 text-xs touch-manipulation" aria-label={`${nome}: ${valor}, com especialidade`}>
                <Tag className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />{rotulo}
              </Button>
            </Badge>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{especialidade}</TooltipContent>
        <PopoverContent className="w-72 p-3 text-sm" collisionPadding={16}>
          {especialidade}
        </PopoverContent>
      </Popover>
    </Tooltip>
  )
}
