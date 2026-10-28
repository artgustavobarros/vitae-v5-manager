import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

import { useSincronizacaoMarcas } from '#/components/provedor-marcas'
import type { Marcas } from '#/domain/ficha'
import type { EstadoMarcas } from './sincronizacao-marcas'

export function useMarcasSincronizadas(id: string, marcas: Marcas, revisao: number) {
  const sincronizacao = useSincronizacaoMarcas()
  if (!sincronizacao) throw new Error('A Ficha precisa de uma sessão para sincronizar as marcas.')

  const inicial: EstadoMarcas = useMemo(() => ({
    marcas, pendentes: 0, erro: null, conflito: false, bloqueado: false, pronto: false,
    enviando: false, persistindo: false,
  }), [marcas])
  const observar = useCallback((avisar: () => void) => sincronizacao.observar(avisar), [sincronizacao])
  const obter = useCallback(() => sincronizacao.obterEstado(id) ?? inicial, [sincronizacao, id, inicial])
  const obterInicial = useCallback(() => inicial, [inicial])
  const estado = useSyncExternalStore(observar, obter, obterInicial)

  useEffect(() => {
    sincronizacao.receber(id, marcas, revisao)
  }, [sincronizacao, id, marcas, revisao])

  return {
    ...estado,
    alterar: (mudanca: Partial<Marcas>) => {
      sincronizacao.receber(id, marcas, revisao)
      const atuais = sincronizacao.obterEstado(id)?.marcas ?? marcas
      sincronizacao.alterar(id, { ...atuais, ...mudanca })
    },
    tentarNovamente: () => sincronizacao.tentarNovamente(id),
    descartar: () => sincronizacao.descartar(id),
  }
}
