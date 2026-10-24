import { cn } from 'cn'
import { useState, type ReactNode } from 'react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import { buscarConsultaRegra, type TipoConsulta } from '#/domain/catalogo/regras-consulta'
import { useMediaQuery } from '#/lib/use-media-query'

export function TermoRegra({
  tipo,
  id,
  children,
  className,
  icone = false,
}: {
  /** 'catalogo' abre o cartão de um item do Catálogo (poder, Ritual, Vantagem...) pelo id. */
  tipo: TipoConsulta | 'catalogo'
  id: string
  children: ReactNode
  className?: string
  /** Gatilho só com ícone (ⓘ), num alvo de 36px; sem isso, o termo fica no fluxo do texto. */
  icone?: boolean
}) {
  const [aberto, setAberto] = useState(false)
  const computador = useMediaQuery('(min-width: 768px)')
  const item = buscarConsultaRegra(tipo, id)

  if (!item) {
    return <span className={className}>{children}</span>
  }

  const conteudo = (
    <div className="flex flex-col gap-4 text-sm">
      <p className="text-muted-foreground leading-relaxed">{item.descricao}</p>

      {item.campos && item.campos.length > 0 && (
        <dl className="flex flex-col divide-y border-y">
          {item.campos.map((c) => (
            <div key={c.rotulo} className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">{c.rotulo}</dt>
              <dd className="text-right text-foreground">{c.valor}</dd>
            </div>
          ))}
        </dl>
      )}

      {item.tabela && (
        <div className="overflow-x-auto border-t pt-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground">
                {item.tabela.colunas.map((c) => (
                  <th key={c} className="px-1 pb-2 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {item.tabela.linhas.map((linha, i) => (
                <tr key={i} className="border-t">
                  {linha.map((celula, j) => (
                    <td key={j} className="px-1 py-2 tabular-nums">
                      {celula}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {item.exemplosEspecializacoes && item.exemplosEspecializacoes.length > 0 && (
        <div className="flex flex-col gap-1 border-t pt-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Exemplos de Especializações
          </span>
          <p className="text-foreground">{item.exemplosEspecializacoes.join(', ')}</p>
        </div>
      )}

      {item.disciplinas && item.disciplinas.length > 0 && (
        <div className="flex flex-col gap-1 border-t pt-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Disciplinas de Clã
          </span>
          <p className="text-foreground">{item.disciplinas.join(', ')}</p>
        </div>
      )}

      {item.perdicao && (
        <div className="flex flex-col gap-1 border-t pt-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Perdição
          </span>
          <p className="text-foreground">{item.perdicao}</p>
        </div>
      )}

      {item.compulsao && (
        <div className="flex flex-col gap-1 border-t pt-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Compulsão
          </span>
          <p className="text-foreground">{item.compulsao}</p>
        </div>
      )}

      {item.niveis && item.niveis.length > 0 && (
        <div className="flex flex-col gap-2 border-t pt-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Escala
          </span>
          <div className="flex flex-col gap-2">
            {item.niveis.map((n) => (
              <div key={n.nivel} className="flex flex-col">
                <span className="font-semibold text-foreground">
                  {n.nivel} — {n.rotulo}
                </span>
                <span className="text-xs text-muted-foreground">{n.descricao}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreditoWiki />
    </div>
  )

  return (
    <>
      {/* variant link sem sublinhado: o termo parece texto e só esquenta em vinho no hover. */}
      <Button
        type="button"
        variant="link"
        size={icone ? 'icon' : 'default'}
        onClick={() => setAberto(true)}
        className={cn(
          'cursor-pointer font-normal text-inherit hover:text-vinho hover:no-underline',
          !icone && 'inline h-auto rounded-xs p-0 text-left text-base whitespace-normal',
          className,
        )}
        aria-label={`Ver detalhes de ${item.titulo}`}
      >
        {children}
      </Button>

      {computador ? (
        <Dialog open={aberto} onOpenChange={setAberto}>
          <DialogContent className="max-h-4/5 max-w-md overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{item.titulo}</DialogTitle>
              {item.subtitulo && (
                <DialogDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {item.subtitulo}
                </DialogDescription>
              )}
            </DialogHeader>
            {conteudo}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={aberto} onOpenChange={setAberto}>
          <SheetContent side="bottom" className="max-h-4/5 overflow-y-auto rounded-t-xl px-4 pb-8">
            <SheetHeader className="border-b pb-3 text-left">
              <SheetTitle>{item.titulo}</SheetTitle>
              {item.subtitulo && (
                <SheetDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {item.subtitulo}
                </SheetDescription>
              )}
            </SheetHeader>
            <div className="pt-4">{conteudo}</div>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}

/** Rodapé de crédito da consulta rápida e da página de revisão. */
export function CreditoWiki() {
  return (
    <p className="border-t pt-3 text-xs text-muted-foreground">
      Dados de referência:{' '}
      <a
        href="https://vtm.paradoxwikis.com/VTM_Wiki"
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-4 hover:text-vinho"
      >
        VTM Wiki
      </a>{' '}
      (
      <a
        href="https://creativecommons.org/licenses/by-sa/3.0/"
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-4 hover:text-vinho"
      >
        CC BY-SA 3.0
      </a>
      )
    </p>
  )
}
