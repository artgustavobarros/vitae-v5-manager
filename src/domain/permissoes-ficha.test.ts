import { describe, expect, it } from 'vitest'

import {
  acessoFicha,
  ehPdN,
  motivoNaoConcluir,
  nomeJogador,
  permissoesPersonagem,
  podeApagar,
  podeConcluir,
  rotuloOrigemPersonagem,
  type StatusPersonagem,
} from './permissoes-ficha'

const jogador = { id: 'j1', papel: 'jogador' as const }
const outroJogador = { id: 'j2', papel: 'jogador' as const }
const narrador = { id: 'n1', papel: 'narrador' as const }

function personagem(donoId: string, status: StatusPersonagem, nome = 'Helena', atribuidoA: string | null = null) {
  return { donoId, status, nome, atribuidoA }
}

/** Rascunho do Narrador atribuído ao Jogador j1. */
const atribuido = personagem('n1', 'rascunho', 'Helena', 'j1')

describe('acessoFicha', () => {
  it('reserva todas as alterações internas ao Narrador', () => {
    expect(acessoFicha(jogador, personagem('j1', 'rascunho'))).toBeNull()
    expect(acessoFicha(jogador, personagem('j1', 'ativo'))).toBeNull()
    expect(acessoFicha(narrador, personagem('j1', 'rascunho'))).toBe('editar')
    expect(acessoFicha(narrador, personagem('j1', 'arquivado'))).toBe('editar')
  })

  it('o Jogador não vê Personagens de outro Jogador', () => {
    expect(acessoFicha(outroJogador, personagem('j1', 'rascunho'))).toBeNull()
    expect(acessoFicha(outroJogador, personagem('j1', 'ativo'))).toBeNull()
  })

  it('o Jogador não vê PdNs', () => {
    expect(acessoFicha(jogador, personagem('n1', 'ativo'))).toBeNull()
  })

  it('o Narrador edita a Ficha Ativa de um Jogador', () => {
    expect(acessoFicha(narrador, personagem('j1', 'ativo'))).toBe('editar')
  })

  it('o Narrador edita os próprios PdNs, Rascunho ou Ativo', () => {
    expect(acessoFicha(narrador, personagem('n1', 'rascunho'))).toBe('editar')
    expect(acessoFicha(narrador, personagem('n1', 'ativo'))).toBe('editar')
  })
})

describe('podeConcluir', () => {
  it('só o Narrador conclui qualquer Rascunho com nome', () => {
    expect(podeConcluir(jogador, personagem('j1', 'rascunho'))).toBe(false)
    expect(podeConcluir(narrador, personagem('n1', 'rascunho'))).toBe(true)
    expect(podeConcluir(narrador, personagem('j1', 'rascunho'))).toBe(true)
  })

  it('exige nome', () => {
    expect(podeConcluir(narrador, personagem('j1', 'rascunho', '   '))).toBe(false)
  })

  it('só Rascunho é concluído', () => {
    expect(podeConcluir(jogador, personagem('j1', 'ativo'))).toBe(false)
  })
})

describe('podeApagar', () => {
  it('só o Narrador apaga Rascunhos', () => {
    expect(podeApagar(jogador, personagem('j1', 'rascunho'))).toBe(false)
    expect(podeApagar(narrador, personagem('j1', 'rascunho'))).toBe(true)
  })

  it('ninguém apaga um Personagem Ativo', () => {
    expect(podeApagar(jogador, personagem('j1', 'ativo'))).toBe(false)
    expect(podeApagar(narrador, personagem('n1', 'ativo'))).toBe(false)
  })
})

describe('motivoNaoConcluir', () => {
  it('diz por que o Rascunho não pode ser concluído', () => {
    expect(motivoNaoConcluir(jogador, personagem('j1', 'rascunho'))).toBe('nao-dono')
    expect(motivoNaoConcluir(narrador, personagem('j1', 'rascunho', ' '))).toBe('sem-nome')
    expect(motivoNaoConcluir(narrador, atribuido)).toBeNull()
    expect(motivoNaoConcluir(narrador, personagem('j1', 'ativo'))).toBe('nao-rascunho')
    expect(motivoNaoConcluir(narrador, personagem('j1', 'rascunho'))).toBeNull()
  })
})

describe('ehPdN', () => {
  it('usa o tipo explícito, independente do dono e do estado', () => {
    const deJogador = { papelDono: 'narrador' as const, status: 'ativo' as const, tipo: 'jogador' as const }
    const naoJogador = { papelDono: 'jogador' as const, status: 'rascunho' as const, tipo: 'nao_jogador' as const }
    expect(ehPdN(deJogador)).toBe(false)
    expect(ehPdN(naoJogador)).toBe(true)
  })

  it('PdN é Personagem do Narrador já concluído', () => {
    expect(ehPdN({ papelDono: 'narrador', status: 'ativo' })).toBe(true)
    expect(ehPdN({ papelDono: 'narrador', status: 'arquivado' })).toBe(true)
  })

  it('Rascunho do Narrador ainda não é PdN', () => {
    expect(ehPdN({ papelDono: 'narrador', status: 'rascunho' })).toBe(false)
  })

  it('Personagem de Jogador não é PdN', () => {
    expect(ehPdN({ papelDono: 'jogador', status: 'ativo' })).toBe(false)
  })

  it('Personagem com jogadorNome não é PdN mesmo sob conta do Narrador', () => {
    expect(ehPdN({ papelDono: 'narrador', status: 'ativo', jogadorNome: 'Geovane' })).toBe(false)
  })
})

describe('nomeJogador', () => {
  it('prioriza jogadorNome se fornecido', () => {
    expect(nomeJogador({ papelDono: 'narrador', nomeDono: 'Narrador', jogadorNome: 'Geovane' })).toBe('Geovane')
  })

  it('usa nomeDono se o dono for jogador', () => {
    expect(nomeJogador({ papelDono: 'jogador', nomeDono: 'Lucas' })).toBe('Lucas')
  })

  it('retorna null se for do narrador sem jogadorNome', () => {
    expect(nomeJogador({ papelDono: 'narrador', nomeDono: 'Narrador' })).toBeNull()
  })
})

describe('permissoesPersonagem', () => {
  it('só o Narrador altera o Clã, em qualquer estado', () => {
    expect(permissoesPersonagem(jogador, personagem('j1', 'ativo')).podeAlterarCla).toBe(false)
    expect(permissoesPersonagem(narrador, personagem('j1', 'arquivado')).podeAlterarCla).toBe(true)
    expect(permissoesPersonagem(jogador, personagem('j1', 'rascunho')).podeAlterarCla).toBe(false)
    expect(permissoesPersonagem(narrador, personagem('n1', 'ativo')).podeAlterarCla).toBe(true)
  })

  it('o Narrador edita integralmente um Personagem de Jogador', () => {
    expect(permissoesPersonagem(narrador, personagem('j1', 'ativo'))).toMatchObject({
      acesso: 'editar',
      podeAlterarCla: true,
    })
  })

  it('o Jogador não recebe controles internos nem no Rascunho', () => {
    expect(permissoesPersonagem(jogador, personagem('j1', 'rascunho'))).toEqual({
      acesso: null,
      podeAlterarCla: false,
      podeApagar: false,
      podeConcluir: false,
    })
  })

  it('o Narrador pode editar e apagar qualquer Rascunho', () => {
    expect(permissoesPersonagem(narrador, personagem('j1', 'rascunho'))).toMatchObject({
      acesso: 'editar',
      podeApagar: true,
    })
  })

  it('a atribuição legada não impede o Narrador de concluir o Rascunho', () => {
    expect(permissoesPersonagem(narrador, atribuido)).toMatchObject({
      podeConcluir: true,
    })
  })
})

describe('nomeJogador', () => {
  it('mostra o nome quando o dono é Jogador', () => {
    expect(nomeJogador({ papelDono: 'jogador', nomeDono: 'Ana' })).toBe('Ana')
  })

  it('fica vazio quando o dono é o Narrador', () => {
    expect(nomeJogador({ papelDono: 'narrador', nomeDono: 'Arthur' })).toBeNull()
  })
})

describe('rotuloOrigemPersonagem', () => {
  it('identifica rascunho sem atribuicao', () => {
    expect(rotuloOrigemPersonagem({ status: 'rascunho' })).toBe('(Rascunho)')
  })

  it('identifica rascunho atribuido', () => {
    expect(rotuloOrigemPersonagem({ status: 'rascunho', atribuidoA: 'user-1' })).toBe('(Rascunho)')
  })

  it('identifica PdN', () => {
    expect(rotuloOrigemPersonagem({ status: 'ativo', ehPdN: true })).toBe('(PdN)')
    expect(rotuloOrigemPersonagem({ status: 'ativo', ehPdn: true })).toBe('(PdN)')
  })

  it('identifica jogadorNome quando informado em PJ', () => {
    expect(rotuloOrigemPersonagem({ status: 'ativo', ehPdN: false, jogadorNome: 'Geovane' })).toBe('(Geovane)')
  })

  it('retorna null para PJ padrão sem jogadorNome', () => {
    expect(rotuloOrigemPersonagem({ status: 'ativo', ehPdN: false })).toBeNull()
  })
})
