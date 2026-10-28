import 'fake-indexeddb/auto'

import { QueryClient } from '@tanstack/react-query'
import { createStore } from 'idb-keyval'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Marcas } from '#/domain/ficha'
import { temConflitoMarcas, type AlteracaoMarcas, type ResultadoMarcacao } from '#/domain/sincronizacao-marcas'
import { criarArmazenamentoMarcas } from './armazenamento-marcas'
import { SincronizacaoMarcas } from './sincronizacao-marcas'

const usuarioId = 'jogador-regressao'
const id = '123e4567-e89b-42d3-a456-426614174000'
const outroId = '123e4567-e89b-42d3-a456-426614174001'
const iniciais: Marcas = {
  fome: 1, manchas: 0,
  danoVitalidade: { superficial: 0, agravado: 0 },
  danoVontade: { superficial: 0, agravado: 0 },
}

function barreira() {
  let liberar!: () => void
  const promise = new Promise<void>((resolve) => { liberar = resolve })
  return { promise, liberar }
}

const servicos: SincronizacaoMarcas[] = []
afterEach(() => {
  for (const servico of servicos.splice(0)) servico.dispose()
  vi.restoreAllMocks()
})

function preparar(enviar: (operacao: AlteracaoMarcas) => Promise<ResultadoMarcacao>) {
  const armazenamento = criarArmazenamentoMarcas(createStore(`regressao-${crypto.randomUUID()}`, 'operacoes'))
  const servico = new SincronizacaoMarcas({ queryClient: new QueryClient(), usuarioId, enviar, armazenamento })
  servicos.push(servico)
  servico.receber(id, iniciais, 0)
  return { servico, armazenamento }
}

describe('regressões da restauração das marcações', () => {
  it('encadeia o toque durante a restauração depois da pendência antiga sem conflito próprio', async () => {
    const leitura = barreira()
    const leuSnapshot = barreira()
    let servidor = structuredClone(iniciais)
    let revisao = 0
    const envios: Array<{ base: number; fome: number | undefined; conflito: boolean }> = []
    const { servico, armazenamento } = preparar(async (operacao) => {
      const conflito = temConflitoMarcas(servidor, operacao.base, operacao.marcas)
      envios.push({ base: operacao.base.fome, fome: operacao.marcas.fome, conflito })
      if (conflito) return { tipo: 'conflito', marcas: structuredClone(servidor), revisao }
      servidor = { ...servidor, ...operacao.marcas }
      return { tipo: 'salvo', marcas: structuredClone(servidor), revisao: ++revisao }
    })
    await armazenamento.salvar({
      operacao: { operacaoId: crypto.randomUUID(), usuarioId, id, base: iniciais, marcas: { fome: 2 } },
      criadoEm: 1,
    })
    const ler = armazenamento.ler.bind(armazenamento)
    vi.spyOn(armazenamento, 'ler').mockImplementationOnce(async (conta) => {
      const snapshot = await ler(conta)
      leuSnapshot.liberar()
      await leitura.promise
      return snapshot
    })

    const inicio = servico.iniciar()
    await leuSnapshot.promise
    servico.alterar(id, { ...iniciais, fome: 3 })
    expect(servico.obterEstado(id)?.marcas.fome).toBe(3)
    expect(envios).toEqual([])
    leitura.liberar()
    await inicio

    await vi.waitFor(() => expect(envios).toHaveLength(2))
    expect(envios).toEqual([
      { base: 1, fome: 2, conflito: false },
      { base: 2, fome: 3, conflito: false },
    ])
    await vi.waitFor(() => expect(servico.obterEstado(id)?.pendentes).toBe(0))
    expect(servico.obterEstado(id)).toMatchObject({ marcas: { fome: 3 }, bloqueado: false, erro: null })
    expect(servidor.fome).toBe(3)
    expect((await armazenamento.ler(usuarioId)).registros).toEqual([])
  })

  it('não ressuscita uma operação confirmada quando a leitura de outro Personagem termina atrasada', async () => {
    const respostaPrimeira = barreira()
    const leitura = barreira()
    const leuSnapshot = barreira()
    const servidor = new Map([[id, structuredClone(iniciais)], [outroId, structuredClone(iniciais)]])
    const revisoes = new Map<string, number>()
    const enviadas: AlteracaoMarcas[] = []
    const { servico, armazenamento } = preparar(async (operacao) => {
      enviadas.push(operacao)
      if (enviadas.length === 1) await respostaPrimeira.promise
      const atual = servidor.get(operacao.id)!
      const revisao = revisoes.get(operacao.id) ?? 0
      if (temConflitoMarcas(atual, operacao.base, operacao.marcas)) {
        return { tipo: 'conflito', marcas: structuredClone(atual), revisao }
      }
      const marcas = { ...atual, ...operacao.marcas }
      servidor.set(operacao.id, marcas)
      revisoes.set(operacao.id, revisao + 1)
      return { tipo: 'salvo', marcas: structuredClone(marcas), revisao: revisao + 1 }
    })
    servico.receber(outroId, iniciais, 0)
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    await vi.waitFor(() => expect(enviadas).toHaveLength(1))

    const ler = armazenamento.ler.bind(armazenamento)
    vi.spyOn(armazenamento, 'ler').mockImplementationOnce(async (conta) => {
      const snapshot = await ler(conta)
      leuSnapshot.liberar()
      await leitura.promise
      return snapshot
    })
    servico.alterar(outroId, { ...iniciais, fome: 2 })
    await leuSnapshot.promise
    respostaPrimeira.liberar()
    await vi.waitFor(() => expect(servico.obterEstado(id)?.pendentes).toBe(0))
    servico.alterar(id, { ...iniciais, fome: 3 })
    await vi.waitFor(() => expect(servico.obterEstado(id)?.pendentes).toBe(0))
    expect(servico.obterEstado(id)?.marcas.fome).toBe(3)

    leitura.liberar()
    await vi.waitFor(() => expect(servico.obterEstado(outroId)?.pendentes).toBe(0))
    expect((await armazenamento.ler(usuarioId)).registros).toEqual([])
    servico.receber(id, { ...iniciais, fome: 3 }, 2)

    expect(servico.obterEstado(id)).toMatchObject({ marcas: { fome: 3 }, pendentes: 0, erro: null })
    expect(servidor.get(id)?.fome).toBe(3)
    expect(enviadas.filter((operacao) => operacao.id === id)).toHaveLength(2)
  })

  it('preserva vários toques e campos independentes depois de uma pendência com timestamp futuro', async () => {
    const leitura = barreira()
    const leuSnapshot = barreira()
    let servidor = structuredClone(iniciais)
    let revisao = 0
    const conflitos: AlteracaoMarcas[] = []
    const { servico, armazenamento } = preparar(async (operacao) => {
      if (temConflitoMarcas(servidor, operacao.base, operacao.marcas)) {
        conflitos.push(operacao)
        return { tipo: 'conflito', marcas: structuredClone(servidor), revisao }
      }
      servidor = { ...servidor, ...operacao.marcas }
      return { tipo: 'salvo', marcas: structuredClone(servidor), revisao: ++revisao }
    })
    await armazenamento.salvar({
      operacao: {
        operacaoId: crypto.randomUUID(), usuarioId, id, base: iniciais,
        marcas: { fome: 2, danoVitalidade: { superficial: 1, agravado: 0 } },
      },
      criadoEm: Date.now() + 60_000,
    })
    const ler = armazenamento.ler.bind(armazenamento)
    vi.spyOn(armazenamento, 'ler').mockImplementationOnce(async (conta) => {
      const snapshot = await ler(conta)
      leuSnapshot.liberar()
      await leitura.promise
      return snapshot
    })
    const inicio = servico.iniciar()
    await leuSnapshot.promise
    servico.alterar(id, { ...iniciais, fome: 3 })
    servico.alterar(id, { ...iniciais, fome: 4 })
    servico.alterar(id, { ...iniciais, fome: 4, manchas: 1 })
    expect(servico.obterEstado(id)?.marcas).toMatchObject({ fome: 4, manchas: 1 })
    leitura.liberar()
    await inicio

    await vi.waitFor(() => expect(servico.obterEstado(id)?.pendentes).toBe(0))
    expect(conflitos).toEqual([])
    expect(servidor).toEqual({
      fome: 4, manchas: 1,
      danoVitalidade: { superficial: 1, agravado: 0 },
      danoVontade: { superficial: 0, agravado: 0 },
    })
    expect(servico.obterEstado(id)).toMatchObject({ marcas: servidor, erro: null, bloqueado: false })
    expect((await armazenamento.ler(usuarioId)).registros).toEqual([])
  })

  it('não envia um toque nem conclui a restauração depois que a conta sai', async () => {
    const leitura = barreira()
    const leuSnapshot = barreira()
    const enviar = vi.fn(async (): Promise<ResultadoMarcacao> => ({
      tipo: 'salvo', marcas: { ...iniciais, fome: 3 }, revisao: 1,
    }))
    const { servico, armazenamento } = preparar(enviar)
    const ler = armazenamento.ler.bind(armazenamento)
    vi.spyOn(armazenamento, 'ler').mockImplementationOnce(async (conta) => {
      const snapshot = await ler(conta)
      leuSnapshot.liberar()
      await leitura.promise
      return snapshot
    })
    const inicio = servico.iniciar()
    await leuSnapshot.promise
    servico.alterar(id, { ...iniciais, fome: 3 })
    expect(servico.obterEstado(id)?.pronto).toBe(false)
    servico.dispose()
    leitura.liberar()
    await inicio

    expect(enviar).not.toHaveBeenCalled()
    expect(servico.obterEstado(id)?.pronto).toBe(false)
    expect((await armazenamento.ler(usuarioId)).registros).toEqual([])
  })
})
