import { Plus, Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { validarConviccoes } from '#/domain/criacao'
import type { Ficha } from '#/domain/ficha'

export function CamposConviccoesCriacao({
  ficha,
  mudar,
  regrasCriacao = false,
}: {
  ficha: Ficha
  mudar: (parcial: Partial<Ficha>) => void
  regrasCriacao?: boolean
}) {
  const conviccoes = ficha.conviccoes ?? []
  const validacao = validarConviccoes(conviccoes)

  function adicionarPar() {
    if (conviccoes.length >= 3) return
    mudar({
      conviccoes: [...conviccoes, { conviccao: '', pedraDeToque: '' }],
    })
  }

  function removerPar(index: number) {
    const novas = [...conviccoes]
    novas.splice(index, 1)
    mudar({ conviccoes: novas })
  }

  function alterarPar(index: number, campo: 'conviccao' | 'pedraDeToque', valor: string) {
    const novas = [...conviccoes]
    novas[index] = { ...novas[index], [campo]: valor }
    mudar({ conviccoes: novas })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Convicções e Pedras de Toque */}
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Convicções e Pedras de Toque</span>
          <span className="text-xs tabular-nums text-muted-foreground">{conviccoes.length} / 3</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Cada Convicção é um princípio humano ancorado em uma pessoa mortal viva (Pedra de Toque).
          Defina de 1 a 3 pares.
        </p>

        <div className="flex flex-col gap-3">
          {conviccoes.map((par, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border bg-background p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Pilar {i + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removerPar(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor={`conviccao-${i}`} className="text-xs text-muted-foreground">
                  Convicção (Princípio moral):
                </Label>
                <Input
                  id={`conviccao-${i}`}
                  placeholder="Ex.: Nunca machucar crianças inocentes"
                  value={par.conviccao}
                  onChange={(e) => alterarPar(i, 'conviccao', e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor={`pedra-${i}`} className="text-xs text-muted-foreground">
                  Pedra de Toque (Humano mortal e relação):
                </Label>
                <Input
                  id={`pedra-${i}`}
                  placeholder="Ex.: Irmã caçula Clara, pediatra"
                  value={par.pedraDeToque}
                  onChange={(e) => alterarPar(i, 'pedraDeToque', e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          ))}

          {conviccoes.length < 3 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={adicionarPar}
              className="flex items-center gap-2 self-start"
            >
              <Plus className="h-4 w-4" />
              Adicionar Convicção e Pedra de Toque
            </Button>
          )}
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

      {/* Ambição e Desejo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="ambicao" className="text-sm font-medium">
            Ambição (Objetivo de longo prazo)
          </Label>
          <Input
            id="ambicao"
            placeholder="Ex.: Tomar o controle da boate Elysium..."
            value={ficha.ambicao}
            onChange={(e) => mudar({ ambicao: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="desejo" className="text-sm font-medium">
            Desejo (Meta imediata da noite)
          </Label>
          <Input
            id="desejo"
            placeholder="Ex.: Conseguir o número de telefone da cantora..."
            value={ficha.desejo}
            onChange={(e) => mudar({ desejo: e.target.value })}
          />
        </div>
      </div>

      {/* Aparência e História */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="aparencia" className="text-sm font-medium">
            Aparência
          </Label>
          <Textarea
            id="aparencia"
            placeholder="Descreva traços marcantes, roupas, postura e estilo..."
            value={ficha.aparencia}
            onChange={(e) => mudar({ aparencia: e.target.value })}
            rows={3}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="historia" className="text-sm font-medium">
            História
          </Label>
          <Textarea
            id="historia"
            placeholder="Quem era em vida, como foi o Abraço e como sobreviveu até hoje..."
            value={ficha.historia}
            onChange={(e) => mudar({ historia: e.target.value })}
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
