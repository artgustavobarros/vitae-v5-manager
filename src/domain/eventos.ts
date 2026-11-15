export type EventoReal = {
  tipo: 'mudanca'
  escopo: 'personagem' | 'painel' | 'combate' | 'paradas' | 'relogios' | 'link-publico'
  id?: string
  apenasNarrador?: boolean
}
