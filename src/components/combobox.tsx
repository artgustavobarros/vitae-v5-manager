import { cn } from 'cn'
import { Command as CommandPrimitive } from 'cmdk'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '#/components/ui/command'
import { Popover, PopoverAnchor, PopoverContent } from '#/components/ui/popover'
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
 * Combobox do app: input direto para digitação rápida com Popover + Command.
 * O usuário pode digitar diretamente no campo para filtrar e selecionar com clique ou Enter.
 */
export function Combobox({
  opcoes,
  valor,
  onChange,
  placeholder = 'Escolher',
  busca = 'Buscar...',
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
  const [focado, setFocado] = useState(false)
  const escolhida = opcoes.find((o) => o.valor === valor)
  const [textoInput, setTextoInput] = useState(escolhida?.rotulo ?? '')
  const [termo, setTermo] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincroniza com mudanças externas de `valor` quando o usuário não estiver digitando
  useEffect(() => {
    if (!focado) {
      setTextoInput(escolhida?.rotulo ?? '')
      setTermo('')
    }
  }, [valor, escolhida?.rotulo, focado])

  // Se o termo estiver vazio, mostra todas as opções; senão, filtra pelo texto digitado
  const visiveis =
    termo.trim() === ''
      ? opcoes
      : opcoes.filter((o) => casaBusca(termo, [o.rotulo, o.original]))

  const grupos: { titulo: string | undefined; opcoes: OpcaoCombobox[] }[] = []
  for (const opcao of visiveis) {
    const ultimo = grupos.at(-1)
    if (ultimo && ultimo.titulo === opcao.grupo) ultimo.opcoes.push(opcao)
    else grupos.push({ titulo: opcao.grupo, opcoes: [opcao] })
  }

  function selecionar(opcaoValor: string) {
    onChange(opcaoValor)
    const selecionada = opcoes.find((o) => o.valor === opcaoValor)
    setTextoInput(selecionada?.rotulo ?? '')
    setTermo('')
    setAberto(false)
    inputRef.current?.blur()
  }

  return (
    <div className={cn('relative w-full', className)}>
      <Command shouldFilter={false} className="overflow-visible bg-transparent">
        <Popover open={aberto} onOpenChange={setAberto}>
          <PopoverAnchor asChild>
            <div className="relative flex w-full items-center">
              <CommandPrimitive.Input
                ref={inputRef}
                id={id}
                role="combobox"
                aria-expanded={aberto}
                aria-label={rotulo}
                disabled={disabled}
                placeholder={escolhida?.rotulo ?? placeholder ?? busca}
                value={textoInput}
                onValueChange={(val) => {
                  setTextoInput(val)
                  setTermo(val)
                  if (!aberto) setAberto(true)
                }}
                onFocus={(e) => {
                  setFocado(true)
                  setAberto(true)
                  e.currentTarget.select()
                }}
                onBlur={() => {
                  setFocado(false)
                  setTextoInput(escolhida?.rotulo ?? '')
                  setTermo('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setAberto(false)
                    inputRef.current?.blur()
                  }
                }}
                className={cn(
                  'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-base shadow-xs outline-none transition-[color,box-shadow]',
                  'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
                  'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={aberto ? 'Fechar opções' : 'Abrir opções'}
                disabled={disabled}
                onClick={() => {
                  if (aberto) {
                    setAberto(false)
                  } else {
                    setAberto(true)
                    inputRef.current?.focus()
                  }
                }}
                className="absolute right-0 top-0 bottom-0 flex items-center px-2.5 text-muted-foreground hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronsUpDown className="size-4 opacity-50" />
              </button>
            </div>
          </PopoverAnchor>

          <PopoverContent
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
            className="w-[var(--radix-popover-trigger-width)] p-0"
          >
            <CommandList>
              <CommandEmpty>{vazio}</CommandEmpty>
              {grupos.map((grupo, i) => (
                <CommandGroup key={`${grupo.titulo ?? ''}-${i}`} heading={grupo.titulo}>
                  {grupo.opcoes.map((opcao) => (
                    <CommandItem
                      key={opcao.valor}
                      value={opcao.rotulo}
                      disabled={opcao.desabilitada}
                      onSelect={() => selecionar(opcao.valor)}
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
          </PopoverContent>
        </Popover>
      </Command>
    </div>
  )
}
