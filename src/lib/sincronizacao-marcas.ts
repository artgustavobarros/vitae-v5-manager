import { QueryClient } from '@tanstack/react-query'

import type { Marcas } from '#/domain/ficha'
import type { AlteracaoMarcas, ResultadoMarcacao } from '#/domain/sincronizacao-marcas'
import { confirmacaoMarcasSchema, criarArmazenamentoMarcas, type ArmazenamentoMarcas, type RegistroMarcacao } from './armazenamento-marcas'

export type EstadoMarcas = {
  marcas: Marcas
  pendentes: number
  erro: string | null
  conflito: boolean
  bloqueado: boolean
  pronto: boolean
  enviando: boolean
  persistindo: boolean
}

type Confirmacao = { marcas: Marcas; revisao: number }
type ToqueInicial = { id: string; marcas: Partial<Marcas> }
const CAMPOS = ['fome', 'manchas', 'danoVitalidade', 'danoVontade'] as const
const ERRO_LOCAL = 'Não foi possível salvar neste dispositivo. Mantenha a página aberta e tente novamente.'
const CONFLITO = 'A Ficha mudou em outro lugar. Revise as marcações antes de continuar.'

export class SincronizacaoMarcas {
  private readonly queryClient: QueryClient
  private readonly usuarioId: string
  private readonly enviar: (operacao: AlteracaoMarcas) => Promise<ResultadoMarcacao>
  private readonly armazenamento: ArmazenamentoMarcas
  private readonly confirmadas = new Map<string, Confirmacao>()
  private readonly registros = new Map<string, RegistroMarcacao>()
  private readonly persistidas = new Set<string>()
  private readonly gravando = new Set<string>()
  private readonly trabalhos = new Map<string, Promise<void>>()
  private readonly reprocessar = new Set<string>()
  private readonly erros = new Map<string, string>()
  private readonly tentativas = new Map<string, number>()
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>()
  private readonly enviando = new Set<string>()
  private readonly emTransporte = new Set<string>()
  private readonly descartando = new Set<string>()
  private toquesIniciais: ToqueInicial[] = []
  private revisaoLocal = 0
  private ativo = false
  private pronto = false
  private restaurado = false
  private iniciando?: Promise<void>
  private erroRestauracao: string | null = null
  private ultimaCriacao = 0
  private canal?: BroadcastChannel
  private geracao = 0
  private encerramento = new AbortController()

  constructor(opcoes: {
    queryClient: QueryClient
    usuarioId: string
    enviar: (operacao: AlteracaoMarcas) => Promise<ResultadoMarcacao>
    armazenamento?: ArmazenamentoMarcas
  }) {
    this.queryClient = opcoes.queryClient
    this.usuarioId = opcoes.usuarioId
    this.enviar = opcoes.enviar
    this.armazenamento = opcoes.armazenamento ?? criarArmazenamentoMarcas()
    this.queryClient.setQueryDefaults(['marcas-sincronizadas', this.usuarioId], { gcTime: Infinity })
  }

  private chave(id: string) { return ['marcas-sincronizadas', this.usuarioId, id] }

  observar = (avisar: () => void) => this.queryClient.getQueryCache().subscribe((evento) => {
    if (evento.query.queryKey[0] === 'marcas-sincronizadas' && evento.query.queryKey[1] === this.usuarioId) avisar()
  })

  obterEstado = (id: string) => this.queryClient.getQueryData<EstadoMarcas>(this.chave(id))

  receber(id: string, marcas: Marcas, revisao: number) {
    this.guardarConfirmacao(id, marcas, revisao)
    this.publicar(id)
  }

  private guardarConfirmacao(id: string, marcas: Marcas, revisao: number) {
    const anterior = this.confirmadas.get(id)
    if (!anterior || revisao > anterior.revisao) {
      this.confirmadas.set(id, { marcas: structuredClone(marcas), revisao })
      this.revisaoLocal++
    }
  }

  iniciar(): Promise<void> {
    if (!this.ativo) {
      this.geracao++
      this.encerramento = new AbortController()
    }
    this.ativo = true
    if (this.iniciando) return this.iniciando
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.reconectar)
      if (!this.canal && typeof BroadcastChannel !== 'undefined') {
        this.canal = new BroadcastChannel(`vitae-marcacoes-${this.usuarioId}`)
        this.canal.onmessage = (evento: MessageEvent<unknown>) => {
          const confirmacao = confirmacaoMarcasSchema.safeParse(evento.data)
          if (confirmacao.success) {
            const { id, marcas, revisao } = confirmacao.data
            this.receber(id, marcas, revisao)
          }
          this.reconectar()
        }
      }
    }
    const inicio = this.restaurar()
    this.iniciando = inicio
    void inicio.finally(() => { if (this.iniciando === inicio) this.iniciando = undefined })
    return inicio
  }

  private async restaurar() {
    const geracao = this.geracao
    try {
      await this.recarregar()
      if (!this.ativo || geracao !== this.geracao) return
      this.restaurado = true
      this.erroRestauracao = null
      // O payload só fica definitivo depois de recuperar a base e a ordem anteriores.
      for (const toque of this.toquesIniciais.splice(0)) {
        const confirmacao = this.confirmadas.get(toque.id)!
        const base = this.pendencias(toque.id).reduce(
          (marcas, registro) => ({ ...marcas, ...registro.operacao.marcas }), confirmacao.marcas,
        )
        this.enfileirar(toque.id, base, toque.marcas)
      }
    } catch {
      if (!this.ativo || geracao !== this.geracao) return
      this.erroRestauracao = ERRO_LOCAL
    }
    this.pronto = true
    this.publicarTodos()
    if (this.restaurado) this.processarTodos()
  }

  alterar(id: string, novas: Marcas) {
    if (!this.ativo) return
    const estado = this.obterEstado(id)
    if (!estado || this.descartando.has(id) || estado.conflito || this.pendencias(id).some((r) => r.bloqueio)) return
    const marcas: Partial<Marcas> = {}
    for (const campo of CAMPOS) {
      if (JSON.stringify(estado.marcas[campo]) !== JSON.stringify(novas[campo])) {
        Object.assign(marcas, { [campo]: structuredClone(novas[campo]) })
      }
    }
    if (Object.keys(marcas).length === 0) return
    if (!this.restaurado) {
      this.toquesIniciais.push({ id, marcas })
      this.revisaoLocal++
    } else {
      this.enfileirar(id, estado.marcas, marcas)
    }
    this.publicar(id)
  }

  private enfileirar(id: string, base: Marcas, marcas: Partial<Marcas>) {
    const operacao: AlteracaoMarcas = {
      operacaoId: crypto.randomUUID(), usuarioId: this.usuarioId, id,
      base: structuredClone(base), marcas,
    }
    this.ultimaCriacao = Math.max(Date.now(), this.ultimaCriacao + 1)
    const registro = { operacao, criadoEm: this.ultimaCriacao }
    this.registros.set(operacao.operacaoId, registro)
    this.gravando.add(operacao.operacaoId)
    this.revisaoLocal++
    void this.persistir(registro)
  }

  private async persistir(registro: RegistroMarcacao) {
    const { operacaoId, id } = registro.operacao
    try {
      await this.armazenamento.salvar(registro)
      this.persistidas.add(operacaoId)
      this.revisaoLocal++
      this.erros.delete(id)
      this.canal?.postMessage(id)
    } catch {
      this.erros.set(id, ERRO_LOCAL)
    } finally {
      this.gravando.delete(operacaoId)
      this.publicar(id)
    }
    this.processar(id)
  }

  tentarNovamente(id: string) {
    if (!this.ativo) return
    this.cancelarTimer(id)
    this.erros.delete(id)
    if (!this.restaurado) { void this.iniciar(); return }
    for (const registro of this.pendencias(id)) {
      if (!this.persistidas.has(registro.operacao.operacaoId) && !this.gravando.has(registro.operacao.operacaoId)) {
        this.gravando.add(registro.operacao.operacaoId)
        void this.persistir(registro)
      }
    }
    this.processar(id)
    this.publicar(id)
  }

  async descartar(id: string): Promise<void> {
    if (!this.ativo || this.descartando.has(id)) return
    this.cancelarTimer(id)
    this.descartando.add(id)
    this.publicar(id)
    const executar = async () => {
      await this.recarregar()
      if (!this.ativo || this.pendencias(id).some((r) => this.gravando.has(r.operacao.operacaoId))) return
      for (const registro of this.pendencias(id)) {
        await this.armazenamento.remover(this.usuarioId, registro.operacao.operacaoId)
        this.registros.delete(registro.operacao.operacaoId)
        this.persistidas.delete(registro.operacao.operacaoId)
        this.revisaoLocal++
      }
      this.toquesIniciais = this.toquesIniciais.filter((toque) => toque.id !== id)
      this.revisaoLocal++
      this.erros.delete(id)
      this.canal?.postMessage(id)
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.locks) {
        await navigator.locks.request(`vitae-marcacoes-${this.usuarioId}-${id}`, { signal: this.encerramento.signal }, executar)
      } else {
        await this.trabalhos.get(id)
        await executar()
      }
    } catch {
      if (this.ativo) this.erros.set(id, ERRO_LOCAL)
    } finally {
      this.descartando.delete(id)
      this.publicar(id)
    }
  }

  private pendencias(id: string) {
    return [...this.registros.values()].filter((r) => r.operacao.id === id)
      .sort((a, b) => a.criadoEm - b.criadoEm || a.operacao.operacaoId.localeCompare(b.operacao.operacaoId))
  }

  private publicar(id: string) {
    const confirmacao = this.confirmadas.get(id)
    if (!confirmacao) return
    const pendentes = this.pendencias(id)
    const toques = this.toquesIniciais.filter((toque) => toque.id === id)
    const bloqueio = pendentes.find((r) => r.bloqueio)?.bloqueio
    const marcas = pendentes.reduce((marcas, r) => ({ ...marcas, ...r.operacao.marcas }), confirmacao.marcas)
    const estado: EstadoMarcas = {
      marcas: toques.reduce((marcas, toque) => ({ ...marcas, ...toque.marcas }), marcas),
      pendentes: pendentes.length + toques.length,
      erro: bloqueio?.mensagem ?? this.erros.get(id) ?? this.erroRestauracao,
      conflito: bloqueio?.tipo === 'conflito',
      bloqueado: Boolean(bloqueio),
      pronto: this.pronto,
      enviando: this.enviando.has(id) || this.descartando.has(id),
      persistindo: toques.length > 0 || pendentes.some((r) => this.gravando.has(r.operacao.operacaoId)),
    }
    this.queryClient.setQueryData(this.chave(id), estado)
  }

  private publicarTodos() { for (const id of this.confirmadas.keys()) this.publicar(id) }

  private async recarregar() {
    const geracao = this.geracao
    while (this.ativo && geracao === this.geracao) {
      const revisaoLocal = this.revisaoLocal
      const persistidasAntes = new Set(this.persistidas)
      const { registros: salvas, confirmacoes } = await this.armazenamento.ler(this.usuarioId)
      if (!this.ativo || geracao !== this.geracao) return
      // ACKs, descartes e outros carregamentos invalidam uma leitura em andamento.
      if (revisaoLocal !== this.revisaoLocal) continue
      for (const confirmacao of confirmacoes) {
        this.guardarConfirmacao(confirmacao.id, confirmacao.marcas, confirmacao.revisao)
      }
      const ids = new Set(salvas.map((r) => r.operacao.operacaoId))
      for (const [operacaoId] of this.registros) {
        if (persistidasAntes.has(operacaoId) && !ids.has(operacaoId) && !this.gravando.has(operacaoId) && !this.emTransporte.has(operacaoId)) {
          this.registros.delete(operacaoId)
          this.persistidas.delete(operacaoId)
        }
      }
      for (const registro of salvas) {
        if (!this.emTransporte.has(registro.operacao.operacaoId)) this.registros.set(registro.operacao.operacaoId, registro)
        this.persistidas.add(registro.operacao.operacaoId)
        this.ultimaCriacao = Math.max(this.ultimaCriacao, registro.criadoEm)
      }
      this.revisaoLocal++
      this.publicarTodos()
      return
    }
  }

  private processarTodos() {
    for (const id of new Set([...this.registros.values()].map((r) => r.operacao.id))) this.processar(id)
  }

  private processar(id: string) {
    if (!this.ativo || !this.restaurado || this.timers.has(id) || this.descartando.has(id)) return
    if (this.trabalhos.has(id)) { this.reprocessar.add(id); return }
    const executar = () => this.drenar(id)
    const trabalho = typeof navigator !== 'undefined' && navigator.locks
      ? navigator.locks.request(`vitae-marcacoes-${this.usuarioId}-${id}`, { signal: this.encerramento.signal }, executar)
      : executar()
    this.trabalhos.set(id, trabalho)
    void trabalho.catch(() => {
      if (this.ativo) this.erros.set(id, ERRO_LOCAL)
    }).finally(() => {
      this.trabalhos.delete(id)
      this.publicar(id)
      if (this.reprocessar.delete(id)) this.processar(id)
    })
  }

  private async drenar(id: string) {
    const geracao = this.geracao
    await this.recarregar()
    while (this.ativo && geracao === this.geracao && !this.descartando.has(id)) {
      const registro = this.pendencias(id)[0]
      if (!registro || registro.bloqueio || !this.persistidas.has(registro.operacao.operacaoId)) return
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return
      this.enviando.add(id)
      this.emTransporte.add(registro.operacao.operacaoId)
      this.publicar(id)
      const cache = this.queryClient.getMutationCache()
      const mutation = cache.build<ResultadoMarcacao, Error, AlteracaoMarcas, unknown>(this.queryClient, {
        mutationKey: ['sincronizar-marcas', this.usuarioId],
        scope: { id: `${this.usuarioId}:${id}` },
        mutationFn: this.enviar,
        networkMode: 'always',
        retry: false,
      })
      try {
        const resultado = await this.aguardarResultado(mutation.execute(registro.operacao))
        if (!resultado) return
        if (!this.ativo || geracao !== this.geracao) return
        if (resultado.tipo !== 'recusado') {
          this.receber(id, resultado.marcas, resultado.revisao)
          await this.armazenamento.confirmar(this.usuarioId, { id, marcas: resultado.marcas, revisao: resultado.revisao })
          this.revisaoLocal++
        }
        if (resultado.tipo !== 'salvo') {
          registro.bloqueio = {
            tipo: resultado.tipo,
            mensagem: resultado.tipo === 'conflito' ? CONFLITO : resultado.mensagem,
          }
          this.registros.set(registro.operacao.operacaoId, registro)
          this.revisaoLocal++
          await this.armazenamento.salvar(registro)
          this.revisaoLocal++
          this.canal?.postMessage(id)
          return
        }
        await this.armazenamento.remover(this.usuarioId, registro.operacao.operacaoId)
        this.registros.delete(registro.operacao.operacaoId)
        this.persistidas.delete(registro.operacao.operacaoId)
        this.revisaoLocal++
        this.erros.delete(id)
        this.tentativas.delete(id)
        this.canal?.postMessage({ tipo: 'confirmacao', id, marcas: resultado.marcas, revisao: resultado.revisao })
      } catch (erro) {
        if (!this.ativo || geracao !== this.geracao) return
        if (erro instanceof Error && /acesso negado|não autorizado|unauthorized|forbidden/i.test(erro.message)) {
          registro.bloqueio = { tipo: 'recusado', mensagem: 'Sua sessão ou permissão mudou. Entre novamente para continuar.' }
          this.registros.set(registro.operacao.operacaoId, registro)
          this.revisaoLocal++
          try {
            await this.armazenamento.salvar(registro)
            this.revisaoLocal++
          } catch { this.erros.set(id, ERRO_LOCAL) }
        } else {
          this.erros.set(id, 'Não foi possível sincronizar. As alterações aguardam envio.')
          if (erro instanceof TypeError
            || (erro instanceof DOMException && (erro.name === 'TimeoutError' || erro.name === 'AbortError'))
            || (erro instanceof Error && /network|fetch|timeout|502|503|504/i.test(erro.message))) {
            const tentativa = (this.tentativas.get(id) ?? 0) + 1
            this.tentativas.set(id, tentativa)
            this.timers.set(id, setTimeout(() => {
              this.timers.delete(id)
              this.processar(id)
            }, Math.min(1_000 * 2 ** (tentativa - 1), 30_000)))
          }
        }
        return
      } finally {
        cache.remove(mutation)
        this.emTransporte.delete(registro.operacao.operacaoId)
        this.enviando.delete(id)
        this.publicar(id)
      }
    }
  }

  private reconectar = () => {
    if (!this.ativo) return
    for (const id of this.timers.keys()) this.cancelarTimer(id)
    void this.restaurar()
  }

  private cancelarTimer(id: string) {
    clearTimeout(this.timers.get(id))
    this.timers.delete(id)
  }

  dispose() {
    this.ativo = false
    this.geracao++
    this.iniciando = undefined
    this.encerramento.abort()
    for (const id of this.timers.keys()) this.cancelarTimer(id)
    if (typeof window !== 'undefined') window.removeEventListener('online', this.reconectar)
    this.canal?.close()
    this.canal = undefined
  }

  private async aguardarResultado(resposta: Promise<ResultadoMarcacao>): Promise<ResultadoMarcacao | null> {
    const sinal = this.encerramento.signal
    let encerrar = () => {}
    const encerrado = new Promise<null>((resolve) => {
      encerrar = () => resolve(null)
      sinal.addEventListener('abort', encerrar, { once: true })
      if (sinal.aborted) encerrar()
    })
    try { return await Promise.race([resposta, encerrado]) }
    finally { sinal.removeEventListener('abort', encerrar) }
  }
}
