import { describe, expect, it } from 'vitest'

import { criarModeloAntagonistaPadrao, modeloAntagonistaSchema } from './bestiario'
import { atualizarParticipanteInimigo, criarInimigoDeModelo, filtrarCombateParaJogador, iniciarCombate, participanteCombateSchema } from './combate'

const modelo = {
  ...criarModeloAntagonistaPadrao(),
  nome: 'Fada', categoria: 'Outras criaturas',
  paradaFisico: null, paradaSocial: null, paradaMental: null,
  fichaCompleta: {
    atributos: { forca: 2, destreza: 4, vigor: 3, carisma: 7, manipulacao: 5, autocontrole: 3, inteligencia: 3, raciocinio: 4, determinacao: 4 },
    habilidades: { 'Armas Brancas': 4, Empatia: 3 },
    disciplinas: { Presença: 5, Dominação: 4 },
    humanidade: null, potenciaSangue: null, fome: null,
  },
}

describe('Antagonistas com ficha completa', () => {
  it('aceita Atributos sobrenaturais e campos ausentes sem inventar paradas gerais', () => {
    const ficha = modeloAntagonistaSchema.parse(modelo)
    expect(ficha.fichaCompleta?.atributos.carisma).toBe(7)
    expect(ficha.fichaCompleta?.humanidade).toBeNull()
    expect(ficha.paradaFisico).toBeNull()
    expect(modeloAntagonistaSchema.safeParse({ ...modelo, fichaCompleta: null }).success).toBe(false)
    expect(modeloAntagonistaSchema.safeParse({ ...modelo, paradaFisico: 3 }).success).toBe(false)
  })

  it('recusa características negativas e mantém Humanidade e Fome zero', () => {
    const fichaCompleta = { ...modelo.fichaCompleta, humanidade: 0, fome: 0 }
    expect(modeloAntagonistaSchema.parse({ ...modelo, fichaCompleta }).fichaCompleta).toMatchObject({ humanidade: 0, fome: 0 })
    expect(modeloAntagonistaSchema.safeParse({ ...modelo, fichaCompleta: { ...fichaCompleta, atributos: { ...fichaCompleta.atributos, carisma: -1 } } }).success).toBe(false)
  })

  it('cria um Inimigo com cópia independente da ficha e permite editar só a instância', () => {
    const ficha = modeloAntagonistaSchema.parse(modelo)
    const inimigo = criarInimigoDeModelo(ficha, { id: 'fada-1', nome: 'Guardiã' })
    expect(participanteCombateSchema.parse(inimigo).tipo).toBe('inimigo')
    expect(inimigo.paradas.fisico).toBeNull()
    expect(participanteCombateSchema.safeParse({ ...inimigo, fichaCompleta: null }).success).toBe(false)
    expect(inimigo.fichaCompleta?.disciplinas.Presença).toBe(5)
    inimigo.fichaCompleta!.atributos.carisma = 8
    expect(ficha.fichaCompleta?.atributos.carisma).toBe(7)
    const combate = atualizarParticipanteInimigo(iniciarCombate([inimigo]), 'fada-1', {
      fichaCompleta: { ...inimigo.fichaCompleta!, humanidade: 0 },
    })
    expect(combate.participantes[0]).toMatchObject({ fichaCompleta: { humanidade: 0 } })
    expect(ficha.fichaCompleta?.humanidade).toBeNull()
    expect(() => atualizarParticipanteInimigo(combate, 'fada-1', { fichaCompleta: null })).toThrow()
  })

  it('mantém a ficha completa privada mesmo quando a Vitalidade é revelada', () => {
    const inimigo = criarInimigoDeModelo(modeloAntagonistaSchema.parse(modelo), { id: 'fada-1', nome: 'Guardiã' })
    inimigo.revelarVitalidade = true
    const visivel = filtrarCombateParaJogador(iniciarCombate([inimigo]), {
      jogadorId: 'jogador', meusPersonagemIds: [], coterieIdsDoJogador: [], coteriesPorPersonagem: {}, condicoesPersonagens: {},
    })
    expect(visivel.participantes[0].vitalidadeMax).toBe(inimigo.vitalidadeMax)
    expect(visivel.participantes[0]).not.toHaveProperty('fichaCompleta')
    expect(visivel.participantes[0]).not.toHaveProperty('paradas')
  })
})
