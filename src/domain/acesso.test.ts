import { describe, expect, it } from 'vitest'

import { decidirPapel, normalizarEmail } from './acesso'

const narradorEmail = 'narrador@exemplo.com'

describe('decidirPapel', () => {
  it('reconhece o Narrador pelo e-mail configurado', () => {
    expect(
      decidirPapel({ email: 'narrador@exemplo.com', narradorEmail, temConvite: false }),
    ).toBe('narrador')
  })

  it('ignora maiúsculas e espaços ao comparar o e-mail do Narrador', () => {
    expect(
      decidirPapel({ email: '  Narrador@Exemplo.com ', narradorEmail, temConvite: false }),
    ).toBe('narrador')
  })

  it('aceita como Jogador quem tem Convite para a Crônica', () => {
    expect(
      decidirPapel({ email: 'ana@exemplo.com', narradorEmail, temConvite: true }),
    ).toBe('jogador')
  })

  it('recusa quem não é Narrador nem tem Convite', () => {
    expect(
      decidirPapel({ email: 'intruso@exemplo.com', narradorEmail, temConvite: false }),
    ).toBeNull()
  })

  it('fora do dev, o Narrador não cria conta por senha, só pelo Google', () => {
    expect(
      decidirPapel({ email: 'narrador@exemplo.com', narradorEmail, temConvite: false, metodo: 'senha', dev: false }),
    ).toBeNull()
    expect(
      decidirPapel({ email: 'narrador@exemplo.com', narradorEmail, temConvite: false, metodo: 'senha', dev: true }),
    ).toBe('narrador')
  })

  it('com convite, a conta por senha vira Jogador mesmo fora do dev', () => {
    expect(
      decidirPapel({ email: 'x@jogador.umbra.invalid', narradorEmail, temConvite: true, metodo: 'senha', dev: false }),
    ).toBe('jogador')
  })

  it('recusa todo mundo sem convite quando o Narrador não está configurado', () => {
    expect(
      decidirPapel({ email: 'narrador@exemplo.com', narradorEmail: '', temConvite: false }),
    ).toBeNull()
  })
})

describe('normalizarEmail', () => {
  it('remove espaços e põe em minúsculas', () => {
    expect(normalizarEmail('  Ana@Exemplo.COM ')).toBe('ana@exemplo.com')
  })
})
