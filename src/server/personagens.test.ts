import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fichaNeofito, type Ficha } from '#/domain/ficha'
import { OPCOES_CRIACAO_CRONICA_PADRAO } from '#/domain/cronica'
import { aplicarPredador } from '#/domain/criacao'
import { tipoPredador } from '#/domain/catalogo'
import { fichaSchema } from '#/domain/ficha'

// O transporte, o banco e a entrega de notificações são as fronteiras externas.
const memoria = vi.hoisted(() => ({
  usuario: { id: 'n1', papel: 'narrador' as 'narrador' | 'jogador', nome: 'Narrador' },
  personagem: {} as {
    id: string; donoId: string; nome: string; status: 'ativo' | 'rascunho' | 'arquivado';
    tipo: 'jogador' | 'nao_jogador'; atribuidoA: null; ficha: Ficha; apagado?: boolean;
  },
  notificacoes: [] as { usuarioId: string; texto: string }[],
}))

vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      validator: () => builder,
      handler: (executar: (entrada: unknown) => unknown) =>
        (entrada: { data?: unknown } = {}) => executar({ ...entrada, context: { usuario: memoria.usuario } }),
    }
    return builder
  },
}))
vi.mock('#/server/sessao', () => ({ exigirUsuario: {}, exigirNarrador: {} }))
vi.mock('#/server/eventos', () => ({ barramento: { emitir: () => {} } }))
vi.mock('#/server/enviar-notificacao', () => ({
  enviarNotificacao: async (notificacao: { usuarioId: string; texto: string }) => {
    memoria.notificacoes.push(notificacao)
  },
  notificarNarradores: async () => {},
}))
vi.mock('#/db', async () => {
  const { cronica } = await import('#/db/schema')
  const banco = {
    select: () => ({
      from: (tabela: unknown) => {
        const linhas = tabela === cronica
          ? [{ id: 'cronica-1', opcoesCriacao: OPCOES_CRIACAO_CRONICA_PADRAO }]
          : [{ ...memoria.personagem }]
        const consulta = Object.assign(Promise.resolve(linhas), {
          where: () => consulta,
          for: async () => linhas,
          limit: async () => linhas,
        })
        return consulta
      },
    }),
    update: () => ({ set: (valores: object) => ({
      where: async () => { Object.assign(memoria.personagem, valores) },
    }) }),
    delete: () => ({ where: async () => { memoria.personagem.apagado = true } }),
    transaction: async (executar: (tx: unknown) => unknown): Promise<unknown> => executar(banco),
  }
  return { db: banco }
})

import { apagarRascunho, concluir, definirAtividadePersonagem, definirTipoPersonagem, salvarFicha } from './personagens'

beforeEach(() => {
  memoria.usuario = { id: 'n1', papel: 'narrador', nome: 'Narrador' }
  memoria.personagem = {
    id: 'p1', donoId: 'j1', nome: 'Helena', status: 'ativo', tipo: 'jogador', atribuidoA: null,
    ficha: { ...fichaNeofito(), cla: 'brujah', vantagens: [{ id: 'vantagem-modo-nuit', nivel: 2 }] },
  }
  memoria.notificacoes = []
})

describe('salvarFicha', () => {
  it('só permite ao Narrador excluir um Rascunho', async () => {
    await expect(apagarRascunho({ data: { id: 'p1' } })).rejects.toThrow('Rascunhos')
    expect(memoria.personagem.apagado).not.toBe(true)
    memoria.personagem.status = 'rascunho'
    await apagarRascunho({ data: { id: 'p1' } })
    expect(memoria.personagem.apagado).toBe(true)
  })

  it('permite ao Narrador ativar, desativar e classificar sem alterar a Ficha', async () => {
    const ficha = memoria.personagem.ficha
    await definirAtividadePersonagem({ data: { id: 'p1', ativo: false } })
    expect(memoria.personagem.status).toBe('rascunho')
    await definirAtividadePersonagem({ data: { id: 'p1', ativo: true } })
    expect(memoria.personagem.status).toBe('ativo')
    await definirTipoPersonagem({ data: { id: 'p1', tipo: 'nao_jogador' } })
    expect(memoria.personagem.tipo).toBe('nao_jogador')
    expect(memoria.personagem.ficha).toBe(ficha)
  })

  it('conclui Sacoleiro sem contar a Vantagem opcional do Predador nos 7 pessoais', async () => {
    memoria.personagem.status = 'rascunho'
    const pessoais = {
      ...fichaNeofito(), cla: 'brujah' as const, tipoPredador: 'tipo-predador-sacoleiro',
      disciplinas: [{ disciplina: 'potencia' as const, nivel: 2 }],
      vantagens: [{ id: 'vantagem-recursos', nivel: 5 }, { id: 'vantagem-contatos', nivel: 2 }],
      defeitos: [{ id: 'defeito-fazendeiro', nivel: 2 }],
    }
    memoria.personagem.ficha = fichaSchema.parse(aplicarPredador(pessoais, tipoPredador('tipo-predador-sacoleiro')!, {
      disciplina: 'ofuscacao',
      especializacao: { habilidade: 'ladroagem', especializacao: 'Arrombamento' },
      tracoEscolhido: { tipo: 'vantagem', id: 'vantagem-contatos', nivel: 1 },
    }))
    await concluir({ data: { id: 'p1' } })
    expect(memoria.personagem.status).toBe('ativo')
  })

  it('preserva o Clã ao salvar outros campos do Personagem Ativo', async () => {
    await salvarFicha({ data: {
      id: 'p1', nome: 'Helena', ficha: { ...memoria.personagem.ficha, conceito: 'Artista' },
    } })
    expect(memoria.personagem.ficha.cla).toBe('brujah')
    expect(memoria.personagem.ficha.conceito).toBe('Artista')
  })

  it('continua permitindo escolher o Clã no Rascunho e editar o Clã de PdN', async () => {
    memoria.personagem.donoId = 'n1'
    await salvarFicha({ data: {
      id: 'p1', nome: 'Helena', ficha: { ...memoria.personagem.ficha, cla: 'ventrue' },
    } })
    expect(memoria.personagem.ficha.cla).toBe('ventrue')
    memoria.personagem.status = 'rascunho'
    memoria.personagem.donoId = 'j1'
    await salvarFicha({ data: {
      id: 'p1', nome: 'Helena', ficha: { ...memoria.personagem.ficha, cla: 'toreador' },
    } })
    expect(memoria.personagem.ficha.cla).toBe('toreador')
  })

  it('conclui quando as Vantagens e Defeitos estão dentro das regras', async () => {
    memoria.personagem.status = 'rascunho'
    memoria.personagem.ficha = {
      ...fichaNeofito(), cla: 'brujah',
      vantagens: [{ id: 'vantagem-recursos', nivel: 5 }, { id: 'vantagem-contatos', nivel: 2 }],
      defeitos: [{ id: 'defeito-fazendeiro', nivel: 2 }],
    }
    await concluir({ data: { id: 'p1' } })
    expect(memoria.personagem.status).toBe('ativo')
  })

  it('permite ao Narrador trocar ou apagar o Clã de qualquer Personagem', async () => {
    for (const cla of ['ventrue', null] as const) {
      await salvarFicha({ data: {
        id: 'p1', nome: 'Helena', ficha: { ...memoria.personagem.ficha, cla },
      } })
      expect(memoria.personagem.ficha.cla).toBe(cla)
    }
    expect(memoria.notificacoes).toEqual([])
  })

  it('permite ao Narrador concluir sem validação de criação do Jogador', async () => {
    memoria.personagem.status = 'rascunho'
    memoria.personagem.ficha.vantagens = []
    await concluir({ data: { id: 'p1' } })
    expect(memoria.personagem.status).toBe('ativo')
  })

  it('usa a Potência final de Sanguessuga no Rascunho e notifica a perda uma única vez', async () => {
    memoria.personagem.status = 'rascunho'
    const ficha = { ...memoria.personagem.ficha, tipoPredador: 'tipo-predador-sanguessuga' }
    const salva = await salvarFicha({ data: { id: 'p1', nome: 'Helena', ficha } })
    expect(salva.potenciaSangue).toBe(2)
    expect(salva.vantagens).toEqual([])
    await salvarFicha({ data: { id: 'p1', nome: 'Helena', ficha: salva } })
    expect(memoria.notificacoes).toHaveLength(1)
    expect(memoria.personagem.ficha.potenciaSangue).toBe(2)
  })

  it('avisa o Jogador quando a edição do Narrador remove Modo Nuit por Potência', async () => {
    await salvarFicha({ data: {
      id: 'p1', nome: 'Helena', ficha: { ...memoria.personagem.ficha, potenciaSangue: 2 },
    } })
    expect(memoria.personagem.ficha.vantagens).toEqual([])
    expect(memoria.notificacoes).toContainEqual(expect.objectContaining({
      usuarioId: 'j1', texto: expect.stringContaining('Helena perdeu Modo Nuit'),
    }))
  })
})
