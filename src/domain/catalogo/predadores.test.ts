import { describe, expect, it } from 'vitest'

import { DISCIPLINAS, HABILIDADES } from '../ficha'
import { tipoPredador, TIPOS_PREDADOR } from './index'

describe('Tipos de Predador', () => {
  it('contém os tipos canônicos do livro e suplementos (17 no total)', () => {
    expect(TIPOS_PREDADOR.length).toBe(17)
  })

  it('permite buscar pelo id', () => {
    const sanguessuga = tipoPredador('tipo-predador-sanguessuga')
    expect(sanguessuga).not.toBeNull()
    expect(sanguessuga?.nome).toBe('Sanguessuga')
    expect(sanguessuga?.modificadorPotenciaSangue).toBe(1)
    expect(sanguessuga?.modificadorHumanidade).toBe(-1)
  })

  it('aponta apenas para Habilidades e Disciplinas válidas', () => {
    const habIds = new Set(HABILIDADES.map((h) => h.id))
    const discIds = new Set(DISCIPLINAS.map((d) => d.id))

    for (const predador of TIPOS_PREDADOR) {
      expect(predador.opcoesEspecializacao.length).toBeGreaterThan(0)
      for (const opt of predador.opcoesEspecializacao) {
        expect(habIds.has(opt.habilidade), `${predador.id}: ${opt.habilidade}`).toBe(true)
        expect(opt.sugestoes.length).toBeGreaterThan(0)
      }

      expect(predador.opcoesDisciplina.length).toBeGreaterThan(0)
      for (const d of predador.opcoesDisciplina) {
        expect(discIds.has(d), `${predador.id}: ${d}`).toBe(true)
      }
    }
  })

  it('tipos com escolhas de traços têm opções válidas de Vantagem ou Defeito', () => {
    const comEscolhas = TIPOS_PREDADOR.filter((p) => p.escolhasTracos && p.escolhasTracos.length > 0)
    expect(comEscolhas.length).toBeGreaterThan(0)

    for (const p of comEscolhas) {
      for (const escolha of p.escolhasTracos!) {
        expect(escolha.rotulo.trim()).not.toBe('')
        expect(escolha.opcoes.length).toBeGreaterThanOrEqual(2)
        for (const opt of escolha.opcoes) {
          expect(['vantagem', 'defeito']).toContain(opt.tipo)
          expect(opt.nivel).toBeGreaterThan(0)
        }
      }
    }
  })
})
