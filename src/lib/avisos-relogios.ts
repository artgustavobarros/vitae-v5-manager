import type { AvisoRelogio } from '#/domain/relogios'

export function enfileirarAvisosRelogios(fila: AvisoRelogio[], recebidos: AvisoRelogio[]) {
  const ids = new Set(fila.map((aviso) => aviso.id))
  return [...fila, ...recebidos.filter((aviso) => {
    if (ids.has(aviso.id)) return false
    ids.add(aviso.id)
    return true
  })]
}
