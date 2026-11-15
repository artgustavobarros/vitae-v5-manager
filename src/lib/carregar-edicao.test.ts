import { describe, expect, it } from 'vitest'

import { carregarEdicao } from './carregar-edicao'

describe('carregarEdicao', () => {
  it('identifica Ficha inexistente', async () => {
    await expect(carregarEdicao(async () => null)).resolves.toEqual({ tipo: 'inexistente' })
  })

  it('trata busca da Ficha negada como indisponível', async () => {
    await expect(carregarEdicao(async () => { throw new Error('acesso negado') })).resolves.toEqual({ tipo: 'inexistente' })
  })

  it('não permite editar com acesso de leitura', async () => {
    await expect(carregarEdicao(async () => ({ acesso: 'ler' }))).resolves.toEqual({ tipo: 'semEdicao' })
  })

  it('devolve a Ficha disponível para edição', async () => {
    const personagem = { acesso: 'editar', nome: 'Ana' }
    await expect(carregarEdicao(async () => personagem)).resolves.toEqual({ tipo: 'editar', personagem })
  })
})
