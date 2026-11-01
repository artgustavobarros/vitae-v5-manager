import { randomUUID } from 'node:crypto'

import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { db } from '#/db'
import { modeloAntagonista } from '#/db/schema'
import { criarModeloAntagonistaPadrao } from '#/domain/bestiario'
import {
  concluirRevisaoBestiarioNoBanco,
  listarModelosBestiarioNoBanco,
  listarModelosParaRevisaoNoBanco,
  registrarRevisaoModeloNoBanco,
  salvarModeloBestiarioNoBanco,
} from './revisao-bestiario-db'

describe('Aprovação do Bestiário no banco', () => {
  it('mantém todos durante a revisão e publica só os aprovados ao concluir sem apagar os demais', async () => {
    const reverter = new Error('Reverter os dados de teste')
    try {
      await db.transaction(async (tx) => {
        await tx.delete(modeloAntagonista)
        const aprovadoId = randomUUID()
        const rejeitadoId = randomUUID()
        await tx.insert(modeloAntagonista).values([
          { ...criarModeloAntagonistaPadrao(), id: aprovadoId, nome: 'Modelo revisado' },
          { ...criarModeloAntagonistaPadrao(), id: rejeitadoId, nome: 'Modelo recusado' },
        ])
        expect(await listarModelosBestiarioNoBanco(tx)).toHaveLength(2)
        await expect(concluirRevisaoBestiarioNoBanco(tx)).rejects.toThrow('2 Modelos')
        await registrarRevisaoModeloNoBanco({ id: aprovadoId, revisao: { status: 'corrigir', nota: 'Conferir nome e Social' } }, tx)
        const [corrigir] = (await listarModelosParaRevisaoNoBanco(tx)).filter((m) => m.id === aprovadoId)
        expect(corrigir.revisao).toEqual({ status: 'corrigir', nota: 'Conferir nome e Social' })
        await salvarModeloBestiarioNoBanco({ ...corrigir, nome: 'Investigador da Inquisição', paradaSocial: 0,
          revisao: { status: 'aprovado', nota: 'Conferido' } }, tx)
        await registrarRevisaoModeloNoBanco({ id: rejeitadoId, revisao: { status: 'rejeitado', nota: 'Não usar nesta Crônica' } }, tx)
        expect(await listarModelosBestiarioNoBanco(tx)).toHaveLength(2)
        expect(await concluirRevisaoBestiarioNoBanco(tx)).toEqual({ aprovados: 1, rejeitados: 1 })
        expect(await listarModelosBestiarioNoBanco(tx)).toMatchObject([
          { id: aprovadoId, nome: 'Investigador da Inquisição', paradaSocial: 0 },
        ])
        expect(await listarModelosParaRevisaoNoBanco(tx)).toHaveLength(2)
        const [recusado] = await tx.select().from(modeloAntagonista).where(eq(modeloAntagonista.id, rejeitadoId))
        expect(recusado).toMatchObject({ incluido: false, statusRevisao: 'rejeitado', notaRevisao: 'Não usar nesta Crônica' })
        await expect(registrarRevisaoModeloNoBanco({ id: randomUUID(), revisao: { status: 'aprovado', nota: '' } }, tx))
          .rejects.toThrow('Modelo não encontrado')

        // A página mantém os recusados e permite uma nova decisão sem recriar a ficha.
        await registrarRevisaoModeloNoBanco({ id: rejeitadoId, revisao: { status: 'aprovado', nota: '' } }, tx)
        await concluirRevisaoBestiarioNoBanco(tx)
        expect(await listarModelosBestiarioNoBanco(tx)).toHaveLength(2)
        throw reverter
      })
    } catch (erro) {
      if (erro !== reverter) throw erro
    }
  })
})
