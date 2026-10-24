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

/** "Concluir" passa o Rascunho para Ativo; só exige nome, sem validação do V5. */
export function podeConcluir(usuario: Usuario, personagem: Personagem): boolean {
  return (
    personagem.donoId === usuario.id &&
    personagem.status === 'rascunho' &&
    personagem.atribuidoA === null &&
    personagem.nome.trim() !== ''
  )
}

export function podeApagar(usuario: Usuario, personagem: Personagem): boolean {
  return personagem.donoId === usuario.id && personagem.status === 'rascunho'
}

/** O Narrador atribui um Rascunho próprio a um Jogador, um por vez. */
export function podeAtribuir(usuario: Usuario, personagem: Personagem): boolean {
  return (
    usuario.papel === 'narrador' &&
    personagem.donoId === usuario.id &&
    personagem.status === 'rascunho' &&
    personagem.atribuidoA === null
  )
}

export function podeCancelarAtribuicao(usuario: Usuario, personagem: Personagem): boolean {
  return usuario.papel === 'narrador' && personagem.donoId === usuario.id && personagem.atribuidoA !== null
}

/** Só o Jogador atribuído aceita ou recusa, e só enquanto o Personagem é Rascunho. */
export function podeResponderAtribuicao(usuario: Usuario, personagem: Personagem): boolean {
  return personagem.status === 'rascunho' && personagem.atribuidoA === usuario.id
}
