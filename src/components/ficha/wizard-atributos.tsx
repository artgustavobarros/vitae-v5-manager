import { Badge } from '#/components/ui/badge'
import { TermoRegra } from '#/components/consulta-regra'
import { validarAtributosCriacao } from '#/domain/criacao'
import { GRUPOS, type Atributo, type Ficha } from '#/domain/ficha'
import { atributosDoGrupo } from './tracos'
import { SeletorPontos } from './marcadores'

export function CamposAtributosCriacao({
  ficha,
  mudar,
  regrasCriacao = false,
}: {
  ficha: Ficha
  mudar: (parcial: Partial<Ficha>) => void
  regrasCriacao?: boolean
}) {
  const validacao = validarAtributosCriacao(ficha.atributos)

  function alterarAtributo(id: Atributo, valor: number) {
    mudar({ atributos: { ...ficha.atributos, [id]: valor } })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Painel de slots de Atributos */}
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Distribuição de Atributos (V5)</span>
          <span className="text-xs text-muted-foreground">Todos começam em 1</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Aloque seus atributos para preencher exatamente: 1 atributo em 4, 3 em 3, 4 em 2 e 1 em 1.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([4, 3, 2, 1] as const).map((nivel) => {
            const slot = validacao.slots[nivel]
            const completo = slot.atual === slot.esperado
            const excedido = slot.atual > slot.esperado
            return (
              <div
                key={nivel}
                className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">Nível {nivel}</span>
                <Badge
                  variant={completo ? 'secondary' : excedido ? 'destructive' : 'outline'}
                  className="tabular-nums"
                >
                  {slot.atual} / {slot.esperado}
                </Badge>
              </div>
            )
          })}
        </div>

        {regrasCriacao && !validacao.valido && (
          <div className="mt-2 flex flex-col gap-1">
            {validacao.erros.map((erro, i) => (
              <span key={i} className="text-xs text-vinho">
                • {erro}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Seletor de atributos por grupo */}
      {GRUPOS.map((g) => (
        <section key={g.id} className="flex flex-col gap-2">
          <h4 className="text-base font-semibold">{g.atributos}</h4>
          <ul className="flex flex-col divide-y rounded-lg border">
            {atributosDoGrupo(g.id).map((a) => (
              <li key={a.id} className="flex min-h-12 items-center justify-between gap-4 px-4 py-2">
                <TermoRegra tipo="atributo" id={a.id}>
                  {a.nome}
                </TermoRegra>
                <SeletorPontos
                  rotulo={a.nome}
                  valor={ficha.atributos[a.id]}
                  min={1}
                  max={regrasCriacao ? 4 : 5}
                  onChange={(valor) => alterarAtributo(a.id, valor)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
