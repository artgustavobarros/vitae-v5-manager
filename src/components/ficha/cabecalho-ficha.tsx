import type { CSSProperties, ReactNode } from 'react'

/**
 * Topo da Ficha: o fundo aquece em vinho conforme a Fome sobe (0 a 5).
 * Nome e descrição rolam; o horizonte de Humanidade e as trilhas ficam presos no topo.
 * O degradê ocupa a largura toda; o conteúdo fica na coluna central.
 */
export function CabecalhoFicha({
  barra,
  nome,
  descricao,
  fome,
  horizonte,
  selo,
  children,
}: {
  nome: string
  descricao: string
  /** Aviso curto sob a descrição, como o status de Rascunho. */
  selo?: ReactNode
  fome: number
  barra: ReactNode
  horizonte: ReactNode
  children: ReactNode
}) {
  const nivel = { '--fome-nivel': fome } as CSSProperties

  return (
    <>
      <section className="topo-fome" style={nivel}>
        <div className="mx-auto max-w-3xl">
          {barra}
          <div className="px-4 pt-2 pb-4">
            <h1 className="font-serif text-display text-balance">{nome}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
            {selo && <div className="mt-2">{selo}</div>}
          </div>
        </div>
      </section>
      <section aria-label="Estado do Personagem" className="faixa-fome sticky top-0 z-10 border-b" style={nivel}>
        <div className="mx-auto max-w-3xl px-4">
          {horizonte}
          <div className="mt-2 divide-y border-t border-t-vinho/25">{children}</div>
        </div>
      </section>
    </>
  )
}
