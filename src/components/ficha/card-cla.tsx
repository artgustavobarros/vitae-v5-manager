import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { CONSULTA_CLAS } from '#/domain/catalogo/regras-consulta'
import type { Cla } from '#/domain/ficha'

/**
 * Exibe a descrição, Perdição e Compulsão do Clã selecionado (fatia 5, `docs/fatia-5-criacao-guiada.md`).
 */
export function CardPerdicaoCompulsaoCla({ cla }: { cla: Cla | null }) {
  if (!cla) return null
  const dados = CONSULTA_CLAS[cla]
  if (!dados) return null

  return (
    <Card className="border-border/60 bg-muted/20">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-serif text-base text-foreground">{dados.titulo}</CardTitle>
          {dados.disciplinas && dados.disciplinas.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dados.disciplinas.map((disc) => (
                <Badge key={disc} variant="outline" className="border-vinho/40 text-xs text-vinho">
                  {disc}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {dados.subtitulo && <CardDescription className="text-xs">{dados.subtitulo}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0 text-sm">
        {dados.perdicao && (
          <div className="flex flex-col gap-1 rounded-md border border-vinho/20 bg-vinho/5 p-3">
            <span className="text-xs font-semibold tracking-wider text-vinho uppercase">Perdição do Clã</span>
            <p className="text-sm text-foreground/90">{dados.perdicao}</p>
          </div>
        )}
        {dados.compulsao && (
          <div className="flex flex-col gap-1 rounded-md border border-border/80 bg-background/50 p-3">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Compulsão do Clã
            </span>
            <p className="text-sm text-foreground/90">{dados.compulsao}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
