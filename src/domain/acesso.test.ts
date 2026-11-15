import { describe, expect, it } from 'vitest'

import { decidirPapel, iniciais, nomeCurto, normalizarEmail } from './acesso'

const narradorEmail = 'narrador@exemplo.com'

describe('decidirPapel', () => {
  it('reconhece o Narrador pelo e-mail configurado', () => {
    expect(
      decidirPapel({ email: 'narrador@exemplo.com', narradorEmail }),
    ).toBe('narrador')
  })

  it('ignora maiúsculas e espaços ao comparar o e-mail do Narrador', () => {
    expect(
      decidirPapel({ email: '  Narrador@Exemplo.com ', narradorEmail }),
    ).toBe('narrador')
  })

  it('recusa qualquer pessoa fora do e-mail configurado', () => {
    expect(
      decidirPapel({ email: 'ana@exemplo.com', narradorEmail }),
    ).toBeNull()
  })

  it('recusa um endereço vazio', () => {
    expect(
      decidirPapel({ email: '', narradorEmail }),
    ).toBeNull()
  })

  it('recusa acesso quando o Narrador não está configurado', () => {
    expect(
      decidirPapel({ email: 'narrador@exemplo.com', narradorEmail: '' }),
    ).toBeNull()
  })
})

describe('normalizarEmail', () => {
  it('remove espaços e põe em minúsculas', () => {
    expect(normalizarEmail('  Ana@Exemplo.COM ')).toBe('ana@exemplo.com')
  })
})

describe('nomeCurto', () => {
  it('pega os dois primeiros nomes da conta Google', () => {
    expect(nomeCurto('Arthur Gustavo Barros Costa')).toBe('Arthur Gustavo')
  })

  it('mantém a partícula entre os dois nomes', () => {
    expect(nomeCurto('Maria da Silva Santos')).toBe('Maria da Silva')
    expect(nomeCurto('João de Souza')).toBe('João de Souza')
  })

  it('nome único ou com espaços sobrando', () => {
    expect(nomeCurto('  Ana  ')).toBe('Ana')
    expect(nomeCurto('Rui   Barbosa  Lima')).toBe('Rui Barbosa')
  })
})

describe('iniciais', () => {
  it('gera iniciais do primeiro e último nome', () => {
    expect(iniciais('Arthur Gustavo')).toBe('AG')
    expect(iniciais('Helena Sarmento')).toBe('HS')
    expect(iniciais('Maria da Silva Santos')).toBe('MS')
  })

  it('gera uma letra para nome único', () => {
    expect(iniciais('Helena')).toBe('H')
    expect(iniciais('  Rui ')).toBe('R')
  })

  it('lida com string vazia', () => {
    expect(iniciais('')).toBe('')
    expect(iniciais('   ')).toBe('')
  })
})
