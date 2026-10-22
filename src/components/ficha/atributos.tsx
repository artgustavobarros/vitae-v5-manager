import { Pontos } from './marcadores'

export type GrupoTracos = { titulo: string; tracos: { nome: string; valor: number }[] }

/** Grupos de traços com título em serifa: Atributos, Habilidades. */
export function ListaTracos({ grupos }: { grupos: GrupoTracos[] }) {
  return (
    <div className="grid gap-x-8 md:grid-cols-3">
      {grupos.map((grupo) => (
        <section key={grupo.titulo}>
          <h2 className="mt-4 mb-1 font-serif text-2xl">{grupo.titulo}</h2>
          <ul>
            {grupo.tracos.map((t) => (
              <li key={t.nome} className="flex h-11 items-center justify-between border-b text-base">
                <span>{t.nome}</span>
                <Pontos valor={t.valor} rotulo={t.nome} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
