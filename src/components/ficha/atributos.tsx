import { cn } from 'cn'

import { TermoRegra } from '#/components/consulta-regra'
import { Pontos } from './marcadores'

export type GrupoTracos = {
  titulo: string
  tracos: {
    id?: string
    tipo?: 'atributo' | 'habilidade'
    nome: string
    valor: number
    detalhe?: string
  }[]
}

/** Grupos de traços com título em serifa: Atributos, Habilidades. */
export function ListaTracos({ grupos }: { grupos: GrupoTracos[] }) {
  return (
    <div className="grid gap-x-8 md:grid-cols-3">
      {grupos.map((grupo) => (
        <section key={grupo.titulo}>
          <h2 className="mt-4 mb-1 font-serif text-2xl">{grupo.titulo}</h2>
          <ul>
            {grupo.tracos.map((t) => (
              <li
                key={t.nome}
                className={cn(
                  'flex min-h-11 justify-between gap-4 border-b py-2 text-base',
                  // Com Especializações, os pontos ficam na altura do nome, não no meio das duas linhas.
                  t.detalhe ? 'items-start' : 'items-center',
                )}
              >
                <span>
                  {t.tipo && t.id ? (
                    <TermoRegra tipo={t.tipo} id={t.id}>
                      {t.nome}
                    </TermoRegra>
                  ) : (
                    t.nome
                  )}
                  {t.detalhe && <span className="block text-sm text-muted-foreground">{t.detalhe}</span>}
                </span>
                {/* h-6 é a altura da linha do nome em text-base. */}
                <span className="flex h-6 shrink-0 items-center">
                  <Pontos valor={t.valor} rotulo={t.nome} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
