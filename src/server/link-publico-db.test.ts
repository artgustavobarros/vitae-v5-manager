import { describe, expect, it } from 'vitest'

import { db } from '#/db'
import { combate, linkPublico, relogio } from '#/db/schema'
import { iniciarCombate } from '#/domain/combate'
import { randomUUID } from 'node:crypto'
import { carregarExibicaoPublicaNoBanco } from './exibicao-publica-db'
import { gerarLinkPublicoNoBanco, revogarLinkPublicoNoBanco, validarLinkPublicoNoBanco } from './link-publico-db'

async function semPersistir(executar: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<void>) {
  const reverter = new Error('Reverter os dados do teste de link público')
  try {
    await db.transaction(async (tx) => { await executar(tx); throw reverter })
  } catch (erro) { if (erro !== reverter) throw erro }
}

describe('Link público persistido', () => {
  it('gera um link imprevisível, substitui o anterior e permite revogação', async () => {
    await semPersistir(async (tx) => {
      const primeiro = await gerarLinkPublicoNoBanco('narrador', tx)
      expect(primeiro).toMatch(/^[A-Za-z0-9_-]{43}$/)
      const [armazenado] = await tx.select().from(linkPublico)
      expect(armazenado.tokenHash).toMatch(/^[a-f0-9]{64}$/)
      expect(armazenado.tokenHash).not.toBe(primeiro)
      expect(await validarLinkPublicoNoBanco(primeiro, tx)).toBe(true)
      const segundo = await gerarLinkPublicoNoBanco('narrador', tx)
      expect(segundo).not.toBe(primeiro)
      expect(await validarLinkPublicoNoBanco(primeiro, tx)).toBe(false)
      expect(await validarLinkPublicoNoBanco(segundo, tx)).toBe(true)
      await revogarLinkPublicoNoBanco('narrador', tx)
      expect(await validarLinkPublicoNoBanco(segundo, tx)).toBe(false)
      expect(await validarLinkPublicoNoBanco('invalido', tx)).toBe(false)
    })
  })

  it('não deixa Jogadores gerar ou revogar o link da mesa', async () => {
    await semPersistir(async (tx) => {
      const token = await gerarLinkPublicoNoBanco('narrador', tx)
      await expect(gerarLinkPublicoNoBanco('jogador', tx)).rejects.toThrow('Acesso negado')
      await expect(revogarLinkPublicoNoBanco('jogador', tx)).rejects.toThrow('Acesso negado')
      expect(await validarLinkPublicoNoBanco(token, tx)).toBe(true)
    })
  })

  it('lê o estado público sem sessão e deixa de entregar os dados depois da revogação', async () => {
    await semPersistir(async (tx) => {
      const token = await gerarLinkPublicoNoBanco('narrador', tx)
      const idVisivel = randomUUID(), idOculto = randomUUID()
      await tx.insert(relogio).values([
        { id: idVisivel, nome: 'Cerco público', tipo: 'Ameaça', total: 6, atual: 2, perigo: 'aumenta', visivel: true },
        { id: idOculto, nome: 'Segredo oculto', tipo: 'Ameaça', total: 6, atual: 2, perigo: 'aumenta', visivel: false },
      ])
      await tx.update(combate).set({ ativo: false })
      await tx.insert(combate).values(iniciarCombate([{
        id: 'guarda', tipo: 'inimigo', nome: 'Guarda público', vitalidadeMax: 5,
        danoVitalidade: { superficial: 1, agravado: 0 }, vontadeMax: 3,
        danoVontade: { superficial: 0, agravado: 0 }, revelarVitalidade: false,
        paradas: { fisico: 4, social: 2, mental: 2, excepcionais: [] },
        especiais: [], notas: 'Segredo do guarda', condicoes: [],
      }]))
      const publico = await carregarExibicaoPublicaNoBanco(token, tx)
      expect(publico.valido).toBe(true)
      if (!publico.valido) throw new Error('Esperava um link válido')
      expect(publico.relogios.some((r) => r.id === idVisivel)).toBe(true)
      expect(publico.relogios.some((r) => r.id === idOculto)).toBe(false)
      expect(publico.combate?.participantes[0]).toMatchObject({ nome: 'Guarda público', vitalidadeOculta: true })
      expect(JSON.stringify(publico)).not.toMatch(/Segredo oculto|Segredo do guarda/)
      await revogarLinkPublicoNoBanco('narrador', tx)
      expect(await carregarExibicaoPublicaNoBanco(token, tx)).toEqual({ valido: false })
    })
  })
})
