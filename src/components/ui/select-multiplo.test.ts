import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { SelectMultiplo } from './select-multiplo'

describe('SelectMultiplo', () => {
  const opcoes = [
    { valor: 'p1', rotulo: 'Arthur', detalhe: 'Brujah' },
    { valor: 'p2', rotulo: 'Helena', detalhe: 'Toreador' },
  ]

  it('renderiza o placeholder quando nada estiver selecionado', () => {
    const html = renderToStaticMarkup(
      createElement(SelectMultiplo, {
        opcoes,
        valores: [],
        onChange: () => {},
        placeholder: 'Escolha personagens...',
      }),
    )

    expect(html).toContain('Escolha personagens...')
  })

  it('renderiza o rótulo do item quando apenas 1 estiver selecionado', () => {
    const html = renderToStaticMarkup(
      createElement(SelectMultiplo, {
        opcoes,
        valores: ['p1'],
        onChange: () => {},
      }),
    )

    expect(html).toContain('Arthur')
  })

  it('renderiza a contagem e nomes quando 2 ou mais estiverem selecionados', () => {
    const html = renderToStaticMarkup(
      createElement(SelectMultiplo, {
        opcoes,
        valores: ['p1', 'p2'],
        onChange: () => {},
      }),
    )

    expect(html).toContain('2 selecionados: Arthur, Helena')
  })

  it('renderiza o campo como input no novo formato de combobox com chevrons', () => {
    const html = renderToStaticMarkup(
      createElement(SelectMultiplo, {
        opcoes,
        valores: [],
        onChange: () => {},
        placeholder: 'Pesquisar...',
      }),
    )

    expect(html).toContain('<input')
    expect(html).toContain('role="combobox"')
    expect(html).toContain('lucide-chevrons-up-down')
  })
})
