import { createStore, del, entries, set, update, type UseStore } from 'idb-keyval'
import { z } from 'zod'

import { alteracaoMarcasSchema } from '#/domain/sincronizacao-marcas'
import { marcasSchema } from '#/domain/ficha'

export const confirmacaoMarcasSchema = z.object({ id: z.uuid(), marcas: marcasSchema, revisao: z.number().int().nonnegative() })
export type ConfirmacaoMarcas = z.infer<typeof confirmacaoMarcasSchema>

const registroSchema = z.object({
  operacao: alteracaoMarcasSchema,
  criadoEm: z.number().finite(),
  bloqueio: z.object({ tipo: z.enum(['conflito', 'recusado']), mensagem: z.string() }).optional(),
})

export type RegistroMarcacao = z.infer<typeof registroSchema>
export type ArmazenamentoMarcas = {
  ler: (usuarioId: string) => Promise<{ registros: RegistroMarcacao[]; confirmacoes: ConfirmacaoMarcas[] }>
  salvar: (registro: RegistroMarcacao) => Promise<void>
  remover: (usuarioId: string, operacaoId: string) => Promise<void>
  confirmar: (usuarioId: string, confirmacao: ConfirmacaoMarcas) => Promise<void>
}

/** Cada operação ocupa uma chave: abas diferentes não substituem um snapshot da fila inteira. */
export function criarArmazenamentoMarcas(store: UseStore = createStore('vitae-marcacoes-v1', 'operacoes')): ArmazenamentoMarcas {
  return {
    async ler(usuarioId) {
      // Operações e confirmações precisam representar a mesma transação de leitura.
      const entradas = await entries<IDBValidKey, unknown>(store)
      const registros = entradas.filter(([chave]) => Array.isArray(chave) && chave.length === 2 && chave[0] === usuarioId)
        .map(([chave, registro]) => {
          const salva = registroSchema.parse(registro)
          if (!Array.isArray(chave) || salva.operacao.usuarioId !== usuarioId || chave[1] !== salva.operacao.operacaoId) {
            throw new Error('Registro de marcação inválido')
          }
          return salva
        })
        .sort((a, b) => a.criadoEm - b.criadoEm || a.operacao.operacaoId.localeCompare(b.operacao.operacaoId))
      const confirmacoes = entradas.filter(([chave]) => Array.isArray(chave) && chave[0] === usuarioId && chave[1] === 'confirmacao')
        .map(([, valor]) => confirmacaoMarcasSchema.parse(valor))
      return { registros, confirmacoes }
    },
    salvar: (registro) => set([registro.operacao.usuarioId, registro.operacao.operacaoId], registro, store),
    remover: (usuarioId, operacaoId) => del([usuarioId, operacaoId], store),
    confirmar: (usuarioId, confirmacao) => update<ConfirmacaoMarcas>(
      [usuarioId, 'confirmacao', confirmacao.id],
      (anterior) => anterior && anterior.revisao > confirmacao.revisao ? anterior : confirmacao,
      store,
    ),
  }
}
