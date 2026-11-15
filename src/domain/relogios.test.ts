import { describe, expect, it } from 'vitest'

import { alterarValorRelogio, relogioSchema, type Relogio } from './relogios'

const efeito = {
  id: '00000000-0000-4000-8000-000000000002', titulo: 'Cidade sem sono',
  condicao: 'a_partir_de' as const, etapa: 4,
  textoAtivacao: 'Ninguém da cidade consegue dormir.',
  textoDesativacao: 'As coisas estão se acalmando. Algumas pessoas voltaram a dormir.',
}
const relogio: Relogio = {
  id: '00000000-0000-4000-8000-000000000001', nome: 'Insônia na cidade', tipo: 'Ameaça', descricao: '',
  total: 6, atual: 3, perigo: 'aumenta', visivel: true, efeitos: [efeito],
}

describe('Relógios', () => {
  it('aceita e normaliza o título público opcional, limitando-o a 120 caracteres', () => {
    expect(relogioSchema.parse({ ...relogio, tituloPublico: '  Nas ruas  ' })).toHaveProperty('tituloPublico', 'Nas ruas')
    expect(relogioSchema.safeParse({ ...relogio, tituloPublico: 'A'.repeat(121) }).success).toBe(false)
    expect(relogioSchema.safeParse(relogio).success).toBe(true)
    expect(relogioSchema.safeParse({ ...relogio, tituloPublico: '' }).success).toBe(true)
  })
  it('mantém zero e total como valores válidos, sem ultrapassar os limites', () => {
    expect(alterarValorRelogio(relogio, -1)).toMatchObject({ atual: 0 })
    expect(alterarValorRelogio(relogio, 7)).toMatchObject({ atual: 6 })
    expect(alterarValorRelogio({ ...relogio, atual: 0 }, -1)).toEqual({ atual: 0 })
    expect(alterarValorRelogio({ ...relogio, atual: 6 }, 7)).toEqual({ atual: 6 })
  })

  it('aceita qualquer valor inicial dentro do limite e rejeita valores inválidos', () => {
    for (const atual of [0, 3, 6]) expect(relogioSchema.safeParse({ ...relogio, atual }).success).toBe(true)
    for (const atual of [-1, 7, 1.5, NaN]) expect(relogioSchema.safeParse({ ...relogio, atual }).success).toBe(false)
    expect(relogioSchema.safeParse({ ...relogio, total: 0 }).success).toBe(false)
    expect(relogioSchema.safeParse({ ...relogio, nome: '  ' }).success).toBe(false)
  })

  it('rejeita efeitos fora do relógio, sem texto ou com identificadores repetidos', () => {
    expect(relogioSchema.safeParse({ ...relogio, efeitos: [{ ...efeito, etapa: 7 }] }).success).toBe(false)
    expect(relogioSchema.safeParse({ ...relogio, efeitos: [{ ...efeito, textoDesativacao: '' }] }).success).toBe(false)
    expect(relogioSchema.safeParse({ ...relogio, efeitos: [efeito, efeito] }).success).toBe(false)
  })

  it('explica em PT-BR o limite do tipo de evento criado pelo Narrador', () => {
    expect(relogioSchema.safeParse({ ...relogio, tipo: 'A'.repeat(60) }).success).toBe(true)
    const resultado = relogioSchema.safeParse({ ...relogio, tipo: 'A'.repeat(61) })
    expect(resultado.error?.issues).toEqual([
      expect.objectContaining({ path: ['tipo'], message: 'Use até 60 caracteres no tipo de evento.' }),
    ])
  })

})
