import { describe, expect, it } from 'vitest'

import { CLAS } from './ficha'
import {
  CLAS_PADRAO_CRONICA,
  OPCOES_CRIACAO_CRONICA_PADRAO,
  opcoesCriacaoCronicaSchema,
} from './cronica'

describe('Opções de Criação da Crônica (domínio)', () => {
  it('contém exatamente os 14 clãs padrão do V5, excluindo caitiff e sangue-ralo', () => {
    expect(CLAS_PADRAO_CRONICA).toHaveLength(14)
    expect(CLAS_PADRAO_CRONICA).not.toContain('sangue-ralo')
    expect(CLAS_PADRAO_CRONICA).not.toContain('caitiff')

    // Confere que todos os 14 clãs existem em CLAS
    const todosIds = CLAS.map((c) => c.id)
    for (const cla of CLAS_PADRAO_CRONICA) {
      expect(todosIds).toContain(cla)
    }
  })

  it('possui valores padrão canônicos da Crônica', () => {
    expect(OPCOES_CRIACAO_CRONICA_PADRAO).toEqual({
      idadePadrao: 'neofito',
      sangueRaloPermitido: false,
      caitiffPermitido: true,
      clasPermitidos: CLAS_PADRAO_CRONICA,
    })
  })

  it('valida e aplica valores padrão com Zod', () => {
    const parsed = opcoesCriacaoCronicaSchema.parse({})
    expect(parsed.idadePadrao).toBe('neofito')
    expect(parsed.sangueRaloPermitido).toBe(false)
    expect(parsed.caitiffPermitido).toBe(true)
    expect(parsed.clasPermitidos).toEqual(CLAS_PADRAO_CRONICA)
  })

  it('recusa idade de criação desconhecida', () => {
    expect(() =>
      opcoesCriacaoCronicaSchema.parse({
        idadePadrao: 'antigo',
      }),
    ).toThrow()
  })
})
