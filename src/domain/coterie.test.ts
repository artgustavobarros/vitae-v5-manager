import { describe, expect, it } from 'vitest'

import {
  coterieSchema,
  deveExibirFiltroCoteries,
  podeAdicionarPdn,
  podeApagarCoterie,
  podeConvidarParaCoterie,
  podeEditarCoterie,
  podeExpulsarMembro,
  podeResponderConviteCoterie,
  podeSairDaCoterie,
  podeVerCoterie,
} from './coterie'

const NARRADOR = { id: 'narrador-1', papel: 'narrador' as const }
const JOGADOR_1 = { id: 'jogador-1', papel: 'jogador' as const }
const JOGADOR_2 = { id: 'jogador-2', papel: 'jogador' as const }

describe('coterieSchema', () => {
  it('valida dados corretos de coterie com domínio', () => {
    const res = coterieSchema.safeParse({
      nome: 'O Grupo',
      conceito: 'Defensores da Lapa',
      caca: 2,
      abrigo: 3,
      porte: 1,
    })
    expect(res.success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const res = coterieSchema.safeParse({
      nome: '   ',
      caca: 0,
      abrigo: 0,
      porte: 0,
    })
    expect(res.success).toBe(false)
  })

  it('rejeita domínio fora de 0-5', () => {
    expect(coterieSchema.safeParse({ nome: 'X', caca: 6 }).success).toBe(false)
    expect(coterieSchema.safeParse({ nome: 'X', abrigo: -1 }).success).toBe(false)
  })
})

describe('permissões de coterie', () => {
  it('apenas narrador pode editar', () => {
    expect(podeEditarCoterie(NARRADOR)).toBe(true)
    expect(podeEditarCoterie(JOGADOR_1)).toBe(false)
  })

  it('coterie padrão nunca pode ser apagada', () => {
    expect(podeApagarCoterie(NARRADOR, { ehPadrao: true })).toBe(false)
    expect(podeApagarCoterie(NARRADOR, { ehPadrao: false })).toBe(true)
    expect(podeApagarCoterie(JOGADOR_1, { ehPadrao: false })).toBe(false)
  })

  it('convidar para coterie exige narrador, personagem ativo, dono jogador, sem ser membro e sem convite pendente', () => {
    const valido = {
      status: 'ativo' as const,
      papelDono: 'jogador' as const,
      ehMembro: false,
      temConvitePendente: false,
    }
    expect(podeConvidarParaCoterie(NARRADOR, valido)).toBe(true)
    expect(podeConvidarParaCoterie(JOGADOR_1, valido)).toBe(false)
    expect(podeConvidarParaCoterie(NARRADOR, { ...valido, status: 'rascunho' })).toBe(false)
    expect(podeConvidarParaCoterie(NARRADOR, { ...valido, papelDono: 'narrador' })).toBe(false)
    expect(podeConvidarParaCoterie(NARRADOR, { ...valido, ehMembro: true })).toBe(false)
    expect(podeConvidarParaCoterie(NARRADOR, { ...valido, temConvitePendente: true })).toBe(false)
  })

  it('adicionar PdN exige narrador e que seja PdN e ainda não membro', () => {
    expect(podeAdicionarPdn(NARRADOR, { ehPdN: true, ativo: true, ehMembro: false })).toBe(true)
    expect(podeAdicionarPdn(NARRADOR, { ehPdN: false, ativo: true, ehMembro: false })).toBe(false)
    expect(podeAdicionarPdn(NARRADOR, { ehPdN: true, ativo: false, ehMembro: false })).toBe(false)
    expect(podeAdicionarPdn(NARRADOR, { ehPdN: true, ativo: true, ehMembro: true })).toBe(false)
    expect(podeAdicionarPdn(JOGADOR_1, { ehPdN: true, ativo: true, ehMembro: false })).toBe(false)
  })

  it('apenas narrador pode expulsar membro', () => {
    expect(podeExpulsarMembro(NARRADOR)).toBe(true)
    expect(podeExpulsarMembro(JOGADOR_1)).toBe(false)
  })

  it('jogador dono do personagem pode sair da coterie', () => {
    expect(podeSairDaCoterie(JOGADOR_1, { donoId: JOGADOR_1.id })).toBe(true)
    expect(podeSairDaCoterie(JOGADOR_2, { donoId: JOGADOR_1.id })).toBe(false)
  })

  it('narrador enxerga qualquer coterie; jogador só se tiver personagem nela', () => {
    expect(podeVerCoterie(NARRADOR, { temPersonagemNaCoterie: false })).toBe(true)
    expect(podeVerCoterie(JOGADOR_1, { temPersonagemNaCoterie: true })).toBe(true)
    expect(podeVerCoterie(JOGADOR_1, { temPersonagemNaCoterie: false })).toBe(false)
  })

  it('só o dono do personagem convidado pode responder ao convite', () => {
    expect(podeResponderConviteCoterie(JOGADOR_1, { donoPersonagemId: JOGADOR_1.id })).toBe(true)
    expect(podeResponderConviteCoterie(JOGADOR_2, { donoPersonagemId: JOGADOR_1.id })).toBe(false)
  })

  it('filtro de coteries aparece a partir de 3 coteries', () => {
    expect(deveExibirFiltroCoteries(0)).toBe(false)
    expect(deveExibirFiltroCoteries(2)).toBe(false)
    expect(deveExibirFiltroCoteries(3)).toBe(true)
    expect(deveExibirFiltroCoteries(5)).toBe(true)
  })
})
