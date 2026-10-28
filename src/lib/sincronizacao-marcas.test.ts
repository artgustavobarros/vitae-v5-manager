import 'fake-indexeddb/auto'

import { QueryClient } from '@tanstack/react-query'
import { createStore } from 'idb-keyval'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Marcas } from '#/domain/ficha'
import type { AlteracaoMarcas, ResultadoMarcacao } from '#/domain/sincronizacao-marcas'
import { criarArmazenamentoMarcas } from './armazenamento-marcas'
import { SincronizacaoMarcas } from './sincronizacao-marcas'

const id = '123e4567-e89b-42d3-a456-426614174000'
const iniciais: Marcas = {
  fome: 1, manchas: 0,
  danoVitalidade: { superficial: 0, agravado: 0 },
  danoVontade: { superficial: 0, agravado: 0 },
}

function pendente<T>() {
  let resolver!: (valor: T) => void
  const promise = new Promise<T>((resolve) => { resolver = resolve })
  return { promise, resolver }
}

const servicos: SincronizacaoMarcas[] = []
afterEach(() => {
  for (const servico of servicos.splice(0)) servico.dispose()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function preparar(enviar: (operacao: AlteracaoMarcas) => Promise<ResultadoMarcacao>) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const armazenamento = criarArmazenamentoMarcas(createStore(`marcas-${crypto.randomUUID()}`, 'operacoes'))
  const servico = new SincronizacaoMarcas({ queryClient, usuarioId: 'jogador-1', enviar, armazenamento })
  servicos.push(servico)
  servico.receber(id, iniciais, 0)
  return { servico, armazenamento, queryClient }
}

describe('sincronização das marcações', () => {
  it('mostra o toque antes da gravação local e não envia antes de persistir', async () => {
    const gravacao = pendente<void>()
    const enviar = vi.fn<(op: AlteracaoMarcas) => Promise<ResultadoMarcacao>>()
    const { servico, armazenamento } = preparar(enviar)
    await servico.iniciar()
    const salvar = armazenamento.salvar.bind(armazenamento)
    vi.spyOn(armazenamento, 'salvar').mockImplementation(async (registro) => {
      await gravacao.promise
      await salvar(registro)
    })
    servico.alterar(id, { ...iniciais, fome: 2 })
    expect(servico.obterEstado(id)?.marcas.fome).toBe(2)
    expect(servico.obterEstado(id)?.pendentes).toBe(1)
    await Promise.resolve()
    expect(enviar).not.toHaveBeenCalled()
    gravacao.resolver()
    await vi.waitFor(() => expect(enviar).toHaveBeenCalledTimes(1))
    expect((await armazenamento.ler('jogador-1')).registros[0].operacao.marcas).toEqual({ fome: 2 })
  })

  it('serializa toques e preserva o último diante de respostas e SSE antigos', async () => {
    const primeira = pendente<ResultadoMarcacao>()
    const segunda = pendente<ResultadoMarcacao>()
    const enviadas: AlteracaoMarcas[] = []
    const { servico } = preparar(async (operacao) => {
      enviadas.push(operacao)
      return enviadas.length === 1 ? primeira.promise : segunda.promise
    })
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    servico.alterar(id, { ...iniciais, fome: 3 })
    await vi.waitFor(() => expect(enviadas).toHaveLength(1))
    servico.receber(id, iniciais, 0)
    expect(servico.obterEstado(id)?.marcas.fome).toBe(3)
    primeira.resolver({ tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1 })
    await vi.waitFor(() => expect(enviadas).toHaveLength(2))
    expect(enviadas[1].base.fome).toBe(2)
    expect(servico.obterEstado(id)?.marcas.fome).toBe(3)
    segunda.resolver({ tipo: 'salvo', marcas: { ...iniciais, fome: 3 }, revisao: 2 })
    await vi.waitFor(() => expect(servico.obterEstado(id)?.pendentes).toBe(0))
    servico.receber(id, { ...iniciais, fome: 2 }, 1)
    expect(servico.obterEstado(id)?.marcas.fome).toBe(3)
  })

  it('mantém o identificador ao repetir uma resposta perdida', async () => {
    const enviadas: AlteracaoMarcas[] = []
    const { servico } = preparar(async (op) => {
      enviadas.push(op)
      if (enviadas.length === 1) throw new TypeError('Failed to fetch')
      return { tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1 }
    })
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    await vi.waitFor(() => expect(enviadas).toHaveLength(1))
    expect(servico.obterEstado(id)?.pendentes).toBe(1)
    servico.tentarNovamente(id)
    await vi.waitFor(() => expect(servico.obterEstado(id)?.pendentes).toBe(0))
    expect(enviadas[1]).toEqual(enviadas[0])
  })

  it('restaura inclusive uma operação que estava em voo sem enviar por outra conta', async () => {
    const { servico, armazenamento } = preparar(() => new Promise(() => {}))
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    await vi.waitFor(async () => expect((await armazenamento.ler('jogador-1')).registros).toHaveLength(1))
    const operacao = (await armazenamento.ler('jogador-1')).registros[0].operacao
    servico.dispose()
    const outraConta = new SincronizacaoMarcas({
      queryClient: new QueryClient(), usuarioId: 'jogador-2', armazenamento,
      enviar: async () => { throw new Error('Não pode enviar pela outra conta') },
    })
    servicos.push(outraConta)
    outraConta.receber(id, iniciais, 0)
    await outraConta.iniciar()
    expect(outraConta.obterEstado(id)?.pendentes).toBe(0)
    const enviadas: AlteracaoMarcas[] = []
    const restaurado = new SincronizacaoMarcas({
      queryClient: new QueryClient(), usuarioId: 'jogador-1', armazenamento,
      enviar: async (op) => {
        enviadas.push(op)
        return { tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1 }
      },
    })
    servicos.push(restaurado)
    restaurado.receber(id, iniciais, 0)
    await restaurado.iniciar()
    await vi.waitFor(() => expect(restaurado.obterEstado(id)?.pendentes).toBe(0))
    expect(enviadas).toEqual([operacao])
  })

  it('bloqueia a cadeia em conflito e só remove pendências após descarte explícito', async () => {
    const enviadas: AlteracaoMarcas[] = []
    const { servico, armazenamento } = preparar(async (op) => {
      enviadas.push(op)
      return { tipo: 'conflito', marcas: { ...iniciais, fome: 4 }, revisao: 2 }
    })
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    servico.alterar(id, { ...iniciais, fome: 3 })
    await vi.waitFor(() => expect(servico.obterEstado(id)?.conflito).toBe(true))
    expect(enviadas).toHaveLength(1)
    expect(servico.obterEstado(id)?.marcas.fome).toBe(3)
    await servico.descartar(id)
    expect(servico.obterEstado(id)?.marcas.fome).toBe(4)
    expect(servico.obterEstado(id)?.pendentes).toBe(0)
    expect((await armazenamento.ler('jogador-1')).registros).toEqual([])
  })

  it('não repete uma rejeição definitiva depois de restaurar a página', async () => {
    const enviar = vi.fn(async (): Promise<ResultadoMarcacao> => ({ tipo: 'recusado', mensagem: 'Acesso negado' }))
    const { servico, armazenamento } = preparar(enviar)
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    await vi.waitFor(() => expect(servico.obterEstado(id)?.erro).toBe('Acesso negado'))
    servico.dispose()
    const restaurado = new SincronizacaoMarcas({ queryClient: new QueryClient(), usuarioId: 'jogador-1', armazenamento, enviar })
    servicos.push(restaurado)
    restaurado.receber(id, iniciais, 0)
    await restaurado.iniciar()
    expect(restaurado.obterEstado(id)?.erro).toBe('Acesso negado')
    expect(enviar).toHaveBeenCalledTimes(1)
  })

  it('mantém a alteração em memória mas não envia quando IndexedDB falha', async () => {
    const enviar = vi.fn<(op: AlteracaoMarcas) => Promise<ResultadoMarcacao>>()
    const { servico, armazenamento } = preparar(enviar)
    await servico.iniciar()
    vi.spyOn(armazenamento, 'salvar').mockRejectedValue(new Error('QuotaExceededError'))
    servico.alterar(id, { ...iniciais, fome: 2 })
    await vi.waitFor(() => expect(servico.obterEstado(id)?.erro).toContain('dispositivo'))
    expect(enviar).not.toHaveBeenCalled()
    expect(servico.obterEstado(id)?.marcas.fome).toBe(2)
  })

  it('não envia novos itens depois que a sessão do serviço foi encerrada', async () => {
    const resposta = pendente<ResultadoMarcacao>()
    const enviar = vi.fn(() => resposta.promise)
    const { servico, armazenamento } = preparar(enviar)
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    servico.alterar(id, { ...iniciais, fome: 3 })
    await vi.waitFor(() => expect(enviar).toHaveBeenCalledTimes(1))
    servico.dispose()
    resposta.resolver({ tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1 })
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(enviar).toHaveBeenCalledTimes(1)
    expect((await armazenamento.ler('jogador-1')).registros).toHaveLength(2)
  })

  it('mantém as marcas confirmadas enquanto a página permanece aberta', async () => {
    const { servico } = preparar(async () => ({ tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1 }))
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    await vi.waitFor(() => expect(servico.obterEstado(id)?.pendentes).toBe(0))
    vi.useFakeTimers()
    await vi.advanceTimersByTimeAsync(6 * 60_000)
    expect(servico.obterEstado(id)?.marcas.fome).toBe(2)
  })

  it('retoma após cleanup do React e ignora o resultado do ciclo anterior', async () => {
    const antiga = pendente<ResultadoMarcacao>()
    let chamadas = 0
    const { servico } = preparar(async () => {
      chamadas++
      return chamadas === 1 ? antiga.promise : { tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1 }
    })
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    await vi.waitFor(() => expect(chamadas).toBe(1))
    servico.dispose()
    await servico.iniciar()
    await vi.waitFor(() => expect(servico.obterEstado(id)?.pendentes).toBe(0))
    antiga.resolver({ tipo: 'salvo', marcas: { ...iniciais, fome: 5 }, revisao: 99 })
    await Promise.resolve()
    expect(servico.obterEstado(id)?.marcas.fome).toBe(2)
  })

  it('outra aba recebe a confirmação antes de remover a projeção otimista', async () => {
    vi.stubGlobal('window', new EventTarget())
    const resposta = pendente<ResultadoMarcacao>()
    const { servico, armazenamento } = preparar(() => resposta.promise)
    const outra = new SincronizacaoMarcas({
      queryClient: new QueryClient(), usuarioId: 'jogador-1', armazenamento,
      enviar: () => resposta.promise,
    })
    servicos.push(outra)
    outra.receber(id, iniciais, 0)
    await Promise.all([servico.iniciar(), outra.iniciar()])
    servico.alterar(id, { ...iniciais, fome: 2 })
    await vi.waitFor(() => expect(outra.obterEstado(id)?.marcas.fome).toBe(2))
    const observadas: number[] = []
    const parar = outra.observar(() => {
      observadas.push(outra.obterEstado(id)?.marcas.fome ?? -1)
    })
    resposta.resolver({ tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1 })
    await vi.waitFor(() => expect(outra.obterEstado(id)?.pendentes).toBe(0))
    parar()
    expect(outra.obterEstado(id)?.marcas.fome).toBe(2)
    expect(observadas).not.toContain(1)
  })

  it('recupera falha de leitura local antes de enviar a edição nova', async () => {
    const enviar = vi.fn(async (): Promise<ResultadoMarcacao> => ({ tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1 }))
    const { servico, armazenamento } = preparar(enviar)
    vi.spyOn(armazenamento, 'ler').mockRejectedValueOnce(new Error('Falha ao abrir banco'))
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    expect(servico.obterEstado(id)).toMatchObject({ marcas: { fome: 2 }, persistindo: true })
    expect((await armazenamento.ler('jogador-1')).registros).toEqual([])
    expect(servico.obterEstado(id)?.erro).toContain('dispositivo')
    expect(enviar).not.toHaveBeenCalled()
    servico.tentarNovamente(id)
    await vi.waitFor(() => expect(servico.obterEstado(id)?.pendentes).toBe(0))
  })

  it('preserva o bloqueio quando outro Personagem sincroniza em paralelo', async () => {
    const outroId = '123e4567-e89b-42d3-a456-426614174001'
    const primeira = pendente<ResultadoMarcacao>()
    const enviar = vi.fn(async (op: AlteracaoMarcas): Promise<ResultadoMarcacao> => op.id === id
      ? primeira.promise
      : { tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1 })
    const { servico } = preparar(enviar)
    servico.receber(outroId, iniciais, 0)
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    await vi.waitFor(() => expect(servico.obterEstado(id)?.enviando).toBe(true))
    servico.alterar(outroId, { ...iniciais, fome: 2 })
    await vi.waitFor(() => expect(servico.obterEstado(outroId)?.pendentes).toBe(0))
    primeira.resolver({ tipo: 'conflito', marcas: { ...iniciais, fome: 4 }, revisao: 2 })
    await vi.waitFor(() => expect(servico.obterEstado(id)?.bloqueado).toBe(true))
    expect(servico.obterEstado(id)?.conflito).toBe(true)
    servico.alterar(id, { ...iniciais, fome: 3 })
    expect(servico.obterEstado(id)?.pendentes).toBe(1)
  })

  it('uma página com loader antigo recupera a última confirmação persistida', async () => {
    const { servico, armazenamento } = preparar(async (): Promise<ResultadoMarcacao> => ({
      tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1,
    }))
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    await vi.waitFor(() => expect(servico.obterEstado(id)?.pendentes).toBe(0))
    servico.dispose()
    const novaPagina = new SincronizacaoMarcas({
      queryClient: new QueryClient(), usuarioId: 'jogador-1', armazenamento,
      enviar: async () => { throw new Error('Nenhuma operação deveria restar') },
    })
    servicos.push(novaPagina)
    novaPagina.receber(id, iniciais, 0)
    await novaPagina.iniciar()
    expect(novaPagina.obterEstado(id)?.marcas.fome).toBe(2)
    expect(novaPagina.obterEstado(id)?.pendentes).toBe(0)
  })

  it('descarte em outra aba espera o envio em andamento e preserva sua confirmação', async () => {
    const resposta = pendente<ResultadoMarcacao>()
    const { servico, armazenamento } = preparar(() => resposta.promise)
    await servico.iniciar()
    servico.alterar(id, { ...iniciais, fome: 2 })
    await vi.waitFor(() => expect(servico.obterEstado(id)?.enviando).toBe(true))
    const outra = new SincronizacaoMarcas({
      queryClient: new QueryClient(), usuarioId: 'jogador-1', armazenamento,
      enviar: () => resposta.promise,
    })
    servicos.push(outra)
    outra.receber(id, iniciais, 0)
    await outra.iniciar()
    const descarte = outra.descartar(id)
    outra.alterar(id, { ...iniciais, fome: 3 })
    expect(outra.obterEstado(id)?.enviando).toBe(true)
    expect(outra.obterEstado(id)?.marcas.fome).toBe(2)
    resposta.resolver({ tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1 })
    await descarte
    expect(outra.obterEstado(id)?.pendentes).toBe(0)
    expect(outra.obterEstado(id)?.marcas.fome).toBe(2)
  })

  it('mostra o toque durante a restauração e só envia depois de persistir a operação', async () => {
    const leitura = pendente<void>()
    const enviar = vi.fn(async (): Promise<ResultadoMarcacao> => ({ tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1 }))
    const { servico, armazenamento } = preparar(enviar)
    const ler = armazenamento.ler.bind(armazenamento)
    const leituraLocal = vi.spyOn(armazenamento, 'ler').mockImplementationOnce(async (usuarioId) => {
      const snapshot = await ler(usuarioId)
      await leitura.promise
      return snapshot
    })
    const inicio = servico.iniciar()
    await vi.waitFor(() => expect(leituraLocal).toHaveBeenCalledTimes(1))
    servico.alterar(id, { ...iniciais, fome: 2 })
    expect(servico.obterEstado(id)).toMatchObject({ marcas: { fome: 2 }, persistindo: true })
    expect((await armazenamento.ler('jogador-1')).registros).toEqual([])
    expect(enviar).not.toHaveBeenCalled()
    leitura.resolver()
    await inicio
    await vi.waitFor(() => expect(enviar).toHaveBeenCalledTimes(1))
    await vi.waitFor(() => expect(servico.obterEstado(id)?.pendentes).toBe(0))
    expect((await armazenamento.ler('jogador-1')).registros).toHaveLength(0)
  })

  it('repete timeout do transporte com a mesma operação após backoff', async () => {
    const enviadas: AlteracaoMarcas[] = []
    const { servico } = preparar(async (operacao): Promise<ResultadoMarcacao> => {
      enviadas.push(operacao)
      if (enviadas.length === 1) throw new DOMException('The signal timed out', 'TimeoutError')
      return { tipo: 'salvo', marcas: { ...iniciais, fome: 2 }, revisao: 1 }
    })
    await servico.iniciar()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    servico.alterar(id, { ...iniciais, fome: 2 })
    await vi.waitFor(() => expect(servico.obterEstado(id)?.erro).toContain('aguardam envio'), { timeout: 500 })
    await vi.advanceTimersByTimeAsync(1_000)
    await vi.waitFor(() => expect(servico.obterEstado(id)?.pendentes).toBe(0), { timeout: 500 })
    expect(enviadas).toHaveLength(2)
    expect(enviadas[1]).toEqual(enviadas[0])
  })
})
