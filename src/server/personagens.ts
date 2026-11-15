import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { personagem, user } from '#/db/schema'
import type { Papel } from '#/domain/acesso'
import { removerVantagensIndisponiveis } from '#/domain/catalogo/escolhas'
import { tipoPredador } from '#/domain/catalogo'
import { potenciaSangueCriacao } from '#/domain/criacao'
import {
  fichaNeofito,
  fichaSchema,
  marcasDe,
  marcasSchema,
  normalizarFicha,
  type Ficha,
} from '#/domain/ficha'
import { alteracaoMarcasSchema } from '#/domain/sincronizacao-marcas'
import {
  ehPdN,
  motivoNaoConcluir,
  nomeJogador,
  permissoesPersonagem,
  podeApagar,
  TIPOS_PERSONAGEM,
  type MotivoNaoConcluir,
} from '#/domain/permissoes-ficha'
import { carregar, ehPdNNoBanco } from '#/server/carregar-personagem'
import { barramento } from '#/server/eventos'
import { exigirNarrador } from '#/server/sessao'
import { obterOpcoesCriacaoCronicaDoBanco } from '#/server/cronica-db'
import { aplicarMarcacao } from '#/server/sincronizar-marcas'

const comId = z.object({ id: z.string().uuid() })

const MENSAGENS_NAO_CONCLUIR: Record<MotivoNaoConcluir, string> = {
  'nao-dono': 'Só o Narrador pode concluir um Personagem',
  'nao-rascunho': 'Só Rascunhos podem ser concluídos',
  'sem-nome': 'Dê um nome ao Personagem antes de concluir',
}

const colunasPermissao = {
  donoId: personagem.donoId,
  status: personagem.status,
  tipo: personagem.tipo,
  nome: personagem.nome,
  jogadorNome: personagem.jogadorNome,
}

export const listarTodosPersonagens = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async ({ context }) => {
    const linhas = await db
      .select({
        id: personagem.id,
        ...colunasPermissao,
        dono: user.name,
        papelDono: user.papel,
      })
      .from(personagem)
      .innerJoin(user, eq(personagem.donoId, user.id))
      .orderBy(asc(user.name), asc(personagem.criadoEm))
    return linhas.map((p) => {
      const { podeApagar } = permissoesPersonagem(context.usuario, p)
      return {
        id: p.id,
        nome: p.nome,
        status: p.status,
        /** Jogador dono; null quando o dono é o Narrador sem jogadorNome. */
        jogador: nomeJogador({ papelDono: p.papelDono as Papel, nomeDono: p.dono, jogadorNome: p.jogadorNome }),
        ativo: p.status === 'ativo',
        tipo: p.tipo,
        pdn: ehPdN({ papelDono: p.papelDono as Papel, status: p.status, jogadorNome: p.jogadorNome, tipo: p.tipo }),
        podeApagar,
      }
    })
  })

export const buscarFicha = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .validator(comId)
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['editar', 'marcar', 'ler'])
    return {
      id: p.id,
      nome: p.nome,
      jogadorNome: p.jogadorNome,
      status: p.status,
      tipo: p.tipo,
      ficha: p.ficha,
      revisaoMarcas: p.revisaoMarcas,
      fixado: p.fixado,
      ressonanciaAtual: p.ressonanciaAtual,
      compulsaoAtiva: p.compulsaoAtiva,
      pdn: await ehPdNNoBanco(p),
      ...permissoesPersonagem(context.usuario, p),
      acesso: p.acesso,
    }
  })

export const criarRascunho = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .handler(async ({ context }) => {
    const [p] = await db
      .insert(personagem)
      .values({ donoId: context.usuario.id, ficha: fichaNeofito() })
      .returning({ id: personagem.id })

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: p.id })
    return p
  })

export const salvarFicha = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(
    z.object({
      id: z.string().uuid(),
      nome: z.string().trim().max(120),
      jogadorNome: z.string().trim().max(120).nullish(),
      ficha: fichaSchema,
    }),
  )
  .handler(async ({ data, context }) => {
    const ficha = await db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      const idade = p.status === 'rascunho'
        ? (await obterOpcoesCriacaoCronicaDoBanco()).idadePadrao
        : undefined
      const proposta = p.status === 'rascunho' && data.ficha.tipoPredador
        ? { ...data.ficha, potenciaSangue: potenciaSangueCriacao(
            data.ficha.cla, idade, tipoPredador(data.ficha.tipoPredador),
          ) }
        : data.ficha
      const contextoVantagens = {
        cla: proposta.cla,
        potenciaSangue: proposta.potenciaSangue,
        idade,
        regrasCriacao: false,
      }
      const { ficha } = removerVantagensIndisponiveis(proposta, contextoVantagens)
      const normalizada = normalizarFicha(ficha)
      const camposAtualizar: { nome: string; ficha: Ficha; jogadorNome?: string | null } = {
        nome: data.nome,
        ficha: normalizada,
      }
      if (data.jogadorNome !== undefined) {
        camposAtualizar.jogadorNome = data.jogadorNome ? data.jogadorNome.trim() : null
      }
      await tx
        .update(personagem)
        .set(camposAtualizar)
        .where(eq(personagem.id, data.id))
      return normalizada
    })

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
    return ficha
  })

/** Salva uma marca no toque e devolve as marcas como ficaram depois do corte. Trilhas omitidas ficam como estão. */
export const marcar = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid(), marcas: marcasSchema.partial() }))
  .handler(async ({ data, context }) => {
    // A Ficha de antes vem da leitura sob lock, para a comparação da Condição não usar dado velho.
    const ficha = await db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar', 'marcar'], tx)
      const ficha = normalizarFicha({ ...p.ficha, ...data.marcas })
      await tx.update(personagem).set({ ficha }).where(eq(personagem.id, data.id))
      return ficha
    })

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
    return marcasDe(ficha)
  })

/** Sincroniza uma marcação pendente sem repetir gravações no reenvio. */
export const sincronizarMarcas = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(alteracaoMarcasSchema)
  .handler(({ data, context }) => aplicarMarcacao(context.usuario, data))

export const concluir = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(comId)
  .handler(async ({ data, context }) => {
    await db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      const motivo = motivoNaoConcluir(context.usuario, p)
      if (motivo) throw new Error(MENSAGENS_NAO_CONCLUIR[motivo])
      await tx.update(personagem).set({ status: 'ativo' }).where(eq(personagem.id, data.id))
      return p
    })

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
  })

export const apagarRascunho = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(comId)
  .handler(async ({ data, context }) => {
    await db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      if (!podeApagar(context.usuario, p)) throw new Error('Só Rascunhos podem ser excluídos')
      await tx.delete(personagem).where(eq(personagem.id, data.id))
    })
    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
  })

export const apagarPersonagem = apagarRascunho

export const alternarFixarPdn = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid(), fixado: z.boolean() }))
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['editar'])
    if (p.tipo !== 'nao_jogador' || p.status !== 'ativo') {
      throw new Error('Apenas PdNs ativos podem ser fixados no Painel')
    }

    await db
      .update(personagem)
      .set({ fixado: data.fixado })
      .where(eq(personagem.id, data.id))

    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    return { ok: true }
  })

export const definirAtividadePersonagem = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid(), ativo: z.boolean() }))
  .handler(async ({ data }) => {
    await db.update(personagem).set({ status: data.ativo ? 'ativo' : 'rascunho' }).where(eq(personagem.id, data.id))
    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
  })

export const definirTipoPersonagem = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid(), tipo: z.enum(TIPOS_PERSONAGEM) }))
  .handler(async ({ data }) => {
    await db.update(personagem).set({ tipo: data.tipo }).where(eq(personagem.id, data.id))
    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
  })
