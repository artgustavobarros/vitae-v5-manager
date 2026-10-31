import { describe, expect, it } from 'vitest'
import { criarModeloAntagonistaPadrao, modeloAntagonistaSchema } from './bestiario'
import { MODELOS_INICIAIS_BESTIARIO } from './bestiario-modelos-iniciais'
import { PODERES, RITUAIS_TODOS } from './catalogo'
import { requisitosItem, REQUISITOS_CATALOGO } from './catalogo/requisitos'
import { criarInimigoDeModelo, filtrarCombateParaJogador, iniciarCombate, participanteInimigoSchema } from './combate'
import {
  obterPerfilSobrenatural, sortearRecursosSobrenaturais, validarRecursosSobrenaturais,
  opcoesSobrenaturais, trocarPoder, type RecursosSobrenaturais,
} from './poderes-antagonista'

const modelos = MODELOS_INICIAIS_BESTIARIO.map(m => modeloAntagonistaSchema.parse(m))
const modelo = (nome: string) => modelos.find(m => m.nome === nome)!
const vazio = (disciplinas: RecursosSobrenaturais['disciplinas']): RecursosSobrenaturais => ({
  disciplinas, livres: 0, poderes: [], rituais: [], cerimonias: [], formulas: [], confirmacoes: [],
})

describe('Requisitos estruturados do Catálogo', () => {
  it('mantém cobertura dos requisitos em texto e referências válidas apesar de traduções alteradas', () => {
    const itens = [...PODERES, ...RITUAIS_TODOS]
    for (const item of itens.filter(i => i.preRequisito)) {
      expect(REQUISITOS_CATALOGO[item.id], item.id).toBeDefined()
      for (const grupo of REQUISITOS_CATALOGO[item.id].itens ?? []) {
        for (const id of grupo) expect(itens.some(i => i.id === id), id).toBe(true)
      }
    }
    expect(requisitosItem('potencia-4-queda-esmagadora').itens).toEqual([['potencia-1-salto-prodigioso']])
  })
})

describe('Poderes de Antagonistas', () => {
  it('reconhece níveis dos dois formatos, poder livre e poderes fixos sem ativar efeitos condicionais', () => {
    expect(obterPerfilSobrenatural(modelo('Batedor da Trilha de Caim')).disciplinas).toEqual({ animalismo: 2, ofuscacao: 2, potencia: 2 })
    expect(obterPerfilSobrenatural(modelo('Fada')).disciplinas).toMatchObject({ presenca: 5, dominacao: 4 })
    expect(obterPerfilSobrenatural(modelo('Carniçal')).livres).toBe(1)
    expect(obterPerfilSobrenatural(modelo('Carniçal da Ninhada')).fixos).toContain('proteanismo-2-armas-ferais')
    expect(obterPerfilSobrenatural(modelo('Acorrentado')).disciplinas).toEqual({})
    expect(obterPerfilSobrenatural(modelo('Flautista da Trilha da Morte e da Alma')).quantidades.cerimonia).toBe(4)
  })

  it('bloqueia nível, amálgama, dependência e repetições; aceita alternativa de pré-requisito', () => {
    const selecao = vazio({ proteanismo: 4 })
    expect(opcoesSobrenaturais(selecao, 'poder', 'proteanismo').find(o => o.item.id === 'proteanismo-2-vicissitude')?.motivos.join()).toContain('Amálgama')
    selecao.disciplinas.dominacao = 2
    expect(opcoesSobrenaturais(selecao, 'poder', 'proteanismo').find(o => o.item.id === 'proteanismo-2-vicissitude')?.motivos).toEqual([])
    expect(opcoesSobrenaturais(selecao, 'poder', 'proteanismo').find(o => o.item.id === 'proteanismo-4-metamorfose')?.motivos.length).toBeGreaterThan(0)
    const dominacao = vazio({ dominacao: 5 })
    dominacao.poderes = ['dominacao-1-compelir', 'dominacao-2-hipnotizar', 'dominacao-3-mente-esquecida']
    expect(opcoesSobrenaturais(dominacao, 'poder', 'dominacao').find(o => o.item.id === 'dominacao-5-chamado-do-lete')?.motivos).toEqual([])
    expect(() => validarRecursosSobrenaturais({ ...dominacao, poderes: [...dominacao.poderes, 'dominacao-1-compelir'] })).toThrow()
    expect(() => validarRecursosSobrenaturais({ ...vazio({ dominacao: 2, ofuscacao: 2 }), poderes: ['dominacao-2-hipnotizar', 'dominacao-2-demencia'] })).toThrow()
  })

  it('exige pré-requisitos de ambos os lados de um e, com alternativa ou', () => {
    const selecao = vazio({ animalismo: 3, dominacao: 2, auspicios: 1 })
    const opcao = () => opcoesSobrenaturais(selecao, 'poder', 'animalismo').find(o => o.item.id === 'animalismo-3-comando-do-mensageiro')!
    selecao.poderes = ['animalismo-1-vinculo-famulus', 'animalismo-2-mensageiro-animal']
    expect(opcao().motivos.length).toBeGreaterThan(0)
    selecao.poderes.push('dominacao-1-compelir')
    expect(opcao().motivos).toEqual([])
  })

  it('trocar um poder remove dependentes inválidos, inclusive Cerimônias', () => {
    const selecao = { ...vazio({ oblivio: 3 }), poderes: ['oblivio-1-grilhao-de-ligacao', 'oblivio-2-onde-o-veu-afina'], cerimonias: ['cerimonia-1-invocar-espirito'] }
    const trocada = trocarPoder(selecao, 'oblivio-1-grilhao-de-ligacao', 'oblivio-1-visao-do-oblivio')
    expect(trocada.cerimonias).toEqual([])
    expect(selecao.cerimonias).toEqual(['cerimonia-1-invocar-espirito'])
  })

  it('só libera condições de Clã e condições narrativas depois de confirmação explícita', () => {
    const selecao = vazio({ 'feiticaria-de-sangue': 1 })
    const opcao = () => opcoesSobrenaturais(selecao, 'poder', 'feiticaria-de-sangue').find(o => o.item.id === 'feiticaria-de-sangue-1-feiticaria-koldunica')!
    expect(opcao().motivos).toContain('Condição adicional não confirmada: Só Tzimisce')
    selecao.confirmacoes.push('feiticaria-de-sangue-1-feiticaria-koldunica')
    expect(opcao().motivos).toEqual([])
  })

  it('sorteia conjuntos válidos para os Modelos, inclusive o poder livre e os fixos', () => {
    let estado = 42
    const rng = () => { estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0; return estado / 4294967296 }
    for (const m of modelos) {
      for (let tentativa = 0; tentativa < 4; tentativa++) {
        const sorteado = sortearRecursosSobrenaturais(m, {}, rng)
        expect(() => validarRecursosSobrenaturais(sorteado), m.nome).not.toThrow()
        const perfil = obterPerfilSobrenatural(m)
        expect(sorteado.poderes.length, m.nome).toBe(Object.values(perfil.disciplinas).reduce((s, n) => s + n, 0) - (perfil.disciplinas['alquimia-de-sangue-ralo'] ?? 0) + perfil.livres)
        expect(perfil.fixos.every(id => sorteado.poderes.includes(id)), m.nome).toBe(true)
      }
    }
  })

  it('sorteia Rituais, Cerimônias e Fórmulas nas quantidades escolhidas, sem repetir ou ignorar requisitos', () => {
    const heli = sortearRecursosSobrenaturais(modelo('Heliófilo da Trilha do Sol'), { quantidades: { formula: 3 } })
    expect(heli.formulas).toHaveLength(3)
    expect(() => validarRecursosSobrenaturais(heli)).not.toThrow()
    const mago = sortearRecursosSobrenaturais(modelo('Mago'), { quantidades: { ritual: 4 } })
    expect(mago.rituais).toHaveLength(4)
    const flautista = sortearRecursosSobrenaturais(modelo('Flautista da Trilha da Morte e da Alma'))
    expect(flautista.cerimonias).toHaveLength(4)
    expect(() => sortearRecursosSobrenaturais(modelo('Urso'), { quantidades: { ritual: 1 } })).toThrow()
    const invalidos = { ...vazio({ oblivio: 2 }), poderes: ['oblivio-1-visao-do-oblivio'], cerimonias: ['cerimonia-1-invocar-espirito'] }
    expect(() => validarRecursosSobrenaturais(invalidos)).toThrow()
  })

  it('persiste a seleção por Inimigo sem alterar o Modelo e não a envia ao Jogador', () => {
    const m = modelo('Carniçal da Ninhada')
    const antes = structuredClone(m)
    const recursos = sortearRecursosSobrenaturais(m)
    const inimigo = criarInimigoDeModelo(m, { id: 'ninhada', nome: 'Guarda' }, recursos)
    expect(participanteInimigoSchema.parse(inimigo).recursosSobrenaturais).toEqual(recursos)
    expect(m).toEqual(antes)
    recursos.poderes.length = 0
    expect(inimigo.recursosSobrenaturais?.poderes).toHaveLength(2)
    const visivel = filtrarCombateParaJogador(iniciarCombate([inimigo]), { jogadorId: 'j', meusPersonagemIds: [], coterieIdsDoJogador: [], coteriesPorPersonagem: {}, condicoesPersonagens: {} })
    expect(visivel.participantes[0]).not.toHaveProperty('recursosSobrenaturais')
    expect(() => criarInimigoDeModelo(criarModeloAntagonistaPadrao(), { id: 'm', nome: 'Mortal' }, inimigo.recursosSobrenaturais!)).toThrow()
  })
})
