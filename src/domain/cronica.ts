import { z } from 'zod'

import { CLAS } from './ficha'

export const IDADES_CRIACAO = ['neofito', 'neonato', 'ancillae'] as const
export type IdadeCriacao = (typeof IDADES_CRIACAO)[number]

/**
 * Todos os 14 clãs padrão do V5 em `CLAS` (excluindo Caitiff e Sangue-Ralo,
 * que possuem opções próprias em `caitiffPermitido` e `sangueRaloPermitido`).
 */
export const CLAS_PADRAO_CRONICA: string[] = CLAS
  .filter((c) => c.id !== 'sangue-ralo' && c.id !== 'caitiff')
  .map((c) => c.id)

export const opcoesCriacaoCronicaSchema = z.object({
  idadePadrao: z.enum(IDADES_CRIACAO).default('neofito'),
  sangueRaloPermitido: z.boolean().default(false),
  caitiffPermitido: z.boolean().default(true),
  clasPermitidos: z.array(z.string()).default(CLAS_PADRAO_CRONICA),
})

export type OpcoesCriacaoCronica = z.infer<typeof opcoesCriacaoCronicaSchema>

export const OPCOES_CRIACAO_CRONICA_PADRAO: OpcoesCriacaoCronica = {
  idadePadrao: 'neofito',
  sangueRaloPermitido: false,
  caitiffPermitido: true,
  clasPermitidos: CLAS_PADRAO_CRONICA,
}
