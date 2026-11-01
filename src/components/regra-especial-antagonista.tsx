import { useId } from 'react'

import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import type { EspecialAntagonista } from '#/domain/bestiario'

export function RegraEspecialAntagonista({ regra, onChange }: {
  regra: EspecialAntagonista['regra']
  onChange: (regra: EspecialAntagonista['regra']) => void
}) {
  const id = useId()
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={regra === 'poder-livre-nivel-1'} onCheckedChange={ativo => onChange(ativo ? 'poder-livre-nivel-1' : null)} />
      <Label htmlFor={id} className="text-xs">Um poder de Disciplina de nível 1 à escolha</Label>
    </div>
  )
}
