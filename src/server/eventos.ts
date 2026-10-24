import { EventEmitter } from 'node:events'

import type { EventoReal } from '#/domain/eventos'

export type { EventoReal }

class BarramentoEventos extends EventEmitter {
  emitir(evento: EventoReal) {
    this.emit('evento', evento)
  }

  escutar(ouvinte: (evento: EventoReal) => void) {
    this.on('evento', ouvinte)
    return () => this.off('evento', ouvinte)
  }
}

// Global no processo Node do servidor
const barramentoGlobal = Symbol.for('umbra.barramento')
const globalComBarramento = globalThis as unknown as { [barramentoGlobal]?: BarramentoEventos }

export const barramento: BarramentoEventos =
  globalComBarramento[barramentoGlobal] ?? (globalComBarramento[barramentoGlobal] = new BarramentoEventos())
