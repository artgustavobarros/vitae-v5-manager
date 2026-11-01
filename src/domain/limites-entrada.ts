import { z } from 'zod'

// Limites de transporte e armazenamento; não são regras de distribuição de pontos do V5.
export const LIMITE_ITENS = 100
export const identificadorSchema = z.string().min(1).max(200)
export const nomeSchema = z.string().max(120)
export const textoCurtoSchema = z.string().max(500)
export const textoLongoSchema = z.string().max(20_000)
