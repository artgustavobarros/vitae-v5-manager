import { describe, expect, it } from 'vitest'

import { marcasDe, fichaNeofito } from './ficha'
import { alteracaoMarcasSchema, temConflitoMarcas } from './sincronizacao-marcas'

const base = marcasDe(fichaNeofito())
const entrada = {
  operacaoId: '123e4567-e89b-42d3-a456-426614174000',
  usuarioId: 'jogador-1',
  id: '123e4567-e89b-42d3-a456-426614174001',
  base,
  marcas: { fome: 3 },
}

describe('Protocolo de sincronização das marcas', () => {
  it('aceita somente alterações não vazias dos campos de marcação', () => {
    expect(alteracaoMarcasSchema.safeParse(entrada).success).toBe(true)
    expect(alteracaoMarcasSchema.safeParse({ ...entrada, marcas: {} }).success).toBe(false)
    expect(alteracaoMarcasSchema.safeParse({ ...entrada, marcas: { fome: undefined } }).success).toBe(false)
    expect(alteracaoMarcasSchema.safeParse({ ...entrada, marcas: { fome: 3, danoVitalidade: undefined } }).success).toBe(false)
    expect(alteracaoMarcasSchema.safeParse({ ...entrada, marcas: { humanidade: 1 } }).success).toBe(false)
    expect(alteracaoMarcasSchema.safeParse({ ...entrada, marcas: { fome: 6 } }).success).toBe(false)
    expect(alteracaoMarcasSchema.safeParse({ ...entrada, operacaoId: 'invalido' }).success).toBe(false)
  })

  it('detecta uma mudança concorrente no campo que será alterado', () => {
    expect(temConflitoMarcas({ ...base, fome: 4 }, base, { fome: 3 })).toBe(true)
  })

  it('permite alterar Fome mesmo quando outro dispositivo mudou o dano', () => {
    expect(temConflitoMarcas({ ...base, danoVitalidade: { superficial: 1, agravado: 0 } }, base, { fome: 3 }))
      .toBe(false)
  })

  it('compara o conteúdo de danos, independente da identidade ou ordem das propriedades', () => {
    const atual = { ...base, danoVitalidade: { agravado: 0, superficial: 1 } }
    const antes = { ...base, danoVitalidade: { superficial: 1, agravado: 0 } }
    expect(temConflitoMarcas(atual, antes, { danoVitalidade: { superficial: 2, agravado: 0 } })).toBe(false)
    expect(temConflitoMarcas(atual, base, { danoVitalidade: { superficial: 2, agravado: 0 } })).toBe(true)
  })
})
