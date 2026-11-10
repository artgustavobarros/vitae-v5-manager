import { expect, it } from 'vitest'
import type { AvisoRelogio } from '#/domain/relogios'
import { enfileirarAvisosRelogios } from './avisos-relogios'

it('mantém todos os avisos em ordem e ignora apenas entregas repetidas do mesmo evento', () => {
  const aviso: AvisoRelogio = { id: 'evento-1', efeitoId: 'efeito-1', relogioId: 'relogio-1', nomeRelogio: 'Insônia',
    titulo: 'Sem sono', texto: 'Ninguém dorme.', ativo: true, tendencia: 'piora' }
  const saida = { ...aviso, id: 'evento-2', texto: 'As pessoas voltam a dormir.', ativo: false, tendencia: 'melhora' as const }
  expect(enfileirarAvisosRelogios([aviso], [aviso, saida])).toEqual([aviso, saida])
  expect(enfileirarAvisosRelogios([saida], [{ ...aviso, id: 'evento-3' }])).toEqual([saida, { ...aviso, id: 'evento-3' }])
})
