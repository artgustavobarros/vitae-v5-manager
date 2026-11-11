import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { Button } from '#/components/ui/button'

export function BotaoVisibilidadeCondicao({ revelada, onAlterar }: {
  revelada: boolean
  onAlterar: (revelar: boolean) => Promise<void>
}) {
  const [salvando, setSalvando] = useState(false)
  const acao = revelada ? 'Ocultar Condição do público' : 'Mostrar Condição ao público'

  return <Button variant="outline" className="h-11 w-fit max-w-full text-xs"
    aria-pressed={revelada} aria-busy={salvando} disabled={salvando}
    title={`${acao}: Vitalidade, Força de Vontade e Fome. Vale para todos no Combate.`}
    onClick={async () => {
      setSalvando(true)
      try { await onAlterar(!revelada) } finally { setSalvando(false) }
    }}>
    {revelada ? <Eye aria-hidden="true" className="size-4" /> : <EyeOff aria-hidden="true" className="size-4" />}
    {salvando ? 'Salvando visibilidade…' : acao}
  </Button>
}
