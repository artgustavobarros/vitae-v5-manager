import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CardPerdicaoCompulsaoCla } from './card-cla'

describe('CardPerdicaoCompulsaoCla', () => {
  it('renderiza perdição e compulsão de clã válido', () => {
    const html = renderToStaticMarkup(createElement(CardPerdicaoCompulsaoCla, { cla: 'ventrue' }))
    expect(html).toContain('Ventrue')
    expect(html).toContain('Paladar restrito')
    expect(html).toContain('Comando Régio')
  })

  it('não renderiza nada se cla for null', () => {
    const html = renderToStaticMarkup(createElement(CardPerdicaoCompulsaoCla, { cla: null }))
    expect(html).toBe('')
  })
})
