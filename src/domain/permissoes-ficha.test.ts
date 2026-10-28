import { describe, expect, it } from 'vitest'

import {
  acessoFicha,
  aplicarRespostaAtribuicao,
  ehPdN,
  exigeRegrasCriacao,
  motivoNaoConcluir,
  nomeJogador,
  permissoesPersonagem,
  podeApagar,
  podeAtribuir,
  podeCancelarAtribuicao,
  podeConcluir,
  podeResponderAtribuicao,
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
  it('o Jogador edita tudo no próprio Rascunho', () => {
    expect(acessoFicha(jogador, personagem('j1', 'rascunho'))).toBe('editar')
  })

  it('com o Personagem Ativo, o Jogador só marca dano, Fome e Manchas', () => {
    expect(acessoFicha(jogador, personagem('j1', 'ativo'))).toBe('marcar')
  })

  it('o Jogador só lê o próprio Personagem Arquivado', () => {
    expect(acessoFicha(jogador, personagem('j1', 'arquivado'))).toBe('ler')
  })

  it('o Jogador não vê Personagens de outro Jogador', () => {
    expect(acessoFicha(outroJogador, personagem('j1', 'rascunho'))).toBeNull()
    expect(acessoFicha(outroJogador, personagem('j1', 'ativo'))).toBeNull()
  })

  it('o Jogador não vê PdNs', () => {
    expect(acessoFicha(jogador, personagem('n1', 'ativo'))).toBeNull()
  })

  it('o Narrador só lê o Rascunho de um Jogador', () => {
    expect(acessoFicha(narrador, personagem('j1', 'rascunho'))).toBe('ler')
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
  it('o dono conclui o Rascunho com nome', () => {
    expect(podeConcluir(jogador, personagem('j1', 'rascunho'))).toBe(true)
    expect(podeConcluir(narrador, personagem('n1', 'rascunho'))).toBe(true)
  })

  it('exige nome', () => {
    expect(podeConcluir(jogador, personagem('j1', 'rascunho', '   '))).toBe(false)
  })

  it('o Narrador não conclui o Rascunho de um Jogador', () => {
    expect(podeConcluir(narrador, personagem('j1', 'rascunho'))).toBe(false)
  })

  it('só Rascunho é concluído', () => {
    expect(podeConcluir(jogador, personagem('j1', 'ativo'))).toBe(false)
  })
})

describe('podeApagar', () => {
  it('o dono apaga o próprio Rascunho', () => {
    expect(podeApagar(jogador, personagem('j1', 'rascunho'))).toBe(true)
  })

  it('ninguém apaga um Personagem Ativo', () => {
    expect(podeApagar(jogador, personagem('j1', 'ativo'))).toBe(false)
    expect(podeApagar(narrador, personagem('n1', 'ativo'))).toBe(false)
  })

  it('o Narrador não apaga o Rascunho de um Jogador', () => {
    expect(podeApagar(narrador, personagem('j1', 'rascunho'))).toBe(false)
  })
})

describe('Personagem atribuído', () => {
  it('o Narrador atribui o próprio Rascunho a um Jogador', () => {
    expect(podeAtribuir(narrador, personagem('n1', 'rascunho'))).toBe(true)
  })

  it('não atribui Personagem Ativo, nem Rascunho de Jogador, nem um já atribuído', () => {
    expect(podeAtribuir(narrador, personagem('n1', 'ativo'))).toBe(false)
    expect(podeAtribuir(narrador, personagem('j1', 'rascunho'))).toBe(false)
    expect(podeAtribuir(narrador, atribuido)).toBe(false)
  })

  it('Jogador não atribui', () => {
    expect(podeAtribuir(jogador, personagem('j1', 'rascunho'))).toBe(false)
  })

  it('o Jogador atribuído só lê a Ficha enquanto decide', () => {
    expect(acessoFicha(jogador, atribuido)).toBe('ler')
    expect(acessoFicha(outroJogador, atribuido)).toBeNull()
  })

  it('o Narrador continua editando enquanto espera', () => {
    expect(acessoFicha(narrador, atribuido)).toBe('editar')
  })

  it('só o Jogador atribuído responde', () => {
    expect(podeResponderAtribuicao(jogador, atribuido)).toBe(true)
    expect(podeResponderAtribuicao(outroJogador, atribuido)).toBe(false)
    expect(podeResponderAtribuicao(narrador, atribuido)).toBe(false)
  })

  it('o Narrador cancela uma atribuição pendente', () => {
    expect(podeCancelarAtribuicao(narrador, atribuido)).toBe(true)
    expect(podeCancelarAtribuicao(narrador, personagem('n1', 'rascunho'))).toBe(false)
    expect(podeCancelarAtribuicao(jogador, atribuido)).toBe(false)
  })

  it('Rascunho atribuído não pode ser concluído', () => {
    expect(podeConcluir(narrador, atribuido)).toBe(false)
  })
})

describe('motivoNaoConcluir', () => {
  it('diz por que o Rascunho não pode ser concluído', () => {
    expect(motivoNaoConcluir(jogador, personagem('j1', 'rascunho'))).toBeNull()
    expect(motivoNaoConcluir(jogador, personagem('j1', 'rascunho', ' '))).toBe('sem-nome')
    expect(motivoNaoConcluir(narrador, atribuido)).toBe('atribuido')
    expect(motivoNaoConcluir(jogador, personagem('j1', 'ativo'))).toBe('nao-rascunho')
    expect(motivoNaoConcluir(narrador, personagem('j1', 'rascunho'))).toBe('nao-dono')
  })
})

describe('podeAtribuir a um alvo', () => {
  it('só atribui a Jogador', () => {
    const rascunho = personagem('n1', 'rascunho')
    expect(podeAtribuir(narrador, rascunho, { papel: 'jogador' })).toBe(true)
    expect(podeAtribuir(narrador, rascunho, { papel: 'narrador' })).toBe(false)
  })
})

describe('aplicarRespostaAtribuicao', () => {
  it('aceitar passa o Rascunho para o Jogador', () => {
    expect(aplicarRespostaAtribuicao(jogador, true)).toEqual({ donoId: 'j1', atribuidoA: null })
  })

  it('recusar só desfaz a atribuição', () => {
    expect(aplicarRespostaAtribuicao(jogador, false)).toEqual({ atribuidoA: null })
  })
})

describe('exigeRegrasCriacao', () => {
  it('o Jogador segue as regras de criação no próprio Rascunho', () => {
    expect(exigeRegrasCriacao(jogador, personagem('j1', 'rascunho'))).toBe(true)
  })

  it('o Narrador edita sem validação, inclusive nos próprios Rascunhos', () => {
    expect(exigeRegrasCriacao(narrador, personagem('n1', 'rascunho'))).toBe(false)
  })

  it('fora do Rascunho não há regra de criação', () => {
    expect(exigeRegrasCriacao(jogador, personagem('j1', 'ativo'))).toBe(false)
  })
})

describe('ehPdN', () => {
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
})

describe('permissoesPersonagem', () => {
  it('trava o Clã do Jogador após concluir e preserva a escolha no Rascunho e nos PdNs', () => {
    expect(permissoesPersonagem(jogador, personagem('j1', 'ativo')).podeAlterarCla).toBe(false)
    expect(permissoesPersonagem(narrador, personagem('j1', 'arquivado')).podeAlterarCla).toBe(false)
    expect(permissoesPersonagem(jogador, personagem('j1', 'rascunho')).podeAlterarCla).toBe(true)
    expect(permissoesPersonagem(narrador, personagem('n1', 'ativo')).podeAlterarCla).toBe(true)
  })

  it('o Narrador não pode trocar o Clã de um Personagem Ativo de Jogador', () => {
    expect(permissoesPersonagem(narrador, personagem('j1', 'ativo'))).toMatchObject({
      acesso: 'editar',
      podeAlterarCla: false,
    })
  })

  it('Rascunho próprio do Jogador abre no wizard, pode ser apagado e segue as regras de criação', () => {
    expect(permissoesPersonagem(jogador, personagem('j1', 'rascunho'))).toEqual({
      acesso: 'editar',
      abreNoWizard: true,
      podeAlterarCla: true,
      podeApagar: true,
      podeConcluir: true,
      podeAtribuir: false,
      podeCancelarAtribuicao: false,
      regrasCriacao: true,
    })
  })

  it('Rascunho de Jogador visto pelo Narrador só abre a Ficha para leitura', () => {
    expect(permissoesPersonagem(narrador, personagem('j1', 'rascunho'))).toMatchObject({
      acesso: 'ler',
      abreNoWizard: false,
      podeApagar: false,
    })
  })

  it('Rascunho atribuído: o Narrador edita e cancela, mas não conclui nem atribui de novo', () => {
    expect(permissoesPersonagem(narrador, atribuido)).toMatchObject({
      abreNoWizard: true,
      podeConcluir: false,
      podeAtribuir: false,
      podeCancelarAtribuicao: true,
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
