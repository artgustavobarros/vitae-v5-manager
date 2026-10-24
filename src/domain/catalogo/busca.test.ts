import { describe, expect, it } from 'vitest'

import { casaBusca, normalizar } from './busca'

describe('busca do combobox', () => {
  it('ignora acento e caixa', () => {
    expect(normalizar('  Dominação ')).toBe('dominacao')
    expect(casaBusca('DOMINACAO', ['Dominação'])).toBe(true)
  })

  it('casa também o nome original', () => {
    expect(casaBusca('compel', ['Compelir', 'Compel'])).toBe(true)
    expect(casaBusca('xyz', ['Compelir', undefined])).toBe(false)
  })

  it('busca vazia casa tudo', () => {
    expect(casaBusca('  ', ['qualquer'])).toBe(true)
  })
})
