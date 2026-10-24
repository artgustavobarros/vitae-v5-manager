import { beforeEach, describe, expect, it } from 'vitest'

import { db } from '#/db'
import { cronica } from '#/db/schema'
import { OPCOES_CRIACAO_CRONICA_PADRAO, type OpcoesCriacaoCronica } from '#/domain/cronica'
import {
  atualizarOpcoesCriacaoCronicaNoBanco,
  obterOpcoesCriacaoCronicaDoBanco,
} from './cronica-db'

describe('Opções da Crônica no banco (cronica-db)', () => {
  beforeEach(async () => {
    await db.delete(cronica)
  })

  describe('obterOpcoesCriacaoCronicaDoBanco', () => {
    it('cria linha padrão quando a tabela está vazia', async () => {
      const opcoes = await obterOpcoesCriacaoCronicaDoBanco()
      expect(opcoes).toEqual(OPCOES_CRIACAO_CRONICA_PADRAO)

      // Confere se foi persistido no banco
      const [noBanco] = await db.select().from(cronica)
      expect(noBanco).toBeDefined()
      expect(noBanco.opcoesCriacao).toEqual(OPCOES_CRIACAO_CRONICA_PADRAO)
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

  describe('atualizarOpcoesCriacaoCronicaNoBanco', () => {
    it('atualiza opções quando já existe registro', async () => {
      await db.insert(cronica).values({
        nome: 'Crônica Inicial',
        opcoesCriacao: OPCOES_CRIACAO_CRONICA_PADRAO,
      })

      const novasOpcoes: OpcoesCriacaoCronica = {
        idadePadrao: 'ancillae',
        sangueRaloPermitido: true,
        caitiffPermitido: false,
        clasPermitidos: ['brujah', 'gangrel'],
      }

      const resultado = await atualizarOpcoesCriacaoCronicaNoBanco(novasOpcoes)
      expect(resultado).toEqual(novasOpcoes)

      const [noBanco] = await db.select().from(cronica)
      expect(noBanco.opcoesCriacao).toEqual(novasOpcoes)
    })

    it('cria linha quando a tabela está vazia', async () => {
      const novasOpcoes: OpcoesCriacaoCronica = {
        idadePadrao: 'neonato',
        sangueRaloPermitido: false,
        caitiffPermitido: true,
        clasPermitidos: ['tremere', 'nosferatu'],
      }

      const resultado = await atualizarOpcoesCriacaoCronicaNoBanco(novasOpcoes)
      expect(resultado).toEqual(novasOpcoes)

      const [noBanco] = await db.select().from(cronica)
      expect(noBanco).toBeDefined()
      expect(noBanco.opcoesCriacao).toEqual(novasOpcoes)
    })
  })
})
