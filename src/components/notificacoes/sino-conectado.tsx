import { useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { buscarNotificacoes, marcarNotificacoesLidas } from '#/server/notificacoes'
import { SinoNotificacoes, type Notificacao } from './sino-notificacoes'

export function SinoConectado() {
  const router = useRouter()
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])

  async function carregar() {
    try {
      const itens = (await buscarNotificacoes()) as {
        id: string
        texto: string
        quando: string
        lida: boolean
        destino?: Notificacao['destino']
      }[]
      if (Array.isArray(itens)) {
        setNotificacoes(
          itens.map((i) => ({
            id: i.id,
            texto: i.texto,
            quando: new Date(i.quando),
            lida: i.lida,
            destino: i.destino,
          })),
        )
      }
    } catch {
      // silencioso se não autenticado
    }
  }

  useEffect(() => {
    carregar()
    // Atualiza a cada invalidação do roteador
    return router.subscribe('onResolved', () => {
      carregar()
    })
  }, [router])

  async function aoMarcarLidas() {
    setNotificacoes((atuais) => atuais.map((n) => ({ ...n, lida: true })))
    try {
      await marcarNotificacoesLidas()
      router.invalidate()
    } catch {
      carregar()
    }
  }

  return <SinoNotificacoes notificacoes={notificacoes} onMarcarLidas={aoMarcarLidas} />
}
