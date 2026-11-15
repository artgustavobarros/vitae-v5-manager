import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { RelogioSalvo } from '#/domain/relogios'
import { CardRelogio } from './card-relogio'

const relogio: RelogioSalvo = {
  id: 'r1', nome: 'Insônia', tipo: 'Ameaça', descricao: '', atual: 4, total: 6,
  perigo: 'aumenta', visivel: true, revisao: 1, ultimaTendencia: null,
  efeitos: [{ id: 'e1', titulo: 'Cidade sem sono', condicao: 'a_partir_de', etapa: 4,
    textoAtivacao: 'Ninguém dorme.', textoDesativacao: 'As pessoas voltam a dormir.' }],
}
function renderizar(dados = relogio, narrador = false, ocupado = false) {
  return renderToStaticMarkup(createElement(CardRelogio, {
    relogio: dados, narrador, ocupado, onMover: () => {}, onEditar: () => {}, onRetirar: () => {},
  }))
}

describe('Card do Relógio', () => {
  it('preserva controles no foco durante o envio, sinalizando a indisponibilidade sem desabilitá-los nativamente', () => {
    const html = renderizar(relogio, true, true)
    expect(html).toMatch(/aria-label="Diminuir Insônia"[^>]*aria-disabled="true"/)
    expect(html).not.toMatch(/aria-label="Diminuir Insônia"[^>]*disabled=""/)
  })

  it('mostra somente título e etapas, sem extras nem controles para o público', () => {
    const html = renderizar()
    expect(html).toContain('Insônia')
    expect(html).toContain('max="6" value="4"')
    expect(html).not.toMatch(/Ameaça|Efeitos|Ninguém dorme|perigo|data-tendencia/)
    expect(html).not.toContain('<button')
  })

  it('usa o título público sem revelar o título interno, mas preserva o título do Narrador', () => {
    const dados = { ...relogio, tituloPublico: 'A noite avança' }
    const publico = renderizar(dados)
    expect(publico).toContain('A noite avança')
    expect(publico).not.toContain('Insônia')
    expect(renderizar(dados, true)).toContain('Insônia')
  })

  it('mantém o card nos extremos e bloqueia apenas o movimento que ultrapassa o limite', () => {
    const zero = renderizar({ ...relogio, atual: 0 }, true)
    expect(zero).toContain('Insônia')
    expect(zero).toMatch(/aria-label="Diminuir Insônia"[^>]*disabled=""/)
    expect(zero).not.toMatch(/aria-label="Aumentar Insônia"[^>]*disabled=""/)
    const total = renderizar({ ...relogio, atual: 6 }, true)
    expect(total).toMatch(/aria-label="Aumentar Insônia"[^>]*disabled=""/)
    expect(total).not.toMatch(/aria-label="Diminuir Insônia"[^>]*disabled=""/)
  })
})
