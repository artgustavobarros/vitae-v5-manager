import { describe, expect, it } from 'vitest'

import {
  adicionarParticipante,
  alternarCondicaoParticipante,
  alternarRevelarVitalidade,
  aplicarDanoInimigo,
  atualizarParticipanteInimigo,
  avancarTurno,
  calcularEstadoSaude,
  CONDICOES_COMBATE_V5,
  ehInimigoIncapacitado,
  filtrarCombateParaJogador,
  iniciarCombate,
  obterCondicaoCombate,
  obterProximoIndiceAtivo,
  removerParticipante,
  reordenarParticipantes,
  voltarTurno,
  type ParticipanteCombate,
  type ParticipanteInimigo,
} from './combate'

const mockPersonagem1: ParticipanteCombate = {
  id: 'p1',
  tipo: 'personagem',
  nome: 'Lucas',
  personagemId: 'char-1',
  ehPdn: false,
  condicoes: [],
}

const mockPersonagem2: ParticipanteCombate = {
  id: 'p2',
  tipo: 'personagem',
  nome: 'Valéria',
  personagemId: 'char-2',
  ehPdn: false,
  condicoes: [],
}

const mockInimigo: ParticipanteCombate = {
  id: 'i1',
  tipo: 'inimigo',
  nome: 'Cão Ghoul',
  vitalidadeMax: 5,
  danoVitalidade: { superficial: 0, agravado: 0 },
  vontadeMax: 3,
  danoVontade: { superficial: 0, agravado: 0 },
  paradas: { fisico: 4, social: 1, mental: 2, excepcionais: [] },
  especiais: [{ nome: 'Mordida Feroz', descricao: 'Morde causando dano agravado.' }],
  notas: 'Morde com força',
  revelarVitalidade: false,
  condicoes: [],
}

describe('Combate - Ciclo de Turnos e Rodadas', () => {
  it('recusa adicionar Torpor a um inimigo que não é vampiro', () => {
    const combate = iniciarCombate([mockInimigo])
    expect(() => alternarCondicaoParticipante(combate, mockInimigo.id, 'torpor'))
      .toThrow('Torpor')
    expect(() => aplicarDanoInimigo(combate, mockInimigo.id, 'vitalidade', { superficial: 0, agravado: 5 }, 'torpor'))
      .toThrow('Torpor')
  })

  it('permite remover uma tag de Torpor antiga de um inimigo não vampiro', () => {
    const combate = iniciarCombate([{ ...mockInimigo, condicoes: ['torpor'] }])
    const atualizado = alternarCondicaoParticipante(combate, mockInimigo.id, 'torpor')
    expect(atualizado.participantes[0].condicoes).toEqual([])
  })

  it('permite adicionar Torpor a um inimigo vampiro', () => {
    const combate = iniciarCombate([{ ...mockInimigo, categoria: 'Vampiro' }])
    const atualizado = alternarCondicaoParticipante(combate, mockInimigo.id, 'torpor')
    expect(atualizado.participantes[0].condicoes).toEqual(['torpor'])
  })

  it('inicia combate com rodada 1 e turno inicial no primeiro participante', () => {
    const combate = iniciarCombate([mockPersonagem1, mockPersonagem2, mockInimigo])
    expect(combate.rodada).toBe(1)
    expect(combate.turnoAtual).toBe(0)
    expect(combate.participantes).toHaveLength(3)
    expect(combate.ativo).toBe(true)
  })

  it('avança turnos um a um e incrementa a rodada após o último participante', () => {
    let combate = iniciarCombate([mockPersonagem1, mockPersonagem2, mockInimigo])
    expect(combate.turnoAtual).toBe(0)

    combate = avancarTurno(combate)
    expect(combate.turnoAtual).toBe(1)
    expect(combate.rodada).toBe(1)

    combate = avancarTurno(combate)
    expect(combate.turnoAtual).toBe(2)
    expect(combate.rodada).toBe(1)

    // Passou do último participante: vai para rodada 2 e volta ao primeiro
    combate = avancarTurno(combate)
    expect(combate.turnoAtual).toBe(0)
    expect(combate.rodada).toBe(2)
  })

  it('permite voltar turno e voltar rodada se necessário', () => {
    let combate = iniciarCombate([mockPersonagem1, mockPersonagem2])
    combate = avancarTurno(combate) // turno 1
    combate = avancarTurno(combate) // rodada 2, turno 0

    expect(combate.rodada).toBe(2)
    expect(combate.turnoAtual).toBe(0)

    combate = voltarTurno(combate)
    expect(combate.rodada).toBe(1)
    expect(combate.turnoAtual).toBe(1)

    combate = voltarTurno(combate)
    expect(combate.rodada).toBe(1)
    expect(combate.turnoAtual).toBe(0)

    // No primeiro turno da rodada 1, não volta além disso
    combate = voltarTurno(combate)
    expect(combate.rodada).toBe(1)
    expect(combate.turnoAtual).toBe(0)
  })
})

describe('Combate - Gerenciamento de Participantes', () => {
  it('reordena participantes mantendo o participante que está agindo ativo', () => {
    const combate = iniciarCombate([mockPersonagem1, mockPersonagem2, mockInimigo])
    // Lucas (p1) está agindo no turno 0
    const reordenado = reordenarParticipantes(combate, ['i1', 'p1', 'p2'])
    expect(reordenado.participantes.map((p) => p.id)).toEqual(['i1', 'p1', 'p2'])
    // Lucas ainda deve ser o ativo, agora no índice 1
    expect(reordenado.turnoAtual).toBe(1)
  })

  it('adiciona participante e remove participante ajustando índice de turno', () => {
    let combate = iniciarCombate([mockPersonagem1, mockPersonagem2])
    combate = adicionarParticipante(combate, mockInimigo)
    expect(combate.participantes).toHaveLength(3)

    // Lucas agindo no índice 0. Se removermos Lucas, turno continua válido
    combate = removerParticipante(combate, 'p1')
    expect(combate.participantes).toHaveLength(2)
    expect(combate.turnoAtual).toBe(0)
    expect(combate.participantes[0].id).toBe('p2')
  })

  it('aplica dano a inimigo com corte dentro dos limites máximos', () => {
    let combate = iniciarCombate([mockInimigo])
    combate = aplicarDanoInimigo(combate, 'i1', 'vitalidade', { superficial: 3, agravado: 1 })
    const inimigo = combate.participantes[0]
    if (inimigo.tipo === 'inimigo') {
      expect(inimigo.danoVitalidade).toEqual({ superficial: 3, agravado: 1 })
    }

    // Dano que excede o máximo de 5:
    combate = aplicarDanoInimigo(combate, 'i1', 'vitalidade', { superficial: 4, agravado: 3 })
    const inimigoExcedido = combate.participantes[0]
    if (inimigoExcedido.tipo === 'inimigo') {
      expect(inimigoExcedido.danoVitalidade.agravado).toBe(3)
      expect(inimigoExcedido.danoVitalidade.superficial).toBe(2) // 5 - 3 = 2
    }
  })

  it('alterna liberação de vitalidade do inimigo para jogadores', () => {
    let combate = iniciarCombate([mockInimigo])
    expect((combate.participantes[0] as ParticipanteInimigo).revelarVitalidade).toBe(false)

    combate = alternarRevelarVitalidade(combate, 'i1', true)
    expect((combate.participantes[0] as ParticipanteInimigo).revelarVitalidade).toBe(true)
  })
})

describe('Combate - Visibilidade para Jogadores', () => {
  it('oculta vitalidade do inimigo quando não liberada pelo narrador', () => {
    const combate = iniciarCombate([mockPersonagem1, mockInimigo])
    const visaoJogador = filtrarCombateParaJogador(combate, {
      jogadorId: 'user-1',
      meusPersonagemIds: ['char-1'],
      coterieIdsDoJogador: ['cot-1'],
      coteriesPorPersonagem: { 'char-1': ['cot-1'] },
      condicoesPersonagens: {
        'char-1': {
          compartilhaCondicao: false,
          vitalidadeMax: 6,
          vontadeMax: 5,
          danoVitalidade: { superficial: 1, agravado: 0 },
          danoVontade: { superficial: 0, agravado: 0 },
          fome: 2,
        },
      },
    })

    const inimigo = visaoJogador.participantes.find((p) => p.tipo === 'inimigo')!
    expect(inimigo.vitalidadeOculta).toBe(true)
    expect(inimigo.danoVitalidade).toBeUndefined()
    expect(inimigo.vitalidadeMax).toBeUndefined()
  })

  it('mostra vitalidade do inimigo se narrador liberou', () => {
    const inimigoLiberado = { ...mockInimigo, revelarVitalidade: true }
    const combate = iniciarCombate([inimigoLiberado])
    const visaoJogador = filtrarCombateParaJogador(combate, {
      jogadorId: 'user-1',
      meusPersonagemIds: [],
      coterieIdsDoJogador: [],
      coteriesPorPersonagem: {},
      condicoesPersonagens: {},
    })

    const inimigo = visaoJogador.participantes.find((p) => p.tipo === 'inimigo')!
    expect(inimigo.vitalidadeOculta).toBe(false)
    expect(inimigo.vitalidadeMax).toBe(5)
    expect(inimigo.danoVitalidade).toEqual({ superficial: 0, agravado: 0 })
  })

  it('aplica regra de compartilhamento de Condição para outros personagens no combate', () => {
    const combate = iniciarCombate([mockPersonagem1, mockPersonagem2])
    const visaoJogador = filtrarCombateParaJogador(combate, {
      jogadorId: 'user-1',
      meusPersonagemIds: ['char-1'],
      coterieIdsDoJogador: ['cot-1'],
      coteriesPorPersonagem: {
        'char-1': ['cot-1'],
        'char-2': ['cot-1'], // divide coterie com user-1
      },
      condicoesPersonagens: {
        'char-1': {
          compartilhaCondicao: false, // mas é o próprio personagem do user-1, então ele vê!
          vitalidadeMax: 6,
          vontadeMax: 5,
          danoVitalidade: { superficial: 1, agravado: 0 },
          danoVontade: { superficial: 0, agravado: 0 },
          fome: 2,
        },
        'char-2': {
          compartilhaCondicao: false, // char-2 não compartilha Condição! Logo deve vir oculto para char-1
          vitalidadeMax: 7,
          vontadeMax: 4,
          danoVitalidade: { superficial: 2, agravado: 0 },
          danoVontade: { superficial: 0, agravado: 0 },
          fome: 1,
        },
      },
    })

    const p1 = visaoJogador.participantes.find((p) => p.id === 'p1')!
    expect(p1.condicaoOculta).toBe(false)
    expect(p1.condicao?.fome).toBe(2)

    const p2 = visaoJogador.participantes.find((p) => p.id === 'p2')!
    expect(p2.condicaoOculta).toBe(true)
    expect(p2.condicao).toBeUndefined()
  })

  it('permite customizar participante inimigo diretamente no combate', () => {
    const combate = iniciarCombate([mockInimigo])
    const atualizado = atualizarParticipanteInimigo(combate, 'i1', {
      nome: 'Cão Ghoul Alfa',
      vitalidadeMax: 8,
      especiais: [
        { nome: 'Mordida Feroz', descricao: 'Morde causando dano agravado.' },
        { nome: 'Uivo Aterrorizante', descricao: 'Aterroriza os oponentes.' },
      ],
      notas: 'Líder da matilha, possui olhos vermelhos.',
    })

    const inimigo = atualizado.participantes[0] as ParticipanteInimigo
    expect(inimigo.nome).toBe('Cão Ghoul Alfa')
    expect(inimigo.vitalidadeMax).toBe(8)
    expect(inimigo.especiais).toHaveLength(2)
    expect(inimigo.especiais[1].nome).toBe('Uivo Aterrorizante')
    expect(inimigo.notas).toBe('Líder da matilha, possui olhos vermelhos.')
  })
})

describe('Combate - Estado de Saúde e Condições V5', () => {
  it('calcula corretamente os estados de saúde da vitalidade', () => {
    // 0 dano -> Saudável
    const saudavel = calcularEstadoSaude(6, { superficial: 0, agravado: 0 })
    expect(saudavel.estado).toBe('saudavel')
    expect(saudavel.rotulo).toBe('Saudável')

    // < 50% dano -> Escoriado
    const escoriado = calcularEstadoSaude(6, { superficial: 2, agravado: 0 })
    expect(escoriado.estado).toBe('escoriado')
    expect(escoriado.rotulo).toBe('Escoriado')

    // >= 50% dano e < max -> Ferido
    const ferido = calcularEstadoSaude(6, { superficial: 3, agravado: 0 })
    expect(ferido.estado).toBe('ferido')
    expect(ferido.rotulo).toBe('Ferido')

    // total == max, agravado < max -> Debilitado (-2 dados físicos)
    const debilitado = calcularEstadoSaude(6, { superficial: 5, agravado: 1 })
    expect(debilitado.estado).toBe('debilitado')
    expect(debilitado.penalidade).toContain('-2')

    // agravado == max -> Torpor (se vampiro)
    const torpor = calcularEstadoSaude(6, { superficial: 0, agravado: 6 }, true)
    expect(torpor.estado).toBe('torpor')
    expect(torpor.rotulo).toBe('Torpor')

    // agravado == max -> Morto (se mortal)
    const morto = calcularEstadoSaude(6, { superficial: 0, agravado: 6 }, false)
    expect(morto.estado).toBe('morto')
    expect(morto.rotulo).toContain('Morto')
  })

  it('permite alternar condições V5 em participantes (adicionar e remover)', () => {
    let combate = iniciarCombate([mockPersonagem1])
    expect(combate.participantes[0].condicoes).toEqual([])

    // Adiciona condição 'agarrado'
    combate = alternarCondicaoParticipante(combate, 'p1', 'agarrado')
    expect(combate.participantes[0].condicoes).toEqual(['agarrado'])

    // Adiciona condição 'em-chamas'
    combate = alternarCondicaoParticipante(combate, 'p1', 'em-chamas')
    expect(combate.participantes[0].condicoes).toEqual(['agarrado', 'em-chamas'])

    // Alternar 'agarrado' novamente deve remover a condição
    combate = alternarCondicaoParticipante(combate, 'p1', 'agarrado')
    expect(combate.participantes[0].condicoes).toEqual(['em-chamas'])
  })

  it('fornece catálogo de condições V5 com dados mecânicos', () => {
    expect(CONDICOES_COMBATE_V5.length).toBeGreaterThan(5)
    const agarrado = obterCondicaoCombate('agarrado')
    expect(agarrado).toBeDefined()
    expect(agarrado?.efeitoMecanico).toContain('-2 dados')
  })

  it('propaga ehMeu e condicoes no filtro de combate para jogador', () => {
    const p1ComCondicoes: ParticipanteCombate = {
      ...mockPersonagem1,
      condicoes: ['agarrado', 'em-chamas'],
    }
    const p2ComCondicoes: ParticipanteCombate = {
      ...mockPersonagem2,
      condicoes: ['caido'],
    }
    const inimigoComCondicoes: ParticipanteCombate = {
      ...mockInimigo,
      condicoes: ['atordoado'],
    }

    const combate = iniciarCombate([p1ComCondicoes, p2ComCondicoes, inimigoComCondicoes])
    const visao = filtrarCombateParaJogador(combate, {
      jogadorId: 'user-1',
      meusPersonagemIds: ['char-1'],
      coterieIdsDoJogador: [],
      coteriesPorPersonagem: {},
      condicoesPersonagens: {},
    })

    const p1 = visao.participantes.find((p) => p.id === 'p1')!
    expect(p1.ehMeu).toBe(true)
    expect(p1.condicoes).toEqual(['agarrado', 'em-chamas'])

    const p2 = visao.participantes.find((p) => p.id === 'p2')!
    expect(p2.ehMeu).toBe(false)
    expect(p2.condicoes).toEqual(['caido'])

    const ini = visao.participantes.find((p) => p.id === 'i1')!
    expect(ini.condicoes).toEqual(['atordoado'])
  })

  it('mostra tags de saude sem revelar os valores da Condicao oculta, conforme pedido do Narrador', () => {
    const combate = iniciarCombate([mockPersonagem1, mockInimigo])
    const visao = filtrarCombateParaJogador(combate, {
      jogadorId: 'user-outro',
      meusPersonagemIds: [],
      coterieIdsDoJogador: [],
      coteriesPorPersonagem: {},
      condicoesPersonagens: {
        'char-1': {
          compartilhaCondicao: false,
          vitalidadeMax: 6,
          vontadeMax: 5,
          danoVitalidade: { superficial: 3, agravado: 0 },
          danoVontade: { superficial: 0, agravado: 0 },
          fome: 2,
        },
      },
    })

    const ini = visao.participantes.find((p) => p.tipo === 'inimigo')!
    expect(ini.vitalidadeOculta).toBe(true)
    expect(ini.estadoSaude).toBeDefined()
    expect(ini.estadoSaude?.rotulo).toBe('Saudável')

    const p1 = visao.participantes.find((p) => p.personagemId === 'char-1')!
    expect(p1.condicaoOculta).toBe(true)
    expect(p1.estadoSaude?.rotulo).toBe('Ferido')
    expect(p1.condicao).toBeUndefined()
    expect(p1.danoVitalidade).toBeUndefined()
    expect(p1.vitalidadeMax).toBeUndefined()
  })

  it('diferencia torpor de vampiro e desacordado/morto de carniçal e mortal', () => {
    // Mortal com tag 'torpor' não entra em torpor: vira Incapacitado
    const mortalComTagTorpor = calcularEstadoSaude(
      6,
      { superficial: 0, agravado: 0 },
      false,
      ['torpor'],
    )
    expect(mortalComTagTorpor.rotulo).toBe('Incapacitado')
    expect(mortalComTagTorpor.estado).toBe('morto')
    // Vampiro com agravado max -> Torpor
    const saudeVampiro = calcularEstadoSaude(6, { superficial: 0, agravado: 6 }, true)
    expect(saudeVampiro.rotulo).toBe('Torpor')

    // Carniçal/Mortal com agravado max -> Incapacitado / Morto (nunca torpor)
    const saudeMortal = calcularEstadoSaude(6, { superficial: 0, agravado: 6 }, false)
    expect(saudeMortal.rotulo).toBe('Incapacitado / Morto')
    expect(saudeMortal.rotulo).not.toContain('Torpor')

    // Com condição explícita 'desacordado' -> Incapacitado
    const saudeDesacordado = calcularEstadoSaude(
      6,
      { superficial: 0, agravado: 6 },
      false,
      ['desacordado'],
    )
    expect(saudeDesacordado.rotulo).toBe('Incapacitado')

    // Com condição explícita 'morto' -> Morto
    const saudeMorto = calcularEstadoSaude(
      6,
      { superficial: 0, agravado: 6 },
      false,
      ['morto'],
    )
    expect(saudeMorto.rotulo).toBe('Morto')

    // Vampiro com 'morto' -> Morte Final
    const saudeMorteFinal = calcularEstadoSaude(
      6,
      { superficial: 0, agravado: 6 },
      true,
      ['morto'],
    )
    expect(saudeMorteFinal.rotulo).toBe('Morte Final')
  })

  it('identifica inimigo incapacitado e remove da fila ativa de turnos', () => {
    const iniAtivo: ParticipanteCombate = { ...mockInimigo, id: 'i-ativo' }
    const iniIncapacitado: ParticipanteCombate = {
      ...mockInimigo,
      id: 'i-morto',
      danoVitalidade: { superficial: 0, agravado: 5 },
      condicoes: ['morto'],
    }
    const iniDormindo: ParticipanteCombate = {
      ...mockInimigo,
      id: 'i-sono',
      condicoes: ['desacordado'],
    }

    expect(ehInimigoIncapacitado(iniAtivo)).toBe(false)
    expect(ehInimigoIncapacitado(iniIncapacitado)).toBe(true)
    expect(ehInimigoIncapacitado(iniDormindo)).toBe(true)
    expect(ehInimigoIncapacitado(mockPersonagem1)).toBe(false)

    // Fila: P1 (0), IniAtivo (1), IniIncapacitado (2), P2 (3)
    let combate = iniciarCombate([mockPersonagem1, iniAtivo, iniIncapacitado, mockPersonagem2])
    expect(combate.turnoAtual).toBe(0)

    // Avança: vai para 1 (iniAtivo)
    combate = avancarTurno(combate)
    expect(combate.turnoAtual).toBe(1)

    // Avança: pula 2 (iniIncapacitado) e vai direto para 3 (mockPersonagem2)
    combate = avancarTurno(combate)
    expect(combate.turnoAtual).toBe(3)

    // Próximo índice ativo a partir de 3 pula 2 e volta para 0
    expect(obterProximoIndiceAtivo(combate)).toBe(0)

    // Avança: pula iniIncapacitado, incrementa rodada e vai para 0
    combate = avancarTurno(combate)
    expect(combate.rodada).toBe(2)
    expect(combate.turnoAtual).toBe(0)

    // Voltar turno: de 0 na rodada 2 volta para o último ativo (3) na rodada 1
    combate = voltarTurno(combate)
    expect(combate.rodada).toBe(1)
    expect(combate.turnoAtual).toBe(3)
  })

  it('ajusta turnoAtual automaticamente se o inimigo ativo for incapacitado', () => {
    const combate = iniciarCombate([mockPersonagem1, mockInimigo, mockPersonagem2])
    // Turno está no inimigo (índice 1)
    const combateNoInimigo = { ...combate, turnoAtual: 1 }

    // Aplica dano fatal com condição 'desacordado'
    const atualizado = aplicarDanoInimigo(
      combateNoInimigo,
      mockInimigo.id,
      'vitalidade',
      { superficial: 0, agravado: 5 },
      'desacordado',
    )

    // Inimigo ficou incapacitado, turno deve ter avançado automaticamente para o próximo ativo (mockPersonagem2 no índice 2)
    expect(atualizado.turnoAtual).toBe(2)
    expect(atualizado.participantes[1].condicoes).toContain('desacordado')
  })
})
