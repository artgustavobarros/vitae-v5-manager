import { describe, expect, it } from 'vitest'

import { aplicarSugestaoNaFonte } from './aplicar-sugestao-fonte'

describe('aplicarSugestaoNaFonte', () => {
  it('atualiza nome, descrição e confiança do item pelo id estável', () => {
    const fonte = "export const itens = [{ id: 'poder-1-a', nome: 'Antigo', descricao: 'Antes', confianca: 'duvida' }]"
    const resultado = aplicarSugestaoNaFonte(fonte, {
      itemId: 'poder-1-a',
      sugestaoNome: "D'Água",
      sugestaoDescricao: 'Depois',
    })
    expect(resultado).toContain('nome: "D\'Água"')
    expect(resultado).toContain('descricao: "Depois"')
    expect(resultado).toContain("confianca: 'certo'")
  })

  it('atualiza título da consulta rápida e não altera outros ids', () => {
    const fonte = "export const itens = [{ id: 'forca', titulo: 'Força', descricao: 'Antes' }, { id: 'vigor', titulo: 'Vigor', descricao: 'Igual' }]"
    const resultado = aplicarSugestaoNaFonte(fonte, {
      itemId: 'consulta-atributo-forca',
      sugestaoNome: 'Força física',
      sugestaoDescricao: null,
    })
    expect(resultado).toContain('titulo: "Força física"')
    expect(resultado).toContain("id: 'vigor', titulo: 'Vigor', descricao: 'Igual'")
    expect(resultado).toContain("confianca: 'certo'")
  })

  it('devolve null quando o id não está na fonte', () => {
    expect(aplicarSugestaoNaFonte("export const itens = [{ id: 'outro' }]", {
      itemId: 'poder-1-a',
      sugestaoNome: 'Nome',
      sugestaoDescricao: null,
    })).toBeNull()
  })
})
