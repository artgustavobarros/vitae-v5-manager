import { describe, expect, it } from 'vitest'

import { revisaoModeloSchema, validarConclusaoBestiario } from './revisao-bestiario'

describe('Revisão do Bestiário', () => {
  it('só permite concluir quando todos os Modelos têm uma decisão', () => {
    expect(() => validarConclusaoBestiario(['aprovado', 'rejeitado'])).not.toThrow()
    expect(() => validarConclusaoBestiario(['aprovado', 'pendente'])).toThrow('1 Modelo')
    expect(() => validarConclusaoBestiario(['corrigir', 'pendente'])).toThrow('2 Modelos')
    expect(() => validarConclusaoBestiario([])).toThrow('Nenhum Modelo')
  })

  it('recusa decisões desconhecidas e mantém a nota separada da ficha', () => {
    expect(revisaoModeloSchema.safeParse({ status: 'excluir' }).success).toBe(false)
    expect(revisaoModeloSchema.parse({ status: 'corrigir', nota: 'Conferir Armas de Fogo' }))
      .toEqual({ status: 'corrigir', nota: 'Conferir Armas de Fogo' })
  })
})
