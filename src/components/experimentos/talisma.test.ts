import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Talisma } from './talisma'

describe('Tira de talismã experimental', () => {
  it('representa cada etapa do Relógio sem perder a contagem', () => {
    const html = renderToStaticMarkup(createElement(Talisma, {
      nome: 'Cerco', descricao: 'A polícia se aproxima.', tipo: 'relogio',
      caixas: ['superficial', 'superficial', 'vazio', 'vazio'],
    }))
    expect(html).toContain('2 de 4')
    expect(html.match(/data-marca="superficial"/g)).toHaveLength(2)
    expect(html.match(/data-marca="vazio"/g)).toHaveLength(2)
    expect(html).not.toContain('<button')
  })

  it('distingue dano superficial de agravado e oferece marcação por posição', () => {
    const html = renderToStaticMarkup(createElement(Talisma, {
      nome: 'Helena', descricao: 'Vitalidade', tipo: 'vitalidade',
      caixas: ['agravado', 'superficial', 'vazio'],
      onMarcar: () => {}, onDesfazer: () => {},
    }))
    expect(html).toContain('data-marca="agravado"')
    expect(html).toContain('data-marca="superficial"')
    expect(html).toContain('Helena: posição 1, agravado')
    expect(html).toContain('Helena: posição 2, superficial')
    expect(html).toContain('Helena: posição 3, vazio')
  })

  it('não revela marcas nem capacidade quando a Vitalidade está oculta', () => {
    const html = renderToStaticMarkup(createElement(Talisma, {
      nome: 'Guarda', descricao: 'Inimigo', tipo: 'vitalidade', oculto: true,
      caixas: ['agravado', 'superficial', 'vazio'], onMarcar: () => {},
    }))
    expect(html).toContain('Vitalidade oculta')
    expect(html).not.toMatch(/data-marca|<button|<meter|posição/)
  })

  it('abre um rasgo para superficial e dois para agravado, preservando a contagem', () => {
    const html = renderToStaticMarkup(createElement(Talisma, {
      nome: 'Helena', descricao: 'Vitalidade', tipo: 'vitalidade', formato: 'cortejo',
      caixas: ['agravado', 'superficial', 'vazio'],
    }))
    expect(html.match(/data-rasgo="/g)).toHaveLength(3)
    expect(html).toContain('<mask')
    expect(html).toContain('2 de 3')
  })

  it('rompe o papel no limite sem remover o nome e recompõe ao desfazer', () => {
    const props = { nome: 'Cerco', descricao: 'Ameaça', tipo: 'relogio' as const, formato: 'altar' as const }
    const completo = renderToStaticMarkup(createElement(Talisma, { ...props, caixas: ['superficial', 'superficial'] }))
    const desfeito = renderToStaticMarkup(createElement(Talisma, { ...props, caixas: ['superficial', 'vazio'] }))
    expect(completo).toContain('data-integridade="rompido"')
    expect(completo).toContain('Cerco')
    expect(completo).toContain('2 de 2')
    expect(desfeito).not.toContain('data-integridade="rompido"')
    expect(desfeito.match(/data-rasgo="/g)).toHaveLength(1)
  })

  it('não deixa o rasgo denunciar o dano oculto', () => {
    const html = renderToStaticMarkup(createElement(Talisma, {
      nome: 'Oculto', descricao: 'Inimigo', tipo: 'vitalidade', formato: 'altar', oculto: true,
      caixas: ['agravado', 'agravado'],
    }))
    expect(html).not.toMatch(/data-rasgo|data-integridade|data-marca|<mask/)
    expect(html).toContain('Vitalidade oculta')
  })
})
