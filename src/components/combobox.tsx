import { cn } from 'cn'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { casaBusca } from '#/domain/catalogo/busca'

export type OpcaoCombobox = {
  valor: string
  rotulo: string
  /** Nome em inglês: aparece entre parênteses e também casa na busca. */
  original?: string
  /** Descrição curta, mostrada no próprio seletor. */
  descricao?: string
  /** Regra quebrada (aviso para o Narrador) ou motivo do bloqueio (Jogador). */
  aviso?: string
  desabilitada?: boolean
  /** Opções com o mesmo grupo ficam juntas, sob esse título (ex.: "Nível 1"). */
  grupo?: string
}

/**
 * Todo select do app: shadcn Popover + Command, com busca que ignora acento e caixa
 * e casa também o nome original em inglês.
 */
export function Combobox({
  opcoes,
  valor,
  onChange,
  placeholder = 'Escolher',
  busca = 'Buscar',
  vazio = 'Nada encontrado.',
  id,
  rotulo,
  disabled = false,
  className,
}: {
  opcoes: readonly OpcaoCombobox[]
  /** null mostra o placeholder; num seletor de "Adicionar", fica sempre null. */
  valor: string | null
  onChange: (valor: string) => void
  placeholder?: string
  busca?: string
  vazio?: string
  id?: string
  /** aria-label do gatilho, quando não há Label ligado pelo id. */
  rotulo?: string
  disabled?: boolean
  className?: string
}) {
  const [aberto, setAberto] = useState(false)
  const [termo, setTermo] = useState('')
  const escolhida = opcoes.find((o) => o.valor === valor)
  const visiveis = opcoes.filter((o) => casaBusca(termo, [o.rotulo, o.original]))

  const grupos: { titulo: string | undefined; opcoes: OpcaoCombobox[] }[] = []
  for (const opcao of visiveis) {
    const ultimo = grupos.at(-1)
    if (ultimo && ultimo.titulo === opcao.grupo) ultimo.opcoes.push(opcao)
    else grupos.push({ titulo: opcao.grupo, opcoes: [opcao] })
  }

  return (
    <Popover
      open={aberto}
      onOpenChange={(abrir) => {
        setAberto(abrir)
        if (!abrir) setTermo('')
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={aberto}
          aria-label={rotulo}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', className)}
        >
          <span className={cn('truncate', !escolhida && 'text-muted-foreground')}>
            {escolhida?.rotulo ?? placeholder}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={busca} value={termo} onValueChange={setTermo} />
          <CommandList>
            <CommandEmpty>{vazio}</CommandEmpty>
            {grupos.map((grupo, i) => (
              <CommandGroup key={`${grupo.titulo ?? ''}-${i}`} heading={grupo.titulo}>
                {grupo.opcoes.map((opcao) => (
                  <CommandItem
                    key={opcao.valor}
                    value={opcao.valor}
                    disabled={opcao.desabilitada}
                    onSelect={() => {
                      onChange(opcao.valor)
                      setAberto(false)
                      setTermo('')
                    }}
                    className="items-start"
                  >
                    <Check className={cn('mt-1', opcao.valor === valor ? 'opacity-100' : 'opacity-0')} />
                    <div className="flex flex-col gap-1">
                      <span>
                        {opcao.rotulo}
                        {opcao.original && opcao.original !== opcao.rotulo && (
                          <span className="text-muted-foreground"> ({opcao.original})</span>
                        )}
                      </span>
                      {opcao.descricao && <span className="text-xs text-muted-foreground">{opcao.descricao}</span>}
                      {opcao.aviso && <span className="text-xs text-vinho">{opcao.aviso}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
