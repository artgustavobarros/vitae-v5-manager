import { isDeepStrictEqual } from 'node:util'
import { and, eq, sql } from 'drizzle-orm'

import { db } from '#/db'
import { notificacao, operacaoMarcacao, personagem, user } from '#/db/schema'
import { marcasDe, normalizarFicha } from '#/domain/ficha'
import { detectarMudancasCondicao, notificacoesEventos } from '#/domain/notificacoes'
import { acessoFicha } from '#/domain/permissoes-ficha'
import {
  alteracaoMarcasSchema,
  temConflitoMarcas,
  type AlteracaoMarcas,
  type ResultadoMarcacao,
} from '#/domain/sincronizacao-marcas'
import { barramento } from '#/server/eventos'
import { publicarNotificacao } from '#/server/enviar-notificacao'
import type { Usuario } from '#/server/sessao'

type Aplicacao = {
  resultado: ResultadoMarcacao
  avisos: (typeof notificacao.$inferSelect)[]
  mudou: boolean
}

export async function aplicarMarcacao(usuario: Usuario, dados: AlteracaoMarcas): Promise<ResultadoMarcacao> {
  const entrada = alteracaoMarcasSchema.parse(dados)
  if (entrada.usuarioId !== usuario.id) {
    return { tipo: 'recusado', mensagem: 'Esta alteração pertence a outra conta.' }
  }

  const aplicacao = await db.transaction(async (tx): Promise<Aplicacao> => {
    // Serializa o mesmo recibo mesmo quando tentam reutilizá-lo para outro Personagem.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${usuario.id}), hashtext(${entrada.operacaoId}))`)
    const [p] = await tx.select().from(personagem).where(eq(personagem.id, entrada.id)).for('update')
    const acesso = p ? acessoFicha(usuario, p) : null
    if (!p || (acesso !== 'editar' && acesso !== 'marcar')) {
      return { resultado: { tipo: 'recusado', mensagem: 'Você não pode mais alterar esta Ficha.' }, avisos: [], mudou: false }
    }

    const [recibo] = await tx.select().from(operacaoMarcacao).where(and(
      eq(operacaoMarcacao.usuarioId, usuario.id),
      eq(operacaoMarcacao.operacaoId, entrada.operacaoId),
    ))
    if (recibo) {
      return {
        resultado: isDeepStrictEqual(recibo.entrada, entrada)
          ? recibo.resultado
          : { tipo: 'recusado', mensagem: 'Esta operação já foi usada para outra alteração.' },
        avisos: [],
        mudou: false,
      }
    }

    let resultado: ResultadoMarcacao
    let avisos: Aplicacao['avisos'] = []
    const conflito = temConflitoMarcas(marcasDe(p.ficha), entrada.base, entrada.marcas)
    if (conflito) {
      resultado = { tipo: 'conflito', marcas: marcasDe(p.ficha), revisao: p.revisaoMarcas }
    } else {
      const ficha = normalizarFicha({ ...p.ficha, ...entrada.marcas })
      const [salvo] = await tx.update(personagem).set({ ficha }).where(eq(personagem.id, p.id))
        .returning({ revisao: personagem.revisaoMarcas })
      resultado = { tipo: 'salvo', marcas: marcasDe(ficha), revisao: salvo.revisao }

      if (usuario.papel === 'jogador') {
        const mudancas = detectarMudancasCondicao(p.ficha, ficha)
        if (mudancas.length > 0) {
          const narradores = await tx.select({ id: user.id }).from(user).where(eq(user.papel, 'narrador'))
          const valores = mudancas.flatMap((mudanca) => {
            const aviso = notificacoesEventos.mudancaCondicao(mudanca, p.nome, p.id)
            return narradores.map((n) => ({ usuarioId: n.id, texto: aviso.texto, linkJson: aviso.destino }))
          })
          if (valores.length > 0) avisos = await tx.insert(notificacao).values(valores).returning()
        }
      }
    }

    await tx.insert(operacaoMarcacao).values({
      usuarioId: usuario.id,
      operacaoId: entrada.operacaoId,
      personagemId: p.id,
      entrada,
      resultado,
    })
    return { resultado, avisos, mudou: !conflito }
  })

  // Os efeitos persistidos já estão confirmados; repetir o recibo não repete os eventos.
  for (const aviso of aplicacao.avisos) {
    publicarNotificacao(aviso)
  }
  if (aplicacao.mudou) {
    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: entrada.id })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
  }
  return aplicacao.resultado
}
