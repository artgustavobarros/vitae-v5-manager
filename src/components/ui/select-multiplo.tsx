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

export type OpcaoSelectMultiplo = {
  valor: string
  rotulo: string
  detalhe?: string
  desabilitado?: boolean
}

/**
 * Seletor múltiplo do app no formato novo de Combobox:
 * input direto para digitação rápida com PopoverAnchor + Command + ChevronsUpDown.
 * Permite selecionar vários itens com checkboxes customizados e busca instantânea.
 */
export function SelectMultiplo({
  opcoes,
  valores,
  onChange,
  placeholder = 'Selecionar...',
  busca = 'Buscar...',
  vazio = 'Nada encontrado.',
  id,
  rotulo,
  className,
  disabled = false,
}: {
  opcoes: readonly OpcaoSelectMultiplo[]
  valores: string[]
  onChange: (valores: string[]) => void
  placeholder?: string
  busca?: string
  vazio?: string
  id?: string
  rotulo?: string
  className?: string
  disabled?: boolean
}) {
  const [aberto, setAberto] = useState(false)
  const [focado, setFocado] = useState(false)
  const [termo, setTermo] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const selecionadosOpcoes = opcoes.filter((o) => valores.includes(o.valor))

  const textoDisplay =
    valores.length === 0
      ? placeholder
      : valores.length === 1
        ? selecionadosOpcoes[0]?.rotulo ?? `${valores.length} selecionado`
        : `${valores.length} selecionados: ${selecionadosOpcoes.map((o) => o.rotulo).join(', ')}`

  const [textoInput, setTextoInput] = useState(valores.length > 0 ? textoDisplay : '')

  useEffect(() => {
    if (!focado) {
      setTextoInput(valores.length > 0 ? textoDisplay : '')
      setTermo('')
    }
  }, [valores, textoDisplay, focado])

  function alternarOpcao(valor: string) {
    if (valores.includes(valor)) {
      onChange(valores.filter((v) => v !== valor))
    } else {
      onChange([...valores, valor])
    }
  }

  function selecionarTodos() {
    const habilitados = opcoes.filter((o) => !o.desabilitado).map((o) => o.valor)
    onChange(habilitados)
  }

  function limpar() {
    onChange([])
  }

  const visiveis =
    termo.trim() === ''
      ? opcoes
      : opcoes.filter((o) => casaBusca(termo, [o.rotulo, o.detalhe]))

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
                placeholder={textoDisplay || placeholder || busca}
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
                  setTextoInput(valores.length > 0 ? textoDisplay : '')
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
            className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0"
          >
            {opcoes.length > 1 && (
              <div className="flex items-center justify-between px-3 py-1.5 text-xs border-b text-muted-foreground bg-muted/30">
                <button
                  type="button"
                  onClick={selecionarTodos}
                  className="hover:text-foreground cursor-pointer font-medium"
                >
                  Selecionar todos
                </button>
                <button
                  type="button"
                  onClick={limpar}
                  className="hover:text-foreground cursor-pointer font-medium"
                >
                  Limpar
                </button>
              </div>
            )}

            <CommandList className="max-h-60 overflow-y-auto p-1">
              <CommandEmpty>{vazio}</CommandEmpty>
              <CommandGroup>
                {visiveis.map((opcao) => {
                  const selecionado = valores.includes(opcao.valor)
                  return (
                    <CommandItem
                      key={opcao.valor}
                      value={opcao.rotulo}
                      disabled={opcao.desabilitado}
                      onSelect={() => alternarOpcao(opcao.valor)}
                      className="items-start py-2 cursor-pointer"
                    >
                      <div
                        className={cn(
                          'mr-2 mt-0.5 flex size-4 items-center justify-center rounded border transition-colors shrink-0',
                          selecionado
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/40 bg-transparent',
                        )}
                      >
                        <Check
                          className={cn('size-3', selecionado ? 'opacity-100' : 'opacity-0')}
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate font-medium">{opcao.rotulo}</span>
                        {opcao.detalhe && (
                          <span className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                            {opcao.detalhe}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </PopoverContent>
        </Popover>
      </Command>
    </div>
  )
}
