import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { fichaNeofito } from '#/domain/ficha'

import { ListaDisciplinas } from './tracos'

describe('ListaDisciplinas', () => {
  it('mostra Ritual preservado quando a Disciplina foi removida', () => {
    const ficha = { ...fichaNeofito(), rituais: ['ritual-1-removido'] }
    const html = renderToStaticMarkup(createElement(ListaDisciplinas, { ficha }))
    expect(html).toContain('Item removido do Catálogo')
  })
})
