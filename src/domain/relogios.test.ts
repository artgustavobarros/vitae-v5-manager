import { describe, expect, it } from 'vitest'

import { alterarValorRelogio, efeitosAtivos, relogioSchema, transicoesEfeitos, type Relogio } from './relogios'

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
  it('ativa em 4+, mantém em 5, desativa ao voltar para 3 e permite reativar', () => {
    const entrada = alterarValorRelogio(relogio, 4)
    expect(entrada.avisos).toEqual([{ efeitoId: efeito.id, titulo: efeito.titulo, texto: efeito.textoAtivacao, ativo: true }])
    expect(efeitosAtivos({ ...relogio, atual: 5 })).toEqual([efeito])
    expect(alterarValorRelogio({ ...relogio, atual: 4 }, 5).avisos).toEqual([])
    expect(alterarValorRelogio({ ...relogio, atual: 5 }, 3).avisos).toEqual([
      { efeitoId: efeito.id, titulo: efeito.titulo, texto: efeito.textoDesativacao, ativo: false },
    ])
    expect(alterarValorRelogio(relogio, 4).avisos).toEqual(entrada.avisos)
  })

  it('detecta a entrada mesmo quando o valor pula o limiar', () => {
    expect(alterarValorRelogio({ ...relogio, atual: 2 }, 5).avisos[0]?.ativo).toBe(true)
  })

  it('suporta efeitos que ficam ativos em zero ou até uma etapa', () => {
    const contagem = { ...relogio, atual: 1, efeitos: [{ ...efeito, condicao: 'ate' as const, etapa: 0 }] }
    expect(alterarValorRelogio(contagem, 0).avisos[0]?.ativo).toBe(true)
    expect(alterarValorRelogio({ ...contagem, atual: 0 }, 1).avisos[0]?.ativo).toBe(false)
  })

  it('mantém zero e total como valores válidos, sem ultrapassar os limites', () => {
    expect(alterarValorRelogio(relogio, -1)).toMatchObject({ atual: 0 })
    expect(alterarValorRelogio(relogio, 7)).toMatchObject({ atual: 6 })
    expect(alterarValorRelogio({ ...relogio, atual: 0 }, -1)).toEqual({ atual: 0, tendencia: null, avisos: [] })
    expect(alterarValorRelogio({ ...relogio, atual: 6 }, 7)).toEqual({ atual: 6, tendencia: null, avisos: [] })
  })

  it.each([
    ['aumenta', 4, 'piora'], ['aumenta', 2, 'melhora'],
    ['diminui', 4, 'melhora'], ['diminui', 2, 'piora'],
  ] as const)('separa valor numérico de perigo: %s, novo valor %s', (perigo, atual, tendencia) => {
    expect(alterarValorRelogio({ ...relogio, perigo }, atual).tendencia).toBe(tendencia)
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

  it('avalia efeitos já ativos ao criar ou editar um relógio', () => {
    expect(transicoesEfeitos(null, { ...relogio, atual: 4 })[0]?.ativo).toBe(true)
    expect(transicoesEfeitos(relogio, { ...relogio, efeitos: [{ ...efeito, etapa: 2 }] })[0]?.ativo).toBe(true)
    expect(transicoesEfeitos({ ...relogio, atual: 5 }, { ...relogio, atual: 5, efeitos: [] })[0]?.ativo).toBe(false)
  })
})
