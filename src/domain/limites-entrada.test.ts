import { describe, expect, it } from 'vitest'

import { fichaNeofito, fichaSchema } from './ficha'
import { catalogoCoterieSchema } from './coterie'
import { criarModeloAntagonistaPadrao, modeloAntagonistaSchema } from './bestiario'
import { participantePersonagemSchema, atualizacaoInimigoSchema } from './combate'
import { revisaoModeloSchema } from './revisao-bestiario'
import { fichaAntagonistaCompletaSchema, criarFichaAntagonistaCompleta } from './ficha-antagonista'
import { recursosSobrenaturaisSchema } from './poderes-antagonista'

describe('limites de entradas recebidas pela aplicação', () => {
  it('aceita uma História longa e rejeita excesso de texto', () => {
    expect(fichaSchema.safeParse({ ...fichaNeofito(), historia: 'a'.repeat(20_000) }).success).toBe(true)
    expect(fichaSchema.safeParse({ ...fichaNeofito(), historia: 'a'.repeat(20_001) }).success).toBe(false)
  })

  it('limita campos curtos e especializações da Ficha', () => {
    expect(fichaSchema.safeParse({ ...fichaNeofito(), conceito: 'a'.repeat(501) }).success).toBe(false)
    const ficha = fichaNeofito()
    ficha.habilidades.briga.especializacoes = Array.from({ length: 101 }, () => 'Mordida')
    expect(fichaSchema.safeParse(ficha).success).toBe(false)
  })

  it('limita a quantidade e o tamanho dos ids enviados ao Catálogo', () => {
    expect(fichaSchema.safeParse({ ...fichaNeofito(), poderes: ['a'.repeat(201)] }).success).toBe(false)
    expect(fichaSchema.safeParse({ ...fichaNeofito(), poderes: Array.from({ length: 101 }, (_, i) => `poder-${i}`) }).success).toBe(false)
  })

  it('descarta metadados arbitrários de criação e campos de propriedade', () => {
    const ficha = fichaSchema.parse({ ...fichaNeofito(), criacao: { livre: { qualquer: 'dado' } }, donoId: 'outro' })
    expect(ficha).not.toHaveProperty('criacao')
    expect(ficha).not.toHaveProperty('donoId')
  })

  it('limita as listas do Catálogo da Coterie', () => {
    const vantagens = Array.from({ length: 101 }, () => ({ id: 'vantagem-contatos', nivel: 1 }))
    expect(catalogoCoterieSchema.safeParse({ tipo: null, vantagens, defeitos: [] }).success).toBe(false)
  })

  it('limita nomes, notas e listas dos Modelos de Antagonistas', () => {
    const modelo = criarModeloAntagonistaPadrao()
    expect(modeloAntagonistaSchema.safeParse({ ...modelo, nome: 'a'.repeat(121) }).success).toBe(false)
    expect(modeloAntagonistaSchema.safeParse({ ...modelo, nome: 'Lobo', notas: 'a'.repeat(20_001) }).success).toBe(false)
    expect(modeloAntagonistaSchema.safeParse({ ...modelo, nome: 'Lobo', especiais: Array.from({ length: 101 }, () => ({ nome: 'Mordida' })) }).success).toBe(false)
  })

  it('aplica os mesmos limites ao editar um Inimigo no Combate', () => {
    expect(atualizacaoInimigoSchema.safeParse({ notas: 'a'.repeat(20_001) }).success).toBe(false)
    expect(atualizacaoInimigoSchema.safeParse({ nome: 'a'.repeat(121) }).success).toBe(false)
  })

  it('limita ids e condições dos participantes do Combate', () => {
    const participante = { id: 'p1', nome: 'Helena', tipo: 'personagem', personagemId: '00000000-0000-4000-8000-000000000001' }
    expect(participantePersonagemSchema.safeParse({ ...participante, id: 'a'.repeat(201) }).success).toBe(false)
    expect(participantePersonagemSchema.safeParse({ ...participante, condicoes: Array.from({ length: 101 }, () => 'caido') }).success).toBe(false)
  })

  it('limita o texto das revisões do Narrador', () => {
    expect(revisaoModeloSchema.safeParse({ status: 'corrigir', nota: 'a'.repeat(20_001) }).success).toBe(false)
  })

  it('limita características e recursos das Fichas Completas de Antagonistas', () => {
    const ficha = criarFichaAntagonistaCompleta()
    expect(fichaAntagonistaCompletaSchema.safeParse({ ...ficha, habilidades: { ['a'.repeat(201)]: 1 } }).success).toBe(false)
    expect(fichaAntagonistaCompletaSchema.safeParse({ ...ficha, habilidades: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [`habilidade-${i}`, 1])) }).success).toBe(false)
    expect(recursosSobrenaturaisSchema.safeParse({ disciplinas: {}, rituais: Array.from({ length: 101 }, () => 'ritual') }).success).toBe(false)
  })
})
