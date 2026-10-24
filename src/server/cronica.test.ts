import { beforeEach, describe, expect, it, vi } from 'vitest'

import { db } from '#/db'
import { cronica } from '#/db/schema'
import { OPCOES_CRIACAO_CRONICA_PADRAO, type OpcoesCriacaoCronica } from '#/domain/cronica'
import { atualizarOpcoesCriacaoCronica, obterOpcoesCriacaoCronica } from './cronica'

// Mock de autenticação e headers
let mockPapel: 'narrador' | 'jogador' | null = null

vi.mock('@tanstack/react-start/server', () => ({
  getRequestHeaders: () => new Headers(),
}))

vi.mock('#/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(async () => {
        if (!mockPapel) return null
        return {
          user: {
            id: 'test-user-id',
            name: 'Usuário Teste',
            email: 'teste@v5.local',
            image: null,
            papel: mockPapel,
            username: 'teste',
            displayUsername: 'teste',
          },
        }
      }),
    },
  },
}))

function executarNoContextoServidor<T>(fn: () => Promise<T>): Promise<T> {
  const key = Symbol.for('tanstack-start:start-storage-context')
  const storage = (globalThis as unknown as { [key: symbol]: any })[key]
  if (storage?.run) {
    return storage.run({ startOptions: {} }, fn)
  }
  return fn()
}

type ExecuteServerResult = { error: Error } | { result: OpcoesCriacaoCronica }

async function chamarObter(): Promise<OpcoesCriacaoCronica> {
  const res = (await executarNoContextoServidor(() =>
    (obterOpcoesCriacaoCronica as any).__executeServer({}),
  )) as ExecuteServerResult
  if ('error' in res) throw res.error
  return res.result
}

async function chamarAtualizar(data: unknown): Promise<OpcoesCriacaoCronica> {
  const res = (await executarNoContextoServidor(() =>
    (atualizarOpcoesCriacaoCronica as any).__executeServer({ data }),
  )) as ExecuteServerResult
  if ('error' in res) throw res.error
  return res.result
}

describe('Opções da Crônica (servidor)', () => {
  beforeEach(async () => {
    mockPapel = null
    // Limpar tabela cronica para isolamento dos testes
    await db.delete(cronica)
  })

  describe('obterOpcoesCriacaoCronica', () => {
    it('bloqueia usuário anônimo', async () => {
      mockPapel = null
      await expect(chamarObter()).rejects.toThrow('Acesso negado')
    })

    it('permite jogador e cria linha padrão quando a tabela está vazia', async () => {
      mockPapel = 'jogador'
      const opcoes = await chamarObter()
      expect(opcoes).toEqual(OPCOES_CRIACAO_CRONICA_PADRAO)

      // Verifica se realmente foi persistido no banco
      const registros = await db.select().from(cronica)
      expect(registros).toHaveLength(1)
      expect(registros[0].opcoesCriacao).toEqual(OPCOES_CRIACAO_CRONICA_PADRAO)
    })

    it('permite narrador e retorna registro existente', async () => {
      mockPapel = 'narrador'
      const customizadas: OpcoesCriacaoCronica = {
        idadePadrao: 'ancillae',
        sangueRaloPermitido: true,
        caitiffPermitido: false,
        clasPermitidos: ['brujah', 'toreador', 'ventrue'],
      }

      await db.insert(cronica).values({
        nome: 'Mesa de Elite',
        opcoesCriacao: customizadas,
      })

      const opcoes = await chamarObter()
      expect(opcoes).toEqual(customizadas)
    })
  })

  describe('atualizarOpcoesCriacaoCronica', () => {
    it('bloqueia jogador comum', async () => {
      mockPapel = 'jogador'
      await expect(
        chamarAtualizar({
          idadePadrao: 'neonato',
          sangueRaloPermitido: true,
          caitiffPermitido: true,
          clasPermitidos: ['ventrue'],
        }),
      ).rejects.toThrow('Acesso negado')
    })

    it('permite narrador atualizar opções quando já existe registro', async () => {
      mockPapel = 'narrador'

      // Cria registro inicial
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

      const resultado = await chamarAtualizar(novasOpcoes)
      expect(resultado).toEqual(novasOpcoes)

      // Confere no banco
      const [noBanco] = await db.select().from(cronica)
      expect(noBanco.opcoesCriacao).toEqual(novasOpcoes)
    })

    it('permite narrador atualizar opções quando a tabela está vazia', async () => {
      mockPapel = 'narrador'

      const novasOpcoes: OpcoesCriacaoCronica = {
        idadePadrao: 'neonato',
        sangueRaloPermitido: false,
        caitiffPermitido: true,
        clasPermitidos: ['tremere', 'nosferatu'],
      }

      const resultado = await chamarAtualizar(novasOpcoes)
      expect(resultado).toEqual(novasOpcoes)

      const [noBanco] = await db.select().from(cronica)
      expect(noBanco).toBeDefined()
      expect(noBanco.opcoesCriacao).toEqual(novasOpcoes)
    })

    it('rejeita opções inválidas pelo schema', async () => {
      mockPapel = 'narrador'

      await expect(
        chamarAtualizar({
          idadePadrao: 'matusalem',
          sangueRaloPermitido: false,
          caitiffPermitido: true,
          clasPermitidos: [],
        }),
      ).rejects.toThrow()
    })
  })
})
