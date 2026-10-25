import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { InputNumero } from './input-numero'

describe('InputNumero', () => {
  it('renderiza com o valor numérico inicial', () => {
    const html = renderToStaticMarkup(
      createElement(InputNumero, {
        value: 5,
        onChange: () => {},
      }),
    )

    expect(html).toContain('type="number"')
    expect(html).toContain('value="5"')
  })

  it('renderiza com string vazia quando valor for null ou undefined', () => {
    const html = renderToStaticMarkup(
      createElement(InputNumero, {
        value: null,
        onChange: () => {},
      }),
    )

    expect(html).toContain('value=""')
  })
})
