import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '#/db'
import { cronica } from '#/db/schema'
import { OPCOES_CRIACAO_CRONICA_PADRAO, type OpcoesCriacaoCronica } from '#/domain/cronica'
import {
  obterOpcoesCriacaoCronicaDoBanco,
} from './cronica-db'

describe('Opções da Crônica no banco (cronica-db)', () => {
  beforeEach(async () => {
    await db.delete(cronica)
  })

  describe('obterOpcoesCriacaoCronicaDoBanco', () => {
    it('usa padrões sem criar registro quando a tabela está vazia', async () => {
      const opcoes = await obterOpcoesCriacaoCronicaDoBanco()
      expect(opcoes).toEqual(OPCOES_CRIACAO_CRONICA_PADRAO)

      expect(await db.select().from(cronica)).toEqual([])
    })

    it('retorna registro existente sem duplicar linha', async () => {
      const customizadas: OpcoesCriacaoCronica = {
        idadePadrao: 'ancillae',
        sangueRaloPermitido: true,
        caitiffPermitido: false,
        clasPermitidos: ['brujah', 'toreador', 'ventrue'],
      }

      await db.insert(cronica).values({
        nome: 'Crônica Teste',
        opcoesCriacao: customizadas,
      })

      const opcoes = await obterOpcoesCriacaoCronicaDoBanco()
      expect(opcoes).toEqual(customizadas)

      const todas = await db.select().from(cronica)
      expect(todas.length).toBe(1)
    })
  })

})
