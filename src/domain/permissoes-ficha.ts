import type { Papel } from './acesso'

export const STATUS_PERSONAGEM = ['rascunho', 'ativo', 'arquivado'] as const
export type StatusPersonagem = (typeof STATUS_PERSONAGEM)[number]
export const TIPOS_PERSONAGEM = ['jogador', 'nao_jogador'] as const
export type TipoPersonagem = (typeof TIPOS_PERSONAGEM)[number]

/** editar: tudo; marcar: só dano, Fome e Manchas; ler: nada. */
export type AcessoFicha = 'editar' | 'marcar' | 'ler'

type Usuario = { id: string; papel: Papel }
type Personagem = {
  donoId: string
  status: StatusPersonagem
  nome: string
  /** Jogador a quem o Narrador atribuiu o Rascunho, enquanto ele não responde. */
  atribuidoA?: string | null
  /** Nome do jogador quando a ficha é de um jogador sem conta no app. */
  jogadorNome?: string | null
}

/** O que uma pessoa pode fazer na Ficha; null quando ela nem enxerga o Personagem. */
export function acessoFicha(usuario: Usuario, _personagem: Personagem): AcessoFicha | null {
  return usuario.papel === 'narrador' ? 'editar' : null
}

/** O tipo explícito decide se é PdN; a inferência antiga preserva chamadas durante a migração. */
export function ehPdN({
  papelDono,
  status,
  jogadorNome,
  tipo,
}: {
  papelDono: Papel
  status: StatusPersonagem
  jogadorNome?: string | null
  tipo?: TipoPersonagem
}): boolean {
  if (tipo) return tipo === 'nao_jogador'
  if (jogadorNome && jogadorNome.trim()) return false
  return papelDono === 'narrador' && status !== 'rascunho'
}

/** Nome do Jogador para mostrar; prioriza jogadorNome se existir, ou o nome do usuário se o dono for jogador. */
export function nomeJogador({
  papelDono,
  nomeDono,
  jogadorNome,
}: {
  papelDono: Papel
  nomeDono: string
  jogadorNome?: string | null
}): string | null {
  if (jogadorNome && jogadorNome.trim()) return jogadorNome.trim()
  return papelDono === 'jogador' ? nomeDono : null
}

/** Rótulo explicativo sobre a origem/papel do personagem em listagens (combate, seletores). */
export function rotuloOrigemPersonagem(p: {
  status?: string
  atribuidoA?: string | null
  ehPdN?: boolean
  ehPdn?: boolean
  jogadorNome?: string | null
}): string | null {
  if (p.status === 'rascunho') {
    return '(Rascunho)'
  }
  const ehNpc = p.ehPdN ?? p.ehPdn ?? false
  if (ehNpc) {
    return '(PdN)'
  }
  if (p.jogadorNome && p.jogadorNome.trim()) {
    return `(${p.jogadorNome.trim()})`
  }
  return null
}

export type MotivoNaoConcluir = 'nao-dono' | 'nao-rascunho' | 'sem-nome'

/** "Concluir" passa o Rascunho para Ativo; só exige nome, sem validação do V5. */
export function motivoNaoConcluir(usuario: Usuario, personagem: Personagem): MotivoNaoConcluir | null {
  if (usuario.papel !== 'narrador') return 'nao-dono'
  if (personagem.status !== 'rascunho') return 'nao-rascunho'
  if (personagem.nome.trim() === '') return 'sem-nome'
  return null
}

export function podeConcluir(usuario: Usuario, personagem: Personagem): boolean {
  return motivoNaoConcluir(usuario, personagem) === null
}

export function podeApagar(usuario: Usuario, personagem: Personagem): boolean {
  return usuario.papel === 'narrador' && personagem.status === 'rascunho'
}

/** Tudo o que a interface precisa saber sobre um Personagem, calculado num lugar só. */
export function permissoesPersonagem(usuario: Usuario, personagem: Personagem) {
  const acesso = acessoFicha(usuario, personagem)
  return {
    acesso,
    podeAlterarCla: acesso === 'editar',
    podeApagar: podeApagar(usuario, personagem),
    podeConcluir: podeConcluir(usuario, personagem),
  }
}

export type PermissoesPersonagem = ReturnType<typeof permissoesPersonagem>
