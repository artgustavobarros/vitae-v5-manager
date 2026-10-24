import { describe, expect, it } from 'vitest'

import { DISCIPLINAS } from '../ficha'
import { CATALOGO, PODERES, RITUAIS_TODOS, TIPOS_COTERIE, VANTAGENS_COTERIE, VANTAGENS_PERSONAGEM } from './index'
import { LIVROS } from './livros'

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/

describe('Catálogo', () => {
  it('tem ids únicos em kebab-case', () => {
    const ids = CATALOGO.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(KEBAB)
  })

  it('cita só livros conhecidos e páginas positivas', () => {
    for (const item of CATALOGO) {
      expect(LIVROS).toContain(item.fonte.livro)
      if (item.fonte.pagina !== null) expect(item.fonte.pagina).toBeGreaterThan(0)
    }
  })

  it('tem nome, nome original e descrição em todo item', () => {
    for (const item of CATALOGO) {
      expect(item.nome.trim(), item.id).not.toBe('')
      expect(item.nomeOriginal.trim(), item.id).not.toBe('')
      expect(item.descricao.trim(), item.id).not.toBe('')
    }
  })

  it('prefixa o id pelo tipo do item', () => {
    for (const p of PODERES) expect(p.id.startsWith(`${p.disciplina}-${p.nivel}-`), p.id).toBe(true)
    for (const r of RITUAIS_TODOS) expect(r.id.startsWith(`${r.tipo}-${r.nivel}-`), r.id).toBe(true)
    for (const v of VANTAGENS_PERSONAGEM) {
      expect(v.escopo, v.id).toBe('personagem')
      expect(v.id.startsWith(`${v.tipo}-`), v.id).toBe(true)
    }
    for (const v of VANTAGENS_COTERIE) {
      expect(v.escopo, v.id).toBe('coterie')
      expect(v.id.startsWith(`coterie-${v.tipo}-`), v.id).toBe(true)
    }
    for (const t of TIPOS_COTERIE) expect(t.id.startsWith('tipo-coterie-'), t.id).toBe(true)
  })

  it('amálgama aponta para outra Disciplina existente', () => {
    const disciplinas = DISCIPLINAS.map((d) => d.id) as string[]
    for (const p of PODERES.filter((x) => x.amalgama)) {
      expect(disciplinas).toContain(p.amalgama!.disciplina)
      expect(p.amalgama!.disciplina, p.id).not.toBe(p.disciplina)
    }
  })

  it('Vantagens têm níveis válidos em ordem crescente', () => {
    for (const v of [...VANTAGENS_PERSONAGEM, ...VANTAGENS_COTERIE]) {
      expect(v.niveis.length, v.id).toBeGreaterThan(0)
      expect([...v.niveis].sort((a, b) => a - b), v.id).toEqual(v.niveis)
    }
  })
})
