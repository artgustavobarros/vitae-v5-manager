import { randomUUID } from 'node:crypto'
import { and, eq, sql } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { db } from '#/db'
import { notificacao, operacaoMarcacao, personagem, user } from '#/db/schema'
import { fichaNeofito, marcasDe } from '#/domain/ficha'
import type { EventoReal } from '#/domain/eventos'
import type { AlteracaoMarcas } from '#/domain/sincronizacao-marcas'
import { barramento } from '#/server/eventos'
import type { Usuario } from '#/server/sessao'
import { aplicarMarcacao } from './sincronizar-marcas'

let jogador: Usuario
let narradorId: string
let id: string
let entrada: AlteracaoMarcas

beforeEach(async () => {
  jogador = {
    id: randomUUID(), nome: 'Jogador de teste', email: `${randomUUID()}@teste.local`,
    papel: 'jogador', imagem: null, nomeUsuario: null,
  }
  narradorId = randomUUID()
  await db.insert(user).values([
    { id: jogador.id, name: jogador.nome, email: jogador.email, papel: 'jogador' },
    { id: narradorId, name: 'Narrador de teste', email: `${randomUUID()}@teste.local`, papel: 'narrador' },
  ])
  id = randomUUID()
  const ficha = { ...fichaNeofito(), fome: 1 }
  await db.insert(personagem).values({ id, donoId: jogador.id, nome: 'Teste de sincronização', status: 'ativo', ficha })
  entrada = { operacaoId: randomUUID(), usuarioId: jogador.id, id, base: marcasDe(ficha), marcas: { fome: 4 } }
})

afterEach(async () => {
  await db.delete(notificacao).where(sql`${notificacao.linkJson}->'params'->>'id' = ${id}`)
  await db.delete(personagem).where(eq(personagem.id, id))
  await db.delete(user).where(sql`${user.id} in (${jogador.id}, ${narradorId})`)
})

describe('Sincronização idempotente das marcas no Postgres', () => {
  it('reverte Ficha, recibo e notificações juntos se a transação não confirmar', async () => {
    const transacaoReal = db.transaction.bind(db)
    const falha = vi.spyOn(db, 'transaction').mockImplementation((executar) => transacaoReal(async (tx) => {
      await executar(tx)
      throw new Error('Falha antes de confirmar a transação')
    }))
    try {
      await expect(aplicarMarcacao(jogador, entrada)).rejects.toThrow('Falha antes de confirmar')
    } finally {
      falha.mockRestore()
    }

    const [salvo] = await db.select().from(personagem).where(eq(personagem.id, id))
    expect(salvo.ficha.fome).toBe(1)
    expect(salvo.revisaoMarcas).toBe(0)
    const registros = await db.select().from(operacaoMarcacao).where(eq(operacaoMarcacao.usuarioId, jogador.id))
    expect(registros).toHaveLength(0)
    const avisos = await db.select().from(notificacao).where(eq(notificacao.usuarioId, narradorId))
    expect(avisos).toHaveLength(0)
  })

  it('reenvia a mesma resposta sem reaplicar a Ficha ou duplicar notificações', async () => {
    const eventos: EventoReal[] = []
    const desinscrever = barramento.escutar((evento) => {
      if ('paraUsuarioId' in evento && evento.paraUsuarioId === narradorId) eventos.push(evento)
    })
    try {
      const primeira = await aplicarMarcacao(jogador, entrada)
      await db.update(personagem).set({ ficha: { ...fichaNeofito(), fome: 2 } }).where(eq(personagem.id, id))
      const repetida = await aplicarMarcacao(jogador, entrada)

      expect(primeira).toMatchObject({ tipo: 'salvo', marcas: { fome: 4 }, revisao: 1 })
      expect(repetida).toEqual(primeira)
      const [salvo] = await db.select().from(personagem).where(eq(personagem.id, id))
      expect(salvo.ficha.fome).toBe(2)
      expect(salvo.revisaoMarcas).toBe(2)
      const avisos = await db.select().from(notificacao).where(eq(notificacao.usuarioId, narradorId))
      expect(avisos).toHaveLength(1)
      expect(eventos).toEqual([
        {
          tipo: 'notificacao', paraUsuarioId: narradorId,
          notificacao: {
            id: avisos[0].id,
            texto: 'Teste de sincronização chegou a Fome 4',
            quando: avisos[0].criadoEm.toISOString(), lida: false,
            destino: { to: '/personagens/$id', params: { id } },
          },
        },
        { tipo: 'mudanca', escopo: 'notificacao', paraUsuarioId: narradorId },
      ])
    } finally {
      desinscrever()
    }
  })

  it('serializa duas tentativas simultâneas da mesma operação', async () => {
    const resultados = await Promise.all([aplicarMarcacao(jogador, entrada), aplicarMarcacao(jogador, entrada)])
    expect(resultados[0]).toEqual(resultados[1])
    expect(resultados[0]).toMatchObject({ tipo: 'salvo', revisao: 1 })
    const registros = await db.select().from(operacaoMarcacao).where(eq(operacaoMarcacao.usuarioId, jogador.id))
    expect(registros).toHaveLength(1)
    const avisos = await db.select().from(notificacao).where(eq(notificacao.usuarioId, narradorId))
    expect(avisos).toHaveLength(1)
  })

  it('recusa reutilizar o identificador com outro conteúdo', async () => {
    await aplicarMarcacao(jogador, entrada)
    const repetida = await aplicarMarcacao(jogador, { ...entrada, marcas: { fome: 5 } })
    expect(repetida.tipo).toBe('recusado')
    const [salvo] = await db.select().from(personagem).where(eq(personagem.id, id))
    expect(salvo.ficha.fome).toBe(4)
  })

  it('retorna conflito sem sobrescrever Fome alterada por outra ação', async () => {
    await db.update(personagem).set({ ficha: { ...fichaNeofito(), fome: 3 } }).where(eq(personagem.id, id))
    const resultado = await aplicarMarcacao(jogador, entrada)
    expect(resultado).toMatchObject({ tipo: 'conflito', marcas: { fome: 3 }, revisao: 1 })
    const avisos = await db.select().from(notificacao).where(eq(notificacao.usuarioId, narradorId))
    expect(avisos).toHaveLength(0)
    const registros = await db.select().from(operacaoMarcacao).where(eq(operacaoMarcacao.usuarioId, jogador.id))
    expect(registros).toHaveLength(1)
  })

  it('aceita campo independente e preserva dano concorrente', async () => {
    await db.update(personagem).set({ ficha: { ...fichaNeofito(), fome: 1, danoVitalidade: { superficial: 1, agravado: 0 } } })
      .where(eq(personagem.id, id))
    const resultado = await aplicarMarcacao(jogador, entrada)
    expect(resultado).toMatchObject({ tipo: 'salvo', revisao: 2, marcas: { fome: 4, danoVitalidade: { superficial: 1, agravado: 0 } } })
  })

  it('revalida permissão antes de devolver resultado já registrado', async () => {
    await aplicarMarcacao(jogador, entrada)
    await db.update(personagem).set({ status: 'arquivado' }).where(eq(personagem.id, id))
    expect((await aplicarMarcacao(jogador, entrada)).tipo).toBe('recusado')
  })

  it('recusa pendência pertencente a outra conta sem criar registro', async () => {
    const resultado = await aplicarMarcacao({ ...jogador, id: narradorId, papel: 'narrador' }, entrada)
    expect(resultado.tipo).toBe('recusado')
    const registros = await db.select().from(operacaoMarcacao)
      .where(and(eq(operacaoMarcacao.usuarioId, jogador.id), eq(operacaoMarcacao.operacaoId, entrada.operacaoId)))
    expect(registros).toHaveLength(0)
  })
})
