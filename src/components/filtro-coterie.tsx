import { Button } from '#/components/ui/button'
import { deveExibirFiltroCoteries } from '#/domain/coterie'

export function FiltroCoterie({
  coteries,
  selecionada,
  onSelecionar,
}: {
  coteries: { id: string; nome: string }[]
  selecionada: string | null
  onSelecionar: (id: string | null) => void
}) {
  if (!deveExibirFiltroCoteries(coteries.length)) return null

  return (
    <div className="flex flex-wrap items-center gap-2 py-2" role="group" aria-label="Filtrar por Coterie">
      <Button
        variant={selecionada === null ? 'default' : 'outline'}
        size="sm"
        className="rounded-full h-8 px-3 text-xs"
        onClick={() => onSelecionar(null)}
      >
        Todas
      </Button>
      {coteries.map((c) => (
        <Button
          key={c.id}
          variant={selecionada === c.id ? 'default' : 'outline'}
          size="sm"
          className="rounded-full h-8 px-3 text-xs"
          onClick={() => onSelecionar(c.id)}
        >
          {c.nome}
        </Button>
      ))}
    </div>
  )
}
