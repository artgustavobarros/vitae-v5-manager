import { useEffect, useRef, useState } from 'react'

import { Input } from '#/components/ui/input'

export interface InputNumeroProps
  extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value: number | undefined | null
  onChange: (valor: number) => void
  min?: number
  max?: number
  padrao?: number
}

/**
 * Input numérico sem setas nativas que permite ao usuário apagar completamente
 * o valor durante a edição sem travar no valor mínimo imediatamente.
 * Ao perder o foco (blur), se vazio ou inválido, restaura o padrão.
 */
export function InputNumero({
  value,
  onChange,
  min,
  max,
  padrao = 1,
  className,
  onBlur,
  onFocus,
  ...props
}: InputNumeroProps) {
  const [texto, setTexto] = useState<string>(
    value !== undefined && value !== null ? String(value) : '',
  )
  const focadoRef = useRef(false)

  useEffect(() => {
    if (!focadoRef.current) {
      setTexto(value !== undefined && value !== null ? String(value) : '')
    }
  }, [value])

  return (
    <Input
      type="number"
      min={min}
      max={max}
      value={texto}
      onFocus={(e) => {
        focadoRef.current = true
        onFocus?.(e)
      }}
      onChange={(e) => {
        const val = e.target.value
        setTexto(val)

        if (val.trim() === '') {
          // Permite campo vazio enquanto edita!
          return
        }

        const num = Number.parseInt(val, 10)
        if (!Number.isNaN(num)) {
          onChange(num)
        }
      }}
      onBlur={(e) => {
        focadoRef.current = false
        const textoTrim = texto.trim()

        if (textoTrim === '' || Number.isNaN(Number.parseInt(textoTrim, 10))) {
          const fallback = padrao ?? min ?? 1
          setTexto(String(fallback))
          onChange(fallback)
        } else {
          let num = Number.parseInt(textoTrim, 10)
          if (min !== undefined && num < min) num = min
          if (max !== undefined && num > max) num = max
          setTexto(String(num))
          onChange(num)
        }

        onBlur?.(e)
      }}
      className={className}
      {...props}
    />
  )
}
