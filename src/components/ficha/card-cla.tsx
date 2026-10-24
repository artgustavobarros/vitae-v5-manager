import { Info } from 'lucide-react'

import { TermoRegra } from '#/components/consulta-regra'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { buscarConsultaRegra, CONSULTA_CLAS } from '#/domain/catalogo/regras-consulta'
import type { Cla } from '#/domain/ficha'

function slugDisciplina(nome: string): string {
  const normalizado = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalizado === 'auspex' ? 'auspicios' : normalizado
}

/**
 * Exibe a descrição, Perdição e Compulsão do Clã selecionado (fatia 5, `docs/fatia-5-criacao-guiada.md`).
 * Permite clicar no nome do clã, nas disciplinas, na perdição e na compulsão para ver a regra completa.
 */
export function CardPerdicaoCompulsaoCla({ cla }: { cla: Cla | null }) {
  if (!cla) return null
  const dados = CONSULTA_CLAS[cla]
  if (!dados) return null

  return (
    <Card className="border-border/60 bg-muted/20">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TermoRegra tipo="cla" id={cla} className="h-auto p-0">
            <CardTitle className="font-serif text-base text-foreground transition-colors hover:text-vinho cursor-pointer inline-flex items-center gap-1.5 underline-offset-4 hover:underline">
              <span>{dados.titulo}</span>
              <Info className="size-3.5 text-muted-foreground" aria-hidden />
            </CardTitle>
          </TermoRegra>
          {dados.disciplinas && dados.disciplinas.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {dados.disciplinas.map((disc) => {
                const slug = slugDisciplina(disc)
                const temRegra = buscarConsultaRegra('disciplina', slug)
                if (!temRegra) {
                  return (
                    <Badge key={disc} variant="outline" className="border-vinho/40 text-xs text-vinho">
                      {disc}
                    </Badge>
                  )
                }
                return (
                  <TermoRegra key={disc} tipo="disciplina" id={slug} className="h-auto p-0 inline-flex">
                    <Badge
                      variant="outline"
                      className="cursor-pointer border-vinho/40 text-xs text-vinho transition-colors hover:border-vinho hover:bg-vinho/15 hover:text-foreground"
                    >
                      {disc}
                    </Badge>
                  </TermoRegra>
                )
              })}
            </div>
          )}
        </div>
        {dados.subtitulo && <CardDescription className="text-xs">{dados.subtitulo}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0 text-sm">
        {dados.perdicao && (
          <TermoRegra tipo="termo" id="perdicao" className="block text-left w-full h-auto p-0">
            <div className="flex flex-col gap-1 rounded-md border border-vinho/20 bg-vinho/5 p-3 transition-colors hover:border-vinho/40 hover:bg-vinho/10 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-vinho uppercase">Perdição do Clã</span>
                <Info className="size-3 text-vinho/70" aria-hidden />
              </div>
              <p className="text-sm text-foreground/90">{dados.perdicao}</p>
            </div>
          </TermoRegra>
        )}
        {dados.compulsao && (
          <TermoRegra tipo="termo" id="compulsao" className="block text-left w-full h-auto p-0">
            <div className="flex flex-col gap-1 rounded-md border border-border/80 bg-background/50 p-3 transition-colors hover:border-border hover:bg-background/80 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Compulsão do Clã
                </span>
                <Info className="size-3 text-muted-foreground/70" aria-hidden />
              </div>
              <p className="text-sm text-foreground/90">{dados.compulsao}</p>
            </div>
          </TermoRegra>
        )}
      </CardContent>
    </Card>
  )
}
