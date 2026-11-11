import type { AvisoRelogio } from './relogios'

export type EventoReal =
  | {
      tipo: 'mudanca'
      escopo: 'personagem' | 'coterie' | 'painel' | 'notificacao' | 'combate' | 'paradas' | 'relogios' | 'link-publico'
      id?: string
      paraUsuarioId?: string
      apenasNarrador?: boolean
    }
  | { tipo: 'efeitos-relogio'; apenasNarrador: boolean; avisos: AvisoRelogio[] }
  | {
      tipo: 'notificacao'
      paraUsuarioId: string
      notificacao: {
        id: string
        texto: string
        quando: string
        lida: boolean
        destino?: { to: string; params?: Record<string, string>; search?: Record<string, string | number | boolean> }
      }
    }
