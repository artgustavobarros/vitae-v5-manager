import { describe, expect, it } from 'vitest'

import { estadoConvite, validarNomeUsuario } from './convite'

describe('estadoConvite', () => {
  it('convite que não existe (ou foi cancelado) é inexistente', () => {
    expect(estadoConvite(undefined)).toBe('inexistente')
  })

  it('convite sem uso é válido', () => {
    expect(estadoConvite({ usadoEm: null })).toBe('valido')
  })

  it('convite já usado num cadastro não vale de novo', () => {
    expect(estadoConvite({ usadoEm: new Date('2026-10-23T21:00:00') })).toBe('usado')
  })
})

describe('validarNomeUsuario', () => {
  it('aceita letras, números, ponto e sublinhado', () => {
    expect(validarNomeUsuario('helena.s_2')).toBeNull()
    expect(validarNomeUsuario('Rui')).toBeNull()
  })

  it('recusa menos de 3 ou mais de 30 caracteres', () => {
    expect(validarNomeUsuario('ab')).not.toBeNull()
    expect(validarNomeUsuario('a'.repeat(31))).not.toBeNull()
  })

  it('recusa espaço, acento e outros símbolos', () => {
    expect(validarNomeUsuario('helena sarmento')).not.toBeNull()
    expect(validarNomeUsuario('joão')).not.toBeNull()
    expect(validarNomeUsuario('rui@mesa')).not.toBeNull()
  })
})
