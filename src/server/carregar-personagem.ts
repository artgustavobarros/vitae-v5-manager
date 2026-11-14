import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { personagem } from '#/db/schema'
import { acessoFicha, ehPdN, type AcessoFicha, type StatusPersonagem, type TipoPersonagem } from '#/domain/permissoes-ficha'
import type { Usuario } from '#/server/sessao'

// Fica fora de personagens.ts: só os handlers das server functions somem do bundle do cliente,
// e um helper no mesmo arquivo levaria o `pg` junto.

type Executor = Pick<typeof db, 'select'>

/** Lê o Personagem e barra quem não tem um dos acessos pedidos. Dentro de transação, trava a linha. */
export async function carregar(
  usuario: Usuario,
  id: string,
  aceitos: AcessoFicha[],
  executor: Executor = db,
) {
  const consulta = executor.select().from(personagem).where(eq(personagem.id, id))
  const [p] = executor === db ? await consulta : await consulta.for('update')
  const acesso = p ? acessoFicha(usuario, p) : null
  if (!p || !acesso || !aceitos.includes(acesso)) throw new Error('Acesso negado')
  return { ...p, acesso }
}

/** O tipo do Personagem é explícito e não depende mais de quem é o dono técnico da linha. */
export async function ehPdNNoBanco(p: { status: StatusPersonagem; tipo: TipoPersonagem }) {
  return ehPdN({ papelDono: 'narrador', status: p.status, tipo: p.tipo })
}
