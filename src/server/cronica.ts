import { createServerFn } from '@tanstack/react-start'

import {
  opcoesCriacaoCronicaSchema,
  type OpcoesCriacaoCronica,
} from '#/domain/cronica'
import {
  atualizarOpcoesCriacaoCronicaNoBanco,
  obterOpcoesCriacaoCronicaDoBanco,
} from '#/server/cronica-db'
import { exigirNarrador, exigirUsuario } from '#/server/sessao'

/**
 * Retorna as opções de criação da Crônica configuradas pelo Narrador.
 * Disponível para qualquer usuário autenticado (Jogador ou Narrador).
 */
export const obterOpcoesCriacaoCronica = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .handler(async () => {
    return obterOpcoesCriacaoCronicaDoBanco()
  })

/**
 * Atualiza as opções de criação da Crônica no banco.
 * Apenas Narrador pode executar.
 */
export const atualizarOpcoesCriacaoCronica = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(opcoesCriacaoCronicaSchema)
  .handler(async ({ data }: { data: OpcoesCriacaoCronica }) => {
    return atualizarOpcoesCriacaoCronicaNoBanco(data)
  })
