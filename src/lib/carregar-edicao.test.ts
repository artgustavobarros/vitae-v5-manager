import { describe, expect, it } from 'vitest'

import { carregarEdicao } from './carregar-edicao'

const falha = () => Promise.reject(new Error('banco fora do ar'))
const nunca = () => new Promise<never>(() => {})

describe('carregarEdicao', () => {
  it('Ficha inexistente redireciona mesmo se as opções da Crônica falharem', async () => {
    await expect(carregarEdicao(() => Promise.resolve(null), falha)).resolves.toEqual({ tipo: 'inexistente' })
  })

  it('busca da Ficha negada redireciona mesmo se as opções da Crônica falharem', async () => {
    await expect(carregarEdicao(falha, falha)).resolves.toEqual({ tipo: 'inexistente' })
  })

  it('acesso de leitura redireciona mesmo se as opções da Crônica falharem', async () => {
    const resultado = await carregarEdicao(() => Promise.resolve({ acesso: 'ler' as const }), falha)
    expect(resultado).toEqual({ tipo: 'semEdicao' })
  })

  it('acesso de leitura não espera as opções da Crônica', async () => {
    const resultado = await carregarEdicao(() => Promise.resolve({ acesso: 'ler' as const }), nunca)
    expect(resultado).toEqual({ tipo: 'semEdicao' })
  })

  it('acesso de edição devolve a Ficha com as opções da Crônica', async () => {
    const personagem = { acesso: 'editar' as const }
    const resultado = await carregarEdicao(
      () => Promise.resolve(personagem),
      () => Promise.resolve({ clas: ['Brujah'] }),
    )
    expect(resultado).toEqual({ tipo: 'editar', personagem, opcoesCronica: { clas: ['Brujah'] } })
  })

  it('acesso de edição propaga a falha das opções da Crônica', async () => {
    await expect(carregarEdicao(() => Promise.resolve({ acesso: 'editar' as const }), falha)).rejects.toThrow(
      'banco fora do ar',
    )
  })
})
