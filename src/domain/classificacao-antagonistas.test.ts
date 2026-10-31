import { describe, expect, it } from 'vitest'
import { criarModeloAntagonistaPadrao, modeloAntagonistaSchema } from './bestiario'
import { etiquetasDoTipo, filtrarClassificacao } from './classificacao-antagonistas'
import { criarInimigoDeModelo, ehParticipanteVampiro } from './combate'

const modelos = [
  { ...criarModeloAntagonistaPadrao(), nome: 'Carniçal de ataque', categoria: 'Carniçal', etiquetas: ['Ataque'] },
  { ...criarModeloAntagonistaPadrao(), nome: 'Carniçal infiltrado', categoria: 'Carniçal', etiquetas: ['Sabá', 'Ataque'] },
  { ...criarModeloAntagonistaPadrao(), nome: 'Carniçal comum', categoria: 'Carniçal', etiquetas: [] },
  { ...criarModeloAntagonistaPadrao(), nome: 'Bispo', categoria: 'Vampiro', etiquetas: ['Sabá'] },
  { ...criarModeloAntagonistaPadrao(), nome: 'Xerife', categoria: 'Vampiro', etiquetas: ['Camarilla'] },
  { ...criarModeloAntagonistaPadrao(), nome: 'Segurança', categoria: 'Mortal', etiquetas: ['Ataque'] },
].map(m => modeloAntagonistaSchema.parse(m))

describe('Tipos e Etiquetas dos Antagonistas', () => {
  it('separa tipos gerais de etiquetas e normaliza etiquetas sem duplicar acentos ou caixa', () => {
    expect(modeloAntagonistaSchema.parse({ ...modelos[0], etiquetas: [' Sabá ', 'saba', 'SABÁ', 'Ataque'] }).etiquetas).toEqual(['Sabá', 'Ataque'])
    expect(modeloAntagonistaSchema.safeParse({ ...modelos[0], categoria: 'Ataque' }).success).toBe(false)
    expect(modeloAntagonistaSchema.safeParse({ ...modelos[0], categoria: 'Vampiro · Sabá' }).success).toBe(false)
    expect(modeloAntagonistaSchema.safeParse({ ...modelos[0], etiquetas: [''] }).success).toBe(false)
  })

  it('agrupa todos os Carniçais e Vampiros independentemente das etiquetas', () => {
    expect(filtrarClassificacao(modelos, 'Carniçal', []).map(m => m.nome)).toEqual(['Carniçal de ataque', 'Carniçal infiltrado', 'Carniçal comum'])
    expect(filtrarClassificacao(modelos, 'Vampiro', []).map(m => m.nome)).toEqual(['Bispo', 'Xerife'])
    expect(filtrarClassificacao(modelos, null, [])).toHaveLength(6)
  })

  it('oferece só etiquetas do tipo escolhido e exige todas as etiquetas para refinar a busca', () => {
    expect(etiquetasDoTipo(modelos, 'Carniçal')).toEqual(['Ataque', 'Sabá'])
    expect(etiquetasDoTipo(modelos, 'Vampiro')).toEqual(['Camarilla', 'Sabá'])
    expect(etiquetasDoTipo(modelos, null)).toEqual([])
    expect(filtrarClassificacao(modelos, 'Carniçal', ['Ataque']).map(m => m.nome)).toEqual(['Carniçal de ataque', 'Carniçal infiltrado'])
    expect(filtrarClassificacao(modelos, 'Carniçal', ['SABA', 'ataque']).map(m => m.nome)).toEqual(['Carniçal infiltrado'])
    expect(filtrarClassificacao(modelos, 'Mortal', ['Sabá'])).toEqual([])
  })

  it('leva etiquetas para a cópia do Combate sem mudar o tipo nem as regras de saúde', () => {
    const vampiro = criarInimigoDeModelo(modelos[3], { id: 'v', nome: 'Bispo' })
    expect(vampiro.etiquetas).toEqual(['Sabá'])
    expect(ehParticipanteVampiro(vampiro)).toBe(true)
    const mortal = criarInimigoDeModelo({ ...modelos[5], etiquetas: ['Vampiro'] }, { id: 'm', nome: 'Segurança' })
    expect(ehParticipanteVampiro(mortal)).toBe(false)
    vampiro.etiquetas!.push('Ataque')
    expect(modelos[3].etiquetas).toEqual(['Sabá'])
  })
})
