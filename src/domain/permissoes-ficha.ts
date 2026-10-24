import type { Papel } from './acesso'

export const STATUS_PERSONAGEM = ['rascunho', 'ativo', 'arquivado'] as const
export type StatusPersonagem = (typeof STATUS_PERSONAGEM)[number]

/** editar: tudo; marcar: só dano, Fome e Manchas; ler: nada. */
export type AcessoFicha = 'editar' | 'marcar' | 'ler'

type Usuario = { id: string; papel: Papel }
type Personagem = {
  donoId: string
  status: StatusPersonagem
  nome: string
  /** Jogador a quem o Narrador atribuiu o Rascunho, enquanto ele não responde. */
  atribuidoA: string | null
}

/** O que uma pessoa pode fazer na Ficha; null quando ela nem enxerga o Personagem. */
export function acessoFicha(usuario: Usuario, personagem: Personagem): AcessoFicha | null {
  const dono = personagem.donoId === usuario.id
  if (personagem.status === 'arquivado') return dono || usuario.papel === 'narrador' ? 'ler' : null
  if (usuario.papel === 'narrador') {
    return !dono && personagem.status === 'rascunho' ? 'ler' : 'editar'
  }
  if (podeResponderAtribuicao(usuario, personagem)) return 'ler'
  if (!dono) return null
  return personagem.status === 'rascunho' ? 'editar' : 'marcar'
}

/** PdN é Personagem do Narrador já concluído; um Rascunho do Narrador ainda não é PdN. */
export function ehPdN({ papelDono, status }: { papelDono: Papel; status: StatusPersonagem }): boolean {
  return papelDono === 'narrador' && status !== 'rascunho'
}

/** Na criação, o Jogador segue as regras (Clã e Geração); as edições do Narrador ignoram a validação. */
export function exigeRegrasCriacao(usuario: Usuario, personagem: Personagem): boolean {
  return usuario.papel === 'jogador' && personagem.status === 'rascunho'
}

export type MotivoNaoConcluir = 'nao-dono' | 'nao-rascunho' | 'atribuido' | 'sem-nome'

/** "Concluir" passa o Rascunho para Ativo; só exige nome, sem validação do V5. */
export function motivoNaoConcluir(usuario: Usuario, personagem: Personagem): MotivoNaoConcluir | null {
  if (personagem.donoId !== usuario.id) return 'nao-dono'
  if (personagem.status !== 'rascunho') return 'nao-rascunho'
  if (personagem.atribuidoA !== null) return 'atribuido'
  if (personagem.nome.trim() === '') return 'sem-nome'
  return null
}

export function podeConcluir(usuario: Usuario, personagem: Personagem): boolean {
  return motivoNaoConcluir(usuario, personagem) === null
}

export function podeApagar(usuario: Usuario, personagem: Personagem): boolean {
  return personagem.donoId === usuario.id && personagem.status === 'rascunho'
}

/** O Narrador atribui um Rascunho próprio a um Jogador, um por vez. Com `alvo`, confere também que ele é Jogador. */
export function podeAtribuir(usuario: Usuario, personagem: Personagem, alvo?: { papel: Papel }): boolean {
  return (
    usuario.papel === 'narrador' &&
    personagem.donoId === usuario.id &&
    personagem.status === 'rascunho' &&
    personagem.atribuidoA === null &&
    (alvo === undefined || alvo.papel === 'jogador')
  )
}

export function podeCancelarAtribuicao(usuario: Usuario, personagem: Personagem): boolean {
  return usuario.papel === 'narrador' && personagem.donoId === usuario.id && personagem.atribuidoA !== null
}

/** Só o Jogador atribuído aceita ou recusa, e só enquanto o Personagem é Rascunho. */
export function podeResponderAtribuicao(usuario: Usuario, personagem: Personagem): boolean {
  return personagem.status === 'rascunho' && personagem.atribuidoA === usuario.id
}

/** Aceitar: o Rascunho passa a ser do Jogador. Recusar: volta a ser só do Narrador. */
export function aplicarRespostaAtribuicao(
  usuario: Usuario,
  aceitar: boolean,
): { donoId?: string; atribuidoA: null } {
  return aceitar ? { donoId: usuario.id, atribuidoA: null } : { atribuidoA: null }
}

/** Tudo o que a interface precisa saber sobre um Personagem, calculado num lugar só. */
export function permissoesPersonagem(usuario: Usuario, personagem: Personagem) {
  const acesso = acessoFicha(usuario, personagem)
  return {
    acesso,
    /** Rascunho editável abre no wizard de criação; o resto abre na Ficha. */
    abreNoWizard: acesso === 'editar' && personagem.status === 'rascunho',
    podeApagar: podeApagar(usuario, personagem),
    podeConcluir: podeConcluir(usuario, personagem),
    podeAtribuir: podeAtribuir(usuario, personagem),
    podeCancelarAtribuicao: podeCancelarAtribuicao(usuario, personagem),
    regrasCriacao: exigeRegrasCriacao(usuario, personagem),
  }
}

export type PermissoesPersonagem = ReturnType<typeof permissoesPersonagem>
