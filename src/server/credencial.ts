import { and, eq } from 'drizzle-orm'

import { db } from '#/db'
import { account } from '#/db/schema'

// Fica fora de conta.ts: só os handlers das server functions somem do bundle do cliente,
// e um helper no mesmo arquivo levaria o `pg` junto.

/** Provedor do better-auth para conta com senha; conta só Google não tem essa linha. */
const PROVEDOR_SENHA = 'credential'

/** A conta com senha da pessoa, ou undefined se ela entra só pelo Google. */
export function buscarCredencial(userId: string) {
  return db.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.providerId, PROVEDOR_SENHA)),
  })
}

/** Ids de quem tem senha, para a lista de Jogadores do Narrador. */
export async function idsComSenha(): Promise<Set<string>> {
  const linhas = await db.select({ userId: account.userId }).from(account).where(eq(account.providerId, PROVEDOR_SENHA))
  return new Set(linhas.map((a) => a.userId))
}
