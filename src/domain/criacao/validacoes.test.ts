import { describe, expect, it } from 'vitest'
import type { Atributo, Disciplina, Habilidade } from '../ficha'
import { HABILIDADES } from '../ficha'
import { TIPOS_PREDADOR } from '../catalogo/predadores'
import type { DadosCriacao, Especializacao, PerfilHabilidade } from './tipos'
import {
  validarAtributosCriacao,
  validarConviccoes,
  validarCriacaoCompleta,
  validarDisciplinasCriacao,
  validarHabilidadesCriacao,
  validarVantagensDefeitosCriacao,
} from './validacoes'
import { aplicarPredador } from './predador-aplicacao'

function atributosValidos(): Record<Atributo, number> {
  return {
    forca: 4,
    destreza: 3,
    vigor: 3,
    carisma: 3,
    manipulacao: 2,
    autocontrole: 2,
    inteligencia: 2,
    raciocinio: 2,
    determinacao: 1,
  }
}

function habilidadesValidas(perfil: PerfilHabilidade): Record<Habilidade, number> {
  const base = Object.fromEntries(HABILIDADES.map((h) => [h.id, 0])) as Record<Habilidade, number>

  if (perfil === 'especialista') {
    // 1x4, 3x3, 3x2, 3x1
    base['armas-brancas'] = 4
    base['atletismo'] = 3
    base['briga'] = 3
    base['erudicao'] = 3
    base['furtividade'] = 2
    base['intimidacao'] = 2
    base['persuasao'] = 2
    base['manha'] = 1
    base['subterfugio'] = 1
    base['percepcao'] = 1
  } else if (perfil === 'equilibrado') {
    // 3x3, 5x2, 7x1
    base['atletismo'] = 3
    base['briga'] = 3
    base['erudicao'] = 3
    base['armas-brancas'] = 2
    base['furtividade'] = 2
    base['intimidacao'] = 2
    base['persuasao'] = 2
    base['manha'] = 2
    base['subterfugio'] = 1
    base['percepcao'] = 1
    base['conducao'] = 1
    base['ladroagem'] = 1
    base['sobrevivencia'] = 1
    base['etiqueta'] = 1
    base['lideranca'] = 1
  } else {
    // generalista: 1x3, 8x2, 10x1
    base['erudicao'] = 3
    base['armas-brancas'] = 2
    base['atletismo'] = 2
    base['briga'] = 2
    base['furtividade'] = 2
    base['intimidacao'] = 2
    base['persuasao'] = 2
    base['manha'] = 2
    base['subterfugio'] = 2
    base['percepcao'] = 1
    base['conducao'] = 1
    base['ladroagem'] = 1
    base['sobrevivencia'] = 1
    base['etiqueta'] = 1
    base['lideranca'] = 1
    base['investigacao'] = 1
    base['medicina'] = 1
    base['ocultismo'] = 1
    base['politica'] = 1
  }

  return base
}

const gatoDeBeco = TIPOS_PREDADOR.find((p) => p.id === 'tipo-predador-gato-de-beco')!
const sanguessuga = TIPOS_PREDADOR.find((p) => p.id === 'tipo-predador-sanguessuga')!
const ladraoDeBolsas = TIPOS_PREDADOR.find((p) => p.id === 'tipo-predador-ladrao-de-bolsas')!

describe('validarAtributosCriacao', () => {
  it('aprova distribuição padrão V5 (1x4, 3x3, 4x2, 1x1)', () => {
    const res = validarAtributosCriacao(atributosValidos())
    expect(res.valido).toBe(true)
    expect(res.erros).toHaveLength(0)
    expect(res.slots).toEqual({
      4: { esperado: 1, atual: 1 },
      3: { esperado: 3, atual: 3 },
      2: { esperado: 4, atual: 4 },
      1: { esperado: 1, atual: 1 },
    })
  })

  it('rejeita quando contagem de slots está incorreta', () => {
    const invalidos = atributosValidos()
    invalidos.forca = 3 // agora são 4 atributos no 3 e 0 no 4
    const res = validarAtributosCriacao(invalidos)
    expect(res.valido).toBe(false)
    expect(res.erros.length).toBeGreaterThan(0)
    expect(res.slots[4].atual).toBe(0)
    expect(res.slots[3].atual).toBe(4)
  })

  it('rejeita valor fora dos limites de criação (menor que 1 ou maior que 4)', () => {
    const invalidos = atributosValidos()
    invalidos.forca = 5
    invalidos.determinacao = 0
    const res = validarAtributosCriacao(invalidos)
    expect(res.valido).toBe(false)
    expect(res.erros.some((e) => e.includes('Força') || e.includes('forca'))).toBe(true)
    expect(res.erros.some((e) => e.includes('Determinação') || e.includes('determinacao'))).toBe(true)
  })

  it('rejeita se faltar algum atributo', () => {
    const incompletos = { ...atributosValidos() }
    delete (incompletos as any).vigor
    const res = validarAtributosCriacao(incompletos)
    expect(res.valido).toBe(false)
    expect(res.erros.some((e) => e.includes('Vigor') || e.includes('vigor'))).toBe(true)
  })
})

describe('validarHabilidadesCriacao', () => {
  const espValidas: Especializacao[] = [
    { habilidade: 'erudicao', especializacao: 'História Vampírica', origem: 'gratis' },
    { habilidade: 'briga', especializacao: 'Golpes Baixos', origem: 'livre' },
  ]

  it('aprova perfil Especialista (1x4, 3x3, 3x2, 3x1)', () => {
    const habs = habilidadesValidas('especialista')
    const res = validarHabilidadesCriacao('especialista', habs, espValidas)
    expect(res.valido).toBe(true)
    expect(res.erros).toHaveLength(0)
    expect(res.slots[4]).toEqual({ esperado: 1, atual: 1 })
    expect(res.slots[3]).toEqual({ esperado: 3, atual: 3 })
    expect(res.slots[2]).toEqual({ esperado: 3, atual: 3 })
    expect(res.slots[1]).toEqual({ esperado: 3, atual: 3 })
  })

  it('aprova perfil Equilibrado (3x3, 5x2, 7x1)', () => {
    const habs = habilidadesValidas('equilibrado')
    const res = validarHabilidadesCriacao('equilibrado', habs, espValidas)
    expect(res.valido).toBe(true)
    expect(res.erros).toHaveLength(0)
    expect(res.slots[4]).toEqual({ esperado: 0, atual: 0 })
    expect(res.slots[3]).toEqual({ esperado: 3, atual: 3 })
    expect(res.slots[2]).toEqual({ esperado: 5, atual: 5 })
    expect(res.slots[1]).toEqual({ esperado: 7, atual: 7 })
  })

  it('aprova perfil Generalista (1x3, 8x2, 10x1)', () => {
    const habs = habilidadesValidas('generalista')
    const res = validarHabilidadesCriacao('generalista', habs, espValidas)
    expect(res.valido).toBe(true)
    expect(res.erros).toHaveLength(0)
    expect(res.slots[4]).toEqual({ esperado: 0, atual: 0 })
    expect(res.slots[3]).toEqual({ esperado: 1, atual: 1 })
    expect(res.slots[2]).toEqual({ esperado: 8, atual: 8 })
    expect(res.slots[1]).toEqual({ esperado: 10, atual: 10 })
  })

  it('rejeita alocação incorreta de slots para o perfil', () => {
    const habs = habilidadesValidas('especialista')
    habs['armas-brancas'] = 3 // agora são 0 no 4 e 4 no 3
    const res = validarHabilidadesCriacao('especialista', habs, espValidas)
    expect(res.valido).toBe(false)
    expect(res.erros.length).toBeGreaterThan(0)
  })

  it('rejeita valor maior que 4 ou negativo', () => {
    const habs = habilidadesValidas('especialista')
    habs['armas-brancas'] = 5
    habs['atletismo'] = -1
    const res = validarHabilidadesCriacao('especialista', habs, espValidas)
    expect(res.valido).toBe(false)
  })

  it('rejeita especialização em perícia com 0 pontos', () => {
    const habs = habilidadesValidas('especialista')
    const espInvalidas: Especializacao[] = [
      { habilidade: 'erudicao', especializacao: 'História', origem: 'gratis' },
      { habilidade: 'tecnologia', especializacao: 'Hacking', origem: 'livre' }, // tecnologia é 0
    ]
    const res = validarHabilidadesCriacao('especialista', habs, espInvalidas)
    expect(res.valido).toBe(false)
    expect(res.erros.some((e) => e.includes('Tecnologia') || e.includes('tecnologia'))).toBe(true)
  })

  it('rejeita especialização grátis fora de erudicao/oficios/performance/ciencia', () => {
    const habs = habilidadesValidas('especialista')
    const espInvalidas: Especializacao[] = [
      { habilidade: 'furtividade', especializacao: 'Sombras', origem: 'gratis' }, // não é acadêmica
      { habilidade: 'briga', especializacao: 'Socos', origem: 'livre' },
    ]
    const res = validarHabilidadesCriacao('especialista', habs, espInvalidas)
    expect(res.valido).toBe(false)
  })

  it('rejeita especialização com texto vazio', () => {
    const habs = habilidadesValidas('especialista')
    const espVazia: Especializacao[] = [
      { habilidade: 'erudicao', especializacao: '   ', origem: 'gratis' },
      { habilidade: 'briga', especializacao: 'Socos', origem: 'livre' },
    ]
    const res = validarHabilidadesCriacao('especialista', habs, espVazia)
    expect(res.valido).toBe(false)
  })

  it('ignora especializações de origem predador na contagem de requisitos iniciais', () => {
    const habs = habilidadesValidas('especialista')
    const espComPredador: Especializacao[] = [
      ...espValidas,
      { habilidade: 'manha', especializacao: 'Contrabando', origem: 'predador' },
    ]
    const res = validarHabilidadesCriacao('especialista', habs, espComPredador)
    expect(res.valido).toBe(true)
  })
})

describe('validarDisciplinasCriacao', () => {
  it('aprova distribuição 2 e 1 com poderes válidos para clã padrão (Brujah: Celeridade e Potência)', () => {
    const disciplinas = [
      {
        id: 'celeridade' as Disciplina,
        nivel: 2,
        poderes: ['celeridade-1-graca-felina', 'celeridade-2-ligeireza'],
      },
      {
        id: 'potencia' as Disciplina,
        nivel: 1,
        poderes: ['potencia-1-corpo-letal'],
      },
    ]
    const res = validarDisciplinasCriacao('brujah', disciplinas)
    expect(res.valido).toBe(true)
    expect(res.erros).toHaveLength(0)
  })

  it('rejeita disciplina fora do clã padrão', () => {
    const disciplinas = [
      {
        id: 'animalismo' as Disciplina, // Brujah não tem animalismo
        nivel: 2,
        poderes: ['animalismo-1-ligacao-com-animais', 'animalismo-2-sussurros-selvagens'],
      },
      {
        id: 'potencia' as Disciplina,
        nivel: 1,
        poderes: ['potencia-1-corpo-letal'],
      },
    ]
    const res = validarDisciplinasCriacao('brujah', disciplinas)
    expect(res.valido).toBe(false)
    expect(res.erros.some((e) => e.includes('Animalismo') || e.includes('animalismo'))).toBe(true)
  })

  it('permite quaisquer disciplinas para Caitiff', () => {
    const disciplinas = [
      {
        id: 'animalismo' as Disciplina,
        nivel: 2,
        poderes: ['animalismo-1-sentir-a-besta', 'animalismo-2-sussurros-selvagens'],
      },
      {
        id: 'fortitude' as Disciplina,
        nivel: 1,
        poderes: ['fortitude-1-resiliencia'],
      },
    ]
    const res = validarDisciplinasCriacao('caitiff', disciplinas)
    expect(res.valido).toBe(true)
  })

  it('rejeita disciplinas normais para Sangue-Ralo', () => {
    const disciplinas = [
      {
        id: 'potencia' as Disciplina,
        nivel: 1,
        poderes: ['potencia-1-corpo-letal'],
      },
    ]
    const res = validarDisciplinasCriacao('sangue-ralo', disciplinas)
    expect(res.valido).toBe(false)
    expect(res.erros.some((e) => e.includes('Sangue-Ralo'))).toBe(true)
  })

  it('aprova Sangue-Ralo sem disciplinas normais', () => {
    const res = validarDisciplinasCriacao('sangue-ralo', [])
    expect(res.valido).toBe(true)
  })

  it('rejeita distribuição de níveis diferente de 2 e 1 (ex.: 2 e 2, ou 1 e 1, ou 3 e 0)', () => {
    const disciplinas = [
      {
        id: 'celeridade' as Disciplina,
        nivel: 2,
        poderes: ['celeridade-1-graca-felina', 'celeridade-2-ligeireza'],
      },
      {
        id: 'potencia' as Disciplina,
        nivel: 2,
        poderes: ['potencia-1-corpo-letal', 'potencia-1-salto-prodigioso'],
      },
    ]
    const res = validarDisciplinasCriacao('brujah', disciplinas)
    expect(res.valido).toBe(false)
  })

  it('rejeita se quantidade de poderes for diferente do nível da disciplina', () => {
    const disciplinas = [
      {
        id: 'celeridade' as Disciplina,
        nivel: 2,
        poderes: ['celeridade-1-graca-felina'], // falta 1 poder
      },
      {
        id: 'potencia' as Disciplina,
        nivel: 1,
        poderes: ['potencia-1-corpo-letal'],
      },
    ]
    const res = validarDisciplinasCriacao('brujah', disciplinas)
    expect(res.valido).toBe(false)
  })

  it('rejeita poder com nível maior que o nível da disciplina', () => {
    const disciplinas = [
      {
        id: 'celeridade' as Disciplina,
        nivel: 1,
        poderes: ['celeridade-2-ligeireza'], // poder nível 2 em disciplina nível 1
      },
      {
        id: 'potencia' as Disciplina,
        nivel: 2,
        poderes: ['potencia-1-corpo-letal', 'potencia-1-salto-prodigioso'],
      },
    ]
    const res = validarDisciplinasCriacao('brujah', disciplinas)
    expect(res.valido).toBe(false)
  })

  it('rejeita poder que pertence a outra disciplina', () => {
    const disciplinas = [
      {
        id: 'celeridade' as Disciplina,
        nivel: 2,
        poderes: ['celeridade-1-graca-felina', 'potencia-1-corpo-letal'],
      },
      {
        id: 'potencia' as Disciplina,
        nivel: 1,
        poderes: ['potencia-1-salto-prodigioso'],
      },
    ]
    const res = validarDisciplinasCriacao('brujah', disciplinas)
    expect(res.valido).toBe(false)
  })

  it('valida amálgama: rejeita se amálgama não for atendido', () => {
    // ofuscacao-2-quimerismo exige presenca nível 1
    // Ravnos tem Animalismo, Ofuscação, Presença
    const disciplinasSemAmalgama = [
      {
        id: 'ofuscacao' as Disciplina,
        nivel: 2,
        poderes: ['ofuscacao-1-manto-de-sombras', 'ofuscacao-2-quimerismo'],
      },
      {
        id: 'animalismo' as Disciplina,
        nivel: 1,
        poderes: ['animalismo-1-ligacao-com-animais'],
      },
    ]
    const res = validarDisciplinasCriacao('ravnos', disciplinasSemAmalgama)
    expect(res.valido).toBe(false)
    expect(res.erros.some((e) => e.includes('amálgama') || e.includes('Presença') || e.includes('presenca'))).toBe(true)
  })

  it('valida amálgama: aprova se amálgama for atendido', () => {
    // Ravnos com Ofuscação 2 e Presença 1 atende Quimerismo
    const disciplinasComAmalgama = [
      {
        id: 'ofuscacao' as Disciplina,
        nivel: 2,
        poderes: ['ofuscacao-1-manto-de-sombras', 'ofuscacao-2-quimerismo'],
      },
      {
        id: 'presenca' as Disciplina,
        nivel: 1,
        poderes: ['presenca-1-fascinio'],
      },
    ]
    const res = validarDisciplinasCriacao('ravnos', disciplinasComAmalgama)
    expect(res.valido).toBe(true)
  })
})

describe('validarVantagensDefeitosCriacao', () => {
  it('aprova exatamente 7 de vantagens e 2 de defeitos para clã padrão', () => {
    const lista = [
      { id: 'vantagem-recursos', nivel: 4, origem: 'pessoal' as const },
      { id: 'vantagem-contatos', nivel: 3, origem: 'pessoal' as const },
      { id: 'defeito-inimigos', nivel: 2, origem: 'pessoal' as const },
    ]
    const res = validarVantagensDefeitosCriacao('brujah', lista, null)
    expect(res.valido).toBe(true)
    expect(res.pontosVantagens).toBe(7)
    expect(res.pontosDefeitos).toBe(2)
  })

  it('exclui bônus do predador da contagem pessoal de 7/2', () => {
    const lista = [
      { id: 'vantagem-recursos', nivel: 4, origem: 'pessoal' as const },
      { id: 'vantagem-aliados', nivel: 3, origem: 'pessoal' as const },
      { id: 'defeito-inimigos', nivel: 2, origem: 'pessoal' as const },
      // Vantagens e defeitos vindos do predador Gato de Beco
      { id: 'vantagem-contatos', nivel: 3, origem: 'predador' as const },
      { id: 'defeito-inimigos', nivel: 1, origem: 'predador' as const },
    ]
    const res = validarVantagensDefeitosCriacao('brujah', lista, gatoDeBeco)
    expect(res.valido).toBe(true)
    expect(res.pontosVantagens).toBe(7)
    expect(res.pontosDefeitos).toBe(2)
  })

  it('rejeita clã padrão com contagem diferente de 7 de vantagens ou 2 de defeitos', () => {
    const lista = [
      { id: 'vantagem-recursos', nivel: 3, origem: 'pessoal' as const },
      { id: 'defeito-inimigos', nivel: 1, origem: 'pessoal' as const },
    ]
    const res = validarVantagensDefeitosCriacao('brujah', lista, null)
    expect(res.valido).toBe(false)
    expect(res.erros.some((e) => e.includes('7'))).toBe(true)
    expect(res.erros.some((e) => e.includes('2'))).toBe(true)
  })

  it('rejeita traço de Sangue-Ralo em personagem de clã padrão', () => {
    const lista = [
      { id: 'vantagem-camaradas-anarquistas', nivel: 1, origem: 'pessoal' as const },
      { id: 'vantagem-recursos', nivel: 6, origem: 'pessoal' as const },
      { id: 'defeito-inimigos', nivel: 2, origem: 'pessoal' as const },
    ]
    const res = validarVantagensDefeitosCriacao('brujah', lista, null)
    expect(res.valido).toBe(false)
    expect(res.erros.some((e) => e.includes('Sangue-Ralo'))).toBe(true)
  })

  it('aprova Sangue-Ralo com 1 a 3 méritos e defeitos de Sangue-Ralo equilibrados', () => {
    const lista = [
      { id: 'vantagem-camaradas-anarquistas', nivel: 1, origem: 'pessoal' as const },
      { id: 'vantagem-contato-na-camarilla', nivel: 1, origem: 'pessoal' as const },
      { id: 'defeito-rejeitado-pelos-anarquistas', nivel: 1, origem: 'pessoal' as const },
      { id: 'defeito-marcado-pela-camarilla', nivel: 1, origem: 'pessoal' as const },
    ]
    const res = validarVantagensDefeitosCriacao('sangue-ralo', lista, null)
    expect(res.valido).toBe(true)
    expect(res.pontosVantagens).toBe(2)
    expect(res.pontosDefeitos).toBe(2)
  })

  it('rejeita Sangue-Ralo com contagens desiguais de méritos e defeitos de Sangue-Ralo', () => {
    const lista = [
      { id: 'vantagem-camaradas-anarquistas', nivel: 1, origem: 'pessoal' as const },
      { id: 'defeito-rejeitado-pelos-anarquistas', nivel: 1, origem: 'pessoal' as const },
      { id: 'defeito-marcado-pela-camarilla', nivel: 1, origem: 'pessoal' as const },
    ]
    const res = validarVantagensDefeitosCriacao('sangue-ralo', lista, null)
    expect(res.valido).toBe(false)
  })

  it('rejeita Sangue-Ralo com 0 ou mais de 3 méritos/defeitos', () => {
    const resZero = validarVantagensDefeitosCriacao('sangue-ralo', [], null)
    expect(resZero.valido).toBe(false)
  })
})

describe('validarConviccoes', () => {
  it('aprova entre 1 e 3 pares de convicção e pedra de toque', () => {
    const res1 = validarConviccoes([{ conviccao: 'Nunca matar inocentes', pedraDeToque: 'Minha irmã Maria' }])
    expect(res1.valido).toBe(true)

    const res3 = validarConviccoes([
      { conviccao: 'A', pedraDeToque: 'P1' },
      { conviccao: 'B', pedraDeToque: 'P2' },
      { conviccao: 'C', pedraDeToque: 'P3' },
    ])
    expect(res3.valido).toBe(true)
  })

  it('rejeita lista vazia ou com mais de 3 convicções', () => {
    const resVazia = validarConviccoes([])
    expect(resVazia.valido).toBe(false)

    const res4 = validarConviccoes([
      { conviccao: 'A', pedraDeToque: 'P1' },
      { conviccao: 'B', pedraDeToque: 'P2' },
      { conviccao: 'C', pedraDeToque: 'P3' },
      { conviccao: 'D', pedraDeToque: 'P4' },
    ])
    expect(res4.valido).toBe(false)
  })

  it('aceita convicção com ou sem pedra de toque (pedra de toque opcional)', () => {
    const resSemPedra = validarConviccoes([{ conviccao: 'Nunca roubar', pedraDeToque: '' }])
    expect(resSemPedra.valido).toBe(true)

    const resComPedra = validarConviccoes([{ conviccao: 'Nunca roubar', pedraDeToque: 'Minha mãe' }])
    expect(resComPedra.valido).toBe(true)
  })

  it('rejeita convicção com texto vazio', () => {
    const resVazio = validarConviccoes([
      { conviccao: '   ', pedraDeToque: 'Minha mãe' },
    ])
    expect(resVazio.valido).toBe(false)
  })
})

describe('validarCriacaoCompleta', () => {
  function dadosCompletosValidos(): DadosCriacao {
    return {
      atributos: atributosValidos(),
      perfilHabilidade: 'especialista',
      habilidades: habilidadesValidas('especialista'),
      especializacoes: [
        { habilidade: 'erudicao', especializacao: 'História Vampírica', origem: 'gratis' },
        { habilidade: 'briga', especializacao: 'Golpes Baixos', origem: 'livre' },
      ],
      disciplinas: [
        {
          id: 'celeridade',
          nivel: 2,
          poderes: ['celeridade-1-graca-felina', 'celeridade-2-ligeireza'],
        },
        {
          id: 'potencia',
          nivel: 1,
          poderes: ['potencia-1-corpo-letal'],
        },
      ],
      vantagens: [
        { id: 'vantagem-recursos', nivel: 4, origem: 'pessoal' },
        { id: 'vantagem-contatos', nivel: 3, origem: 'pessoal' },
        { id: 'defeito-inimigos', nivel: 2, origem: 'pessoal' },
      ],
      predador: null,
      conviccoes: [{ conviccao: 'Proteger os fracos', pedraDeToque: 'Irmão Carlos' }],
    }
  }

  it('aprova criação completa válida para Jogador (ehNarrador: false)', () => {
    const dados = dadosCompletosValidos()
    const res = validarCriacaoCompleta(dados, 'brujah', false)
    expect(res.valido).toBe(true)
    expect(res.erros).toHaveLength(0)
  })

  it('bloqueia criação incompleta para Jogador (ehNarrador: false)', () => {
    const dados = dadosCompletosValidos()
    dados.atributos.forca = 1 // quebra slots
    const res = validarCriacaoCompleta(dados, 'brujah', false)
    expect(res.valido).toBe(false)
    expect(res.erros.length).toBeGreaterThan(0)
  })

  it('não bloqueia criação com erros se ehNarrador: true, apenas lista avisos/erros', () => {
    const dados = dadosCompletosValidos()
    dados.atributos.forca = 1 // quebra slots
    const res = validarCriacaoCompleta(dados, 'brujah', true)
    expect(res.valido).toBe(true) // narrador bypassa
    expect(res.erros.length).toBeGreaterThan(0) // erros são informativos
  })
})

describe('aplicarPredador', () => {
  it('aplica disciplina, especialização, vantagens/defeitos e modificador de humanidade', () => {
    const dadosIniciais = {
      humanidade: 7,
      potenciaSangue: 1,
      disciplinas: [
        { id: 'celeridade' as Disciplina, nivel: 2, poderes: ['celeridade-1-graca-felina', 'celeridade-2-ligeireza'] },
      ],
      especializacoes: [] as Especializacao[],
      vantagens: [] as any[],
      defeitos: [] as any[],
    }

    const resultado = aplicarPredador(dadosIniciais, gatoDeBeco, {
      disciplina: 'potencia',
      especializacao: { habilidade: 'briga', especializacao: 'Imobilização' },
    })

    // Humanidade cai 1 no Gato de Beco
    expect(resultado.humanidade).toBe(6)
    // Ganhou potência 1
    const pot = resultado.disciplinas.find((d: any) => d.id === 'potencia' || d.disciplina === 'potencia')
    expect(pot).toBeDefined()
    expect(pot?.nivel).toBe(1)
    // Especialização marcada com origem 'predador'
    expect(resultado.especializacoes).toContainEqual({
      habilidade: 'briga',
      especializacao: 'Imobilização',
      origem: 'predador',
    })
    // Vantagens do predador (Contatos 3) e Defeitos (Inimigos 1)
    expect(resultado.vantagens).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'vantagem-contatos', nivel: 3 })]),
    )
    expect(resultado.defeitos).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'defeito-inimigos', nivel: 1 })]),
    )
  })

  it('incrementa nível se disciplina já existir e aplica bônus de Potência do Sangue', () => {
    const dadosIniciais = {
      humanidade: 7,
      potenciaSangue: 1,
      disciplinas: [
        { id: 'celeridade' as Disciplina, nivel: 2, poderes: ['celeridade-1-graca-felina', 'celeridade-2-ligeireza'] },
      ],
      especializacoes: [] as Especializacao[],
      vantagens: [] as any[],
      defeitos: [] as any[],
    }

    const resultado = aplicarPredador(dadosIniciais, sanguessuga, {
      disciplina: 'celeridade',
      especializacao: { habilidade: 'furtividade', especializacao: 'Espreita de Vampiros' },
    })

    // Celeridade foi de 2 para 3
    const cel = resultado.disciplinas.find((d: any) => d.id === 'celeridade' || d.disciplina === 'celeridade')
    expect(cel).toBeDefined()
    expect(cel?.nivel).toBe(3)
    // Sanguessuga dá +1 de Potência do Sangue e -1 de Humanidade
    expect(resultado.potenciaSangue).toBe(2)
    expect(resultado.humanidade).toBe(6)
  })

  it('aplica escolha de traço opcional do predador (escolhasTracos)', () => {
    const dadosIniciais = {
      humanidade: 7,
      potenciaSangue: 1,
      disciplinas: [],
      especializacoes: [] as Especializacao[],
      vantagens: [] as any[],
      defeitos: [] as any[],
    }

    const resultado = aplicarPredador(dadosIniciais, ladraoDeBolsas, {
      disciplina: 'ofuscacao',
      especializacao: { habilidade: 'ladroagem', especializacao: 'Arrombamento' },
      tracoEscolhido: { id: 'vantagem-recursos', nivel: 1, tipo: 'vantagem', nota: 'Equipamento' },
    })

    expect(resultado.vantagens).toContainEqual(
      expect.objectContaining({ id: 'vantagem-recursos', nivel: 1 }),
    )
  })
})
