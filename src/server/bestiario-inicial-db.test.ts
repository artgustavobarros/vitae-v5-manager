import { randomUUID } from 'node:crypto'

import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { db } from '#/db'
import { modeloAntagonista } from '#/db/schema'
import { salvarModeloBestiarioNoBanco, listarModelosParaRevisaoNoBanco } from './revisao-bestiario-db'
import { criarModeloAntagonistaPadrao } from '#/domain/bestiario'
import { FONTES_MODELOS_BESTIARIO } from '#/domain/bestiario-fontes'
import { inserirModelosIniciaisBestiario } from './bestiario-inicial-db'

describe('Carga inicial do Bestiário no banco', () => {
  it('insere as fichas traduzidas uma vez e preserva Modelos existentes e edições do Narrador', async () => {
    const reverter = new Error('Reverter os dados de teste')
    try {
      await db.transaction(async (tx) => {
        await tx.delete(modeloAntagonista)
        const existenteId = randomUUID()
        await tx.insert(modeloAntagonista).values({
          ...criarModeloAntagonistaPadrao(),
          id: existenteId,
          nome: '  URSO  ',
          paradaSocial: 0,
          notas: 'Modelo do Narrador',
        })

        const primeira = await inserirModelosIniciaisBestiario(tx)
        expect(primeira).toEqual({ inseridos: 39, preservados: 1 })
        const modelos = await tx.select().from(modeloAntagonista)
        expect(modelos).toHaveLength(40)
        expect(modelos.find((m) => m.id === existenteId)).toMatchObject({
          nome: '  URSO  ', paradaSocial: 0, notas: 'Modelo do Narrador',
        })
        const cao = modelos.find((m) => m.nome === 'Cão de guarda')!
        expect(cao).toMatchObject({
          categoria: 'Animal', paradaFisico: 5, paradaSocial: 1, paradaMental: 1,
          vitalidade: 5, vontade: 2,
        })
        expect(cao.especiais).toContainEqual({ nome: 'Mordida', descricao: 'A mordida causa +1 de dano.' })
        const recusados = modelos.filter((m) =>
          FONTES_MODELOS_BESTIARIO[m.id]?.titulo === 'Victim SPC Cards — Groulien'
          || m.id === 'f1413091-d260-5708-9c39-4dbc89282039',
        )
        expect(recusados).toEqual([])

        const fada = (await listarModelosParaRevisaoNoBanco(tx)).find((m) => m.nome === 'Fada')!
        expect(fada).toMatchObject({ paradaFisico: null, revisao: { status: 'pendente' }, incluido: true })
        expect(fada.fichaCompleta).toMatchObject({ atributos: { carisma: 7 }, habilidades: { Empatia: 3 }, humanidade: null })
        expect(fada.fonte?.titulo).toBe('Craft — GooseGooseDuck')
        await salvarModeloBestiarioNoBanco({ ...fada, nome: 'Fada do Narrador', fichaCompleta: {
          ...fada.fichaCompleta!, atributos: { ...fada.fichaCompleta!.atributos, carisma: 8 },
        } }, tx)

        await tx.update(modeloAntagonista)
          .set({ nome: 'Cão do Narrador', paradaSocial: 0, notas: 'Editado pelo Narrador' })
          .where(eq(modeloAntagonista.id, cao.id))
        expect(await inserirModelosIniciaisBestiario(tx)).toEqual({ inseridos: 0, preservados: 40 })
        const [editado] = await tx.select().from(modeloAntagonista).where(eq(modeloAntagonista.id, cao.id))
        expect(editado).toMatchObject({ nome: 'Cão do Narrador', paradaSocial: 0, notas: 'Editado pelo Narrador' })
        expect(await tx.select().from(modeloAntagonista)).toHaveLength(40)
        expect((await listarModelosParaRevisaoNoBanco(tx)).find((m) => m.id === fada.id)).toMatchObject({ nome: 'Fada do Narrador', fichaCompleta: { atributos: { carisma: 8 } } })

        // Reverte inclusive a preparação para preservar qualquer conteúdo anterior do banco de testes.
        throw reverter
      })
    } catch (erro) {
      if (erro !== reverter) throw erro
    }
  })
})
