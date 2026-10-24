import { z } from 'zod'

import type { Papel } from './acesso'
import { escolhaVantagemSchema } from './ficha'
import type { StatusPersonagem } from './permissoes-ficha'

export const FAIXA_DOMINIO = { min: 0, max: 5 } as const

export const coterieSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  conceito: z.string().trim().max(500, 'Conceito muito longo').nullable().default(null),
  caca: z.number().int().min(FAIXA_DOMINIO.min).max(FAIXA_DOMINIO.max).default(0),
  abrigo: z.number().int().min(FAIXA_DOMINIO.min).max(FAIXA_DOMINIO.max).default(0),
  porte: z.number().int().min(FAIXA_DOMINIO.min).max(FAIXA_DOMINIO.max).default(0),
})

export type DadosCoterie = z.infer<typeof coterieSchema>

/** Tipo, Vantagens e Defeitos da Coterie, do Catálogo. Só o Narrador edita; sem conta de pontos. */
export const catalogoCoterieSchema = z.object({
  tipo: z.string().min(1).nullable(),
  vantagens: z.array(escolhaVantagemSchema),
  defeitos: z.array(escolhaVantagemSchema),
})

export type CatalogoCoterie = z.infer<typeof catalogoCoterieSchema>

type Usuario = { id: string; papel: Papel }

/** Narrador pode editar nome, conceito e domínio da Coterie. */
export function podeEditarCoterie(usuario: Usuario): boolean {
  return usuario.papel === 'narrador'
}

/** Coterie Padrão não pode ser apagada; apenas Narrador apaga outras Coteries. */
export function podeApagarCoterie(usuario: Usuario, coterie: { ehPadrao: boolean }): boolean {
  return usuario.papel === 'narrador' && !coterie.ehPadrao
}

/**
 * Convite de Coterie: Narrador convida Personagem Ativo de Jogador que ainda não é membro
 * e não possui convite pendente.
 */
export function podeConvidarParaCoterie(
  usuario: Usuario,
  candidato: {
    status: StatusPersonagem
    papelDono: Papel
    ehMembro: boolean
    temConvitePendente: boolean
  },
): boolean {
  return (
    usuario.papel === 'narrador' &&
    candidato.status === 'ativo' &&
    candidato.papelDono === 'jogador' &&
    !candidato.ehMembro &&
    !candidato.temConvitePendente
  )
}

/** Narrador adiciona PdN Ativo diretamente à Coterie sem convite. */
export function podeAdicionarPdn(
  usuario: Usuario,
  candidato: {
    ehPdN: boolean
    ativo: boolean
    ehMembro: boolean
  },
): boolean {
  return usuario.papel === 'narrador' && candidato.ehPdN && candidato.ativo && !candidato.ehMembro
}

/** Narrador pode expulsar qualquer membro de uma Coterie. */
export function podeExpulsarMembro(usuario: Usuario): boolean {
  return usuario.papel === 'narrador'
}

/** Jogador dono do Personagem pode sair da Coterie quando quiser. */
export function podeSairDaCoterie(
  usuario: Usuario,
  membro: {
    donoId: string
  },
): boolean {
  return usuario.id === membro.donoId
}

/** Jogador só enxerga as Coteries em que tem Personagem; Narrador enxerga todas. */
export function podeVerCoterie(
  usuario: Usuario,
  contexto: {
    temPersonagemNaCoterie: boolean
  },
): boolean {
  return usuario.papel === 'narrador' || contexto.temPersonagemNaCoterie
}

/** Só o Jogador dono do Personagem convidado pode aceitar ou recusar o convite. */
export function podeResponderConviteCoterie(
  usuario: Usuario,
  convite: {
    donoPersonagemId: string
  },
): boolean {
  return usuario.id === convite.donoPersonagemId
}

/**
 * Barra de filtro por Coterie aparece quando a pessoa enxerga 3 ou mais Coteries.
 */
export function deveExibirFiltroCoteries(totalCoteriesVisiveis: number): boolean {
  return totalCoteriesVisiveis >= 3
}
