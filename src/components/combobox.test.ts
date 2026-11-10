import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Combobox } from './combobox'

describe('Combobox', () => {
  it('renderiza o campo como input diretamente para digitação', () => {
    const html = renderToStaticMarkup(
      createElement(Combobox, {
        opcoes: [
          { valor: 'brujah', rotulo: 'Brujah' },
          { valor: 'ventrue', rotulo: 'Ventrue' },
        ],
        valor: 'brujah',
        onChange: () => {},
        placeholder: 'Escolha um clã',
      }),
    )

    // O elemento principal visível deve ser um input com o valor selecionado
    expect(html).toContain('<input')
    expect(html).toContain('value="Brujah"')
    expect(html).toContain('role="combobox"')
  })

  it('renderiza o placeholder no input quando valor for null', () => {
    const html = renderToStaticMarkup(
      createElement(Combobox, {
        opcoes: [
          { valor: 'brujah', rotulo: 'Brujah' },
          { valor: 'ventrue', rotulo: 'Ventrue' },
        ],
        valor: null,
        onChange: () => {},
        placeholder: 'Escolha um clã',
      }),
    )

    expect(html).toContain('<input')
    expect(html).toContain('placeholder="Escolha um clã"')
  })

  it('exibe a descrição da opção selecionada abaixo do campo', () => {
    const html = renderToStaticMarkup(
      createElement(Combobox, {
        opcoes: [
          {
            valor: 'celeridade-1-reflexos-rapidos',
            rotulo: 'Reflexos Rápidos (Nível 1)',
            descricao: 'Reage mais rápido e ignora penalidades de cobertura.',
          },
        ],
        valor: 'celeridade-1-reflexos-rapidos',
        onChange: () => {},
      }),
    )

    expect(html).toContain('Reage mais rápido e ignora penalidades de cobertura.')
  })
})
