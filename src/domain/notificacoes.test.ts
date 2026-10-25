import { describe, expect, it } from 'vitest'

import { fichaNeofito, type Ficha } from './ficha'
import { detectarMudancasCondicao, notificacoesEventos } from './notificacoes'

describe('detectarMudancasCondicao', () => {
  const base: Ficha = fichaNeofito() // Vigor 1 (Vit = 4), Auto 1 + Det 1 (Vont = 2), Fome 1

  it('avisa a Fome chegando a 4 e a 5, sem repetir', () => {
    expect(detectarMudancasCondicao({ ...base, fome: 3 }, { ...base, fome: 4 })).toEqual(['fome_4'])
    expect(detectarMudancasCondicao({ ...base, fome: 4 }, { ...base, fome: 5 })).toEqual(['fome_5'])
    expect(detectarMudancasCondicao({ ...base, fome: 3 }, { ...base, fome: 5 })).toEqual(['fome_5'])
    expect(detectarMudancasCondicao({ ...base, fome: 5 }, { ...base, fome: 5 })).toEqual([])
    expect(detectarMudancasCondicao({ ...base, fome: 5 }, { ...base, fome: 4 })).toEqual([])
  })

  it('avisa a Vitalidade enchendo com qualquer dano', () => {
    const quase = { ...base, danoVitalidade: { superficial: 3, agravado: 0 } }
    expect(detectarMudancasCondicao(quase, { ...base, danoVitalidade: { superficial: 4, agravado: 0 } })).toEqual([
      'vitalidade_cheia',
    ])
    expect(detectarMudancasCondicao(quase, { ...base, danoVitalidade: { superficial: 3, agravado: 1 } })).toEqual([
      'vitalidade_cheia',
    ])
    // Cheia que só troca superficial por agravado não avisa de novo.
    const cheia = { ...base, danoVitalidade: { superficial: 4, agravado: 0 } }
    expect(detectarMudancasCondicao(cheia, { ...base, danoVitalidade: { superficial: 3, agravado: 1 } })).toEqual([])
  })

  it('avisa a Vitalidade e a Força de Vontade ficando toda curada', () => {
    const ferida = { ...base, danoVitalidade: { superficial: 1, agravado: 0 }, danoVontade: { superficial: 0, agravado: 1 } }
    expect(detectarMudancasCondicao(ferida, base)).toEqual(['vitalidade_curada', 'vontade_curada'])
    expect(detectarMudancasCondicao(base, base)).toEqual([])
  })

  it('avisa a Força de Vontade enchendo', () => {
    const antes = { ...base, danoVontade: { superficial: 1, agravado: 0 } }
    const depois = { ...base, danoVontade: { superficial: 2, agravado: 0 } }
    expect(detectarMudancasCondicao(antes, depois)).toEqual(['vontade_cheia'])
  })

  it('não avisa mudança no meio da trilha', () => {
    const antes = { ...base, fome: 1, danoVitalidade: { superficial: 1, agravado: 0 } }
    const depois = { ...base, fome: 2, danoVitalidade: { superficial: 2, agravado: 0 } }
    expect(detectarMudancasCondicao(antes, depois)).toEqual([])
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
    expect(notificacoesEventos.combateIniciado('Helena').texto).toBe(
      'Combate iniciado com Helena',
    )
    expect(notificacoesEventos.combateIniciado('Helena').destino).toEqual({ to: '/combate' })
    expect(notificacoesEventos.ressonanciaAplicada('Helena', 'Colérico (Fugaz)', 'id-1').texto).toBe(
      'Ressonância Atual aplicada a Helena: Colérico (Fugaz)',
    )
    expect(notificacoesEventos.compulsaoAplicada('Helena', 'Comando Régio', 'id-1').texto).toBe(
      'Compulsão Ativa aplicada a Helena: Comando Régio',
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
    expect(notificacoesEventos.mudancaCondicao('fome_5', 'Helena', 'id-1').texto).toBe('Helena chegou a Fome 5')
    expect(notificacoesEventos.mudancaCondicao('vitalidade_curada', 'Helena', 'id-1').texto).toBe(
      'Helena curou toda a Vitalidade',
    )
  })
})
