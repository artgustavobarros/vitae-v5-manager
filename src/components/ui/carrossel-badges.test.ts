import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CarrosselBadges } from './carrossel-badges'

describe('CarrosselBadges', () => {
  it('renderiza os filhos dentro do contêiner com flex e shrink-0', () => {
    const html = renderToStaticMarkup(
      createElement(
        CarrosselBadges,
        null,
        createElement('span', null, 'Badge 1'),
        createElement('span', null, 'Badge 2'),
      ),
    )

    expect(html).toContain('overflow-hidden')
    expect(html).toContain('Badge 1')
    expect(html).toContain('Badge 2')
    expect(html).toContain('shrink-0')
  })
})
