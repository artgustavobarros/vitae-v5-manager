import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import type { Papel } from '#/domain/acesso'

import { SinoNotificacoes, type Notificacao } from './sino-notificacoes'

// Demonstração do layout das notificações. Só existe em `pnpm dev`; os dados reais
// chegam com o tempo real (SSE), ver docs/escopo-v1.md.

const MIN = 60_000

function exemplos(papel: Papel): Notificacao[] {
  const agora = Date.now()
  const texto =
    papel === 'narrador'
      ? ['Helena Sarmento concluiu o Personagem', 'Rui aceitou o Convite de Coterie: O Grupo', 'Helena Sarmento marcou uma Mancha']
      : ['O Narrador mexeu na sua Ficha', 'Convite de Coterie: O Grupo', 'Sua Ficha foi liberada']
  return [
    { id: '1', texto: texto[0], quando: new Date(agora - 5 * MIN), lida: false, destino: { to: '/' } },
    { id: '2', texto: texto[1], quando: new Date(agora - 60 * MIN), lida: false, destino: { to: '/' } },
    { id: '3', texto: texto[2], quando: new Date(agora - 26 * 60 * MIN), lida: true, destino: { to: '/' } },
  ]
}

export function SinoDemo({ papel }: { papel: Papel }) {
  const [notificacoes, setNotificacoes] = useState(() => exemplos(papel))

  function simular() {
    const nova: Notificacao = {
      id: crypto.randomUUID(),
      texto: papel === 'narrador' ? 'Rui concluiu o Personagem' : 'O Narrador aplicou uma Compulsão Ativa',
      quando: new Date(),
      lida: false,
      destino: { to: '/' },
    }
    setNotificacoes((atuais) => [nova, ...atuais])
    toast(nova.texto)
  }

  return (
    <SinoNotificacoes
      notificacoes={notificacoes}
      onMarcarLidas={() => setNotificacoes((atuais) => atuais.map((n) => ({ ...n, lida: true })))}
      rodape={
        <Button variant="secondary" size="sm" className="w-full" onClick={simular}>
          Simular notificação (demo)
        </Button>
      }
    />
  )
}
