import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import { db } from '#/db'
import type { Relogio } from '#/domain/relogios'
import { listarRelogiosNoBanco, moverRelogioNoBanco, retirarRelogioNoBanco, salvarRelogioNoBanco } from './relogios-db'

const novoRelogio = (): Relogio => ({
  id: randomUUID(), nome: 'Insônia', tipo: 'Ameaça', descricao: '', total: 6, atual: 3,
  perigo: 'aumenta', visivel: true,
  efeitos: [{ id: randomUUID(), titulo: 'Cidade sem sono', condicao: 'a_partir_de', etapa: 4,
    textoAtivacao: 'Ninguém dorme.', textoDesativacao: 'Algumas pessoas voltaram a dormir.' }],
})

async function semPersistir(executar: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<void>) {
  const reverter = new Error('Reverter apenas os dados deste teste')
  try {
    await db.transaction(async (tx) => { await executar(tx); throw reverter })
  } catch (erro) {
    if (erro !== reverter) throw erro
  }
}

describe('Relógios persistidos', () => {
  it('ao revelar, anuncia apenas os efeitos atuais sem expor textos removidos do Relógio oculto', async () => {
    await semPersistir(async (tx) => {
      const entrada = { ...novoRelogio(), atual: 6, visivel: false }
      const criado = await salvarRelogioNoBanco('narrador', entrada, null, tx)
      const efeitoPublico = { ...entrada.efeitos[0], id: randomUUID(), titulo: 'Alerta público', textoAtivacao: 'A cidade está em alerta.' }
      const revelado = await salvarRelogioNoBanco('narrador', { ...entrada, visivel: true, efeitos: [efeitoPublico] }, criado.relogio.revisao, tx)
      expect(revelado.avisos).toEqual([{ efeitoId: efeitoPublico.id, titulo: 'Alerta público', texto: 'A cidade está em alerta.', ativo: true }])
    })
  })

  it('calcula a piora ao ampliar o total e mover além do limite antigo', async () => {
    await semPersistir(async (tx) => {
      const entrada = { ...novoRelogio(), atual: 6 }
      const criado = await salvarRelogioNoBanco('narrador', entrada, null, tx)
      const editado = await salvarRelogioNoBanco('narrador', { ...entrada, total: 8, atual: 7 }, criado.relogio.revisao, tx)
      expect(editado.relogio).toMatchObject({ total: 8, atual: 7, ultimaTendencia: 'piora' })
      expect(editado.avisos).toEqual([])
    })
  })

  it('salva o início, reavalia efeitos nos dois sentidos e só retira manualmente', async () => {
    await semPersistir(async (tx) => {
      const entrada = novoRelogio()
      const criado = await salvarRelogioNoBanco('narrador', entrada, null, tx)
      expect(criado.relogio.atual).toBe(3)
      expect(criado.avisos).toEqual([])
      const subiu = await moverRelogioNoBanco('narrador', entrada.id, 1, tx)
      expect(subiu.relogio).toMatchObject({ atual: 4, ultimaTendencia: 'piora' })
      expect(subiu.avisos[0]).toMatchObject({ ativo: true, texto: 'Ninguém dorme.' })
      const desceu = await moverRelogioNoBanco('narrador', entrada.id, -1, tx)
      expect(desceu.avisos[0]).toMatchObject({ ativo: false, texto: 'Algumas pessoas voltaram a dormir.' })
      for (let i = 0; i < 8; i++) await moverRelogioNoBanco('narrador', entrada.id, -1, tx)
      expect((await listarRelogiosNoBanco('jogador', tx)).find((r) => r.id === entrada.id)?.atual).toBe(0)
      for (let i = 0; i < 8; i++) await moverRelogioNoBanco('narrador', entrada.id, 1, tx)
      expect((await listarRelogiosNoBanco('jogador', tx)).find((r) => r.id === entrada.id)?.atual).toBe(6)
      await retirarRelogioNoBanco('narrador', entrada.id, tx)
      expect((await listarRelogiosNoBanco('narrador', tx)).some((r) => r.id === entrada.id)).toBe(false)
    })
  })

  it('não envia relógios ocultos ao Jogador e nega todas as alterações desse papel', async () => {
    await semPersistir(async (tx) => {
      const entrada = { ...novoRelogio(), visivel: false }
      const criado = await salvarRelogioNoBanco('narrador', entrada, null, tx)
      expect((await listarRelogiosNoBanco('jogador', tx)).some((r) => r.id === entrada.id)).toBe(false)
      expect((await listarRelogiosNoBanco('narrador', tx)).some((r) => r.id === entrada.id)).toBe(true)
      await expect(salvarRelogioNoBanco('jogador', entrada, criado.relogio.revisao, tx)).rejects.toThrow('Acesso negado')
      await expect(moverRelogioNoBanco('jogador', entrada.id, 1, tx)).rejects.toThrow('Acesso negado')
      await expect(retirarRelogioNoBanco('jogador', entrada.id, tx)).rejects.toThrow('Acesso negado')
      expect((await listarRelogiosNoBanco('narrador', tx)).find((r) => r.id === entrada.id)?.atual).toBe(3)
    })
  })

  it('recusa edição antiga para não sobrescrever um movimento feito em outra aba', async () => {
    await semPersistir(async (tx) => {
      const entrada = novoRelogio()
      const criado = await salvarRelogioNoBanco('narrador', entrada, null, tx)
      await moverRelogioNoBanco('narrador', entrada.id, 1, tx)
      await expect(salvarRelogioNoBanco('narrador', { ...entrada, nome: 'Edição antiga' }, criado.relogio.revisao, tx))
        .rejects.toThrow('O Relógio mudou')
      expect((await listarRelogiosNoBanco('narrador', tx)).find((r) => r.id === entrada.id)).toMatchObject({ nome: 'Insônia', atual: 4 })
    })
  })
})
