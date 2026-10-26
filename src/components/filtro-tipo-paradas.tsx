import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { filtrarParadas, type ParadaCalculada, type TipoParadas } from '#/domain/paradas'

const TIPOS = [
  { valor: 'todos', rotulo: 'Todas' },
  { valor: 'fisico', rotulo: 'Físicas' },
  { valor: 'social', rotulo: 'Sociais' },
  { valor: 'mental', rotulo: 'Mentais' },
] as const

export function FiltroTipoParadas({ paradas, tipo, busca, onChange }: {
  paradas: readonly ParadaCalculada[]
  tipo: TipoParadas
  busca: string
  onChange: (tipo: TipoParadas) => void
}) {
  return (
    <ToggleGroup type="single" value={tipo} size="sm" spacing={1}
      aria-label="Filtrar pelo tipo da Habilidade" className="max-w-full flex-wrap gap-1"
      onValueChange={(valor) => {
        const opcao = TIPOS.find((t) => t.valor === valor)
        if (opcao) onChange(opcao.valor)
      }}>
      {TIPOS.map((t) => (
        <ToggleGroupItem key={t.valor} value={t.valor} className="gap-2 px-2 text-sm">
          {t.rotulo}
          <span className="text-xs tabular-nums text-muted-foreground">{filtrarParadas(paradas, t.valor, busca).length}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
