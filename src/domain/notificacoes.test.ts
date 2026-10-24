import { describe, expect, it } from 'vitest'

import { fichaNeofito, type Ficha } from './ficha'
import { detectarTransicaoCondicaoCritica, notificacoesEventos } from './notificacoes'

describe('detectarTransicaoCondicaoCritica', () => {
  const base: Ficha = fichaNeofito() // Vigor 1 (Vit = 4), Auto 1 + Det 1 (Vont = 2), Fome 1

  it('detecta transição para Fome 5', () => {
    const antes = { ...base, fome: 4 }
    const depois = { ...base, fome: 5 }
    expect(detectarTransicaoCondicaoCritica(antes, depois)).toBe('fome_5')

    // Se já estava em Fome 5, não repete
    expect(detectarTransicaoCondicaoCritica(depois, depois)).toBeNull()
  })

  it('detecta transição para Vitalidade toda preenchida', () => {
    // Vit = 4 (Vigor 1 + 3)
    const antes = { ...base, danoVitalidade: { superficial: 3, agravado: 0 } }
    const depois = { ...base, danoVitalidade: { superficial: 4, agravado: 0 } }
    expect(detectarTransicaoCondicaoCritica(antes, depois)).toBe('vitalidade_cheia')
    expect(detectarTransicaoCondicaoCritica(depois, depois)).toBeNull()
  })

  it('prioriza dano agravado total sobre preenchimento misto', () => {
    const antes = { ...base, danoVitalidade: { superficial: 0, agravado: 3 } }
    const depois = { ...base, danoVitalidade: { superficial: 0, agravado: 4 } }
    expect(detectarTransicaoCondicaoCritica(antes, depois)).toBe('vitalidade_agravada')
  })

  it('detecta transição para Força de Vontade toda preenchida', () => {
    // Vontade = 2 (Autocontrole 1 + Determinação 1)
    const antes = { ...base, danoVontade: { superficial: 1, agravado: 0 } }
    const depois = { ...base, danoVontade: { superficial: 2, agravado: 0 } }
    expect(detectarTransicaoCondicaoCritica(antes, depois)).toBe('vontade_cheia')
  })

  it('retorna null se não atingiu estado crítico', () => {
    const antes = { ...base, fome: 1 }
    const depois = { ...base, fome: 2 }
    expect(detectarTransicaoCondicaoCritica(antes, depois)).toBeNull()
  })
})

describe('notificacoesEventos', () => {
  it('formata notificações do Jogador conforme acordado', () => {
    expect(notificacoesEventos.atribuicao('Helena').texto).toBe('O Narrador atribuiu Helena a você')
    expect(notificacoesEventos.conviteCoterie('Helena', 'O Grupo').texto).toBe(
      'Convite para Helena entrar em O Grupo',
    )
    expect(notificacoesEventos.removidoCoterie('Helena', 'O Grupo', 'id-1').texto).toBe(
      'Helena foi removido de O Grupo',
    )
    expect(notificacoesEventos.coterieApagada('O Grupo', 'id-1').texto).toBe(
      'A Coterie O Grupo foi apagada',
    )
    expect(notificacoesEventos.narradorEditouFicha('Helena', 'id-1').texto).toBe(
      'O Narrador editou a Ficha de Helena',
    )
  })

  it('formata notificações do Narrador conforme acordado', () => {
    expect(notificacoesEventos.novoJogador('Rui').texto).toBe('Rui entrou na Crônica')
    expect(notificacoesEventos.personagemConcluido('Rui', 'Helena', 'id-1').texto).toBe(
      'Rui concluiu Helena',
    )
    expect(notificacoesEventos.atribuicaoAceita('Rui', 'Helena', 'id-1').texto).toBe(
      'Rui aceitou Helena',
    )
    expect(notificacoesEventos.atribuicaoRecusada('Rui', 'Helena', 'id-1').texto).toBe(
      'Rui recusou Helena',
    )
    expect(notificacoesEventos.conviteCoterieAceito('Helena', 'O Grupo', 'cot-1').texto).toBe(
      'Helena entrou em O Grupo',
    )
    expect(
      notificacoesEventos.conviteCoterieRecusado('Rui', 'Helena', 'O Grupo', 'cot-1').texto,
    ).toBe('Rui recusou o convite de O Grupo para Helena')
    expect(notificacoesEventos.personagemSaiuCoterie('Helena', 'O Grupo', 'cot-1').texto).toBe(
      'Helena saiu de O Grupo',
    )
    expect(notificacoesEventos.condicaoCritica('fome_5', 'Helena', 'id-1').texto).toBe(
      'Helena chegou a Fome 5',
    )
    expect(notificacoesEventos.condicaoCritica('vitalidade_agravada', 'Helena', 'id-1').texto).toBe(
      'Helena está com a Vitalidade toda em dano agravado',
    )
  })
})
