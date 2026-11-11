import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { BotaoVisibilidadeCondicao } from './visibilidade-condicao'

describe('Visibilidade da Condição no Combate', () => {
  it.each([
    { revelada: false, acao: 'Mostrar Condição ao público' },
    { revelada: true, acao: 'Ocultar Condição do público' },
  ])('oferece a ação $acao sem alterar o compartilhamento de Coterie', ({ revelada, acao }) => {
    const html = renderToStaticMarkup(createElement(BotaoVisibilidadeCondicao, {
      revelada, onAlterar: async () => {},
    }))
    expect(html).toContain(acao)
    expect(html).toContain(`aria-pressed="${revelada}"`)
    expect(html).toContain('Vitalidade, Força de Vontade e Fome')
  })
})
