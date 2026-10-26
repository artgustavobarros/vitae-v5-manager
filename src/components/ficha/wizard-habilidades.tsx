import { Badge } from '#/components/ui/badge'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { TermoRegra } from '#/components/consulta-regra'
import {
  validarHabilidadesCriacao,
  type Especializacao,
  type PerfilHabilidade,
} from '#/domain/criacao'
import { GRUPOS, type Ficha, type Habilidade } from '#/domain/ficha'
import { habilidadesDoGrupo } from './tracos'
import { SeletorPontos } from './marcadores'

const PERFIS: { id: PerfilHabilidade; titulo: string; descricao: string }[] = [
  {
    id: 'especialista',
    titulo: 'Especialista',
    descricao: '1 em 4, 3 em 3, 3 em 2, 3 em 1 (10 perícias)',
  },
  {
    id: 'equilibrado',
    titulo: 'Equilibrado',
    descricao: '3 em 3, 5 em 2, 7 em 1 (15 perícias)',
  },
  {
    id: 'generalista',
    titulo: 'Generalista',
    descricao: '1 em 3, 8 em 2, 10 em 1 (19 perícias)',
  },
]

export function CamposHabilidadesCriacao({
  ficha,
  mudar,
  perfil,
  onMudarPerfil,
  regrasCriacao = false,
}: {
  ficha: Ficha
  mudar: (parcial: Partial<Ficha>) => void
  perfil: PerfilHabilidade
  onMudarPerfil: (p: PerfilHabilidade) => void
  regrasCriacao?: boolean
}) {
  // Coletar especializações existentes nas habilidades
  const especializacoesAtuais: Especializacao[] = Object.entries(ficha.habilidades).flatMap(
    ([id, h]) => h.especializacoes.map((esp) => ({ habilidade: id as Habilidade, especializacao: esp })),
  )

  const valoresHabilidades = Object.fromEntries(
    Object.entries(ficha.habilidades).map(([id, h]) => [id, h.valor]),
  ) as Record<Habilidade, number>

  const validacao = validarHabilidadesCriacao(perfil, valoresHabilidades, especializacoesAtuais)

  function alterarHabilidade(id: Habilidade, valor: number) {
    const atual = ficha.habilidades[id]
    mudar({
      habilidades: {
        ...ficha.habilidades,
        [id]: {
          ...atual,
          valor,
          especializacoes: valor > 0 ? atual.especializacoes : [],
        },
      },
    })
  }

  function alterarEspecializacao(id: Habilidade, texto: string) {
    const lista = texto
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
    mudar({
      habilidades: {
        ...ficha.habilidades,
        [id]: {
          ...ficha.habilidades[id],
          especializacoes: lista,
        },
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Seletor de Perfil de Habilidades */}
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
        <span className="text-sm font-semibold">Perfil de Habilidades</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PERFIS.map((p) => {
            const ativo = perfil === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onMudarPerfil(p.id)}
                className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors ${
                  ativo ? 'border-vinho bg-vinho/10' : 'bg-background hover:bg-muted/40'
                }`}
              >
                <span className={`text-sm font-semibold ${ativo ? 'text-vinho' : 'text-foreground'}`}>
                  {p.titulo}
                </span>
                <span className="text-xs text-muted-foreground">{p.descricao}</span>
              </button>
            )
          })}
        </div>

        {/* Contadores de slots */}
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(validacao.slots)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([nivelStr, slot]) => {
              const nivel = Number(nivelStr)
              if (slot.esperado === 0 && slot.atual === 0) return null
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

      {/* Lista de habilidades agrupadas */}
      {GRUPOS.map((g) => (
        <section key={g.id} className="flex flex-col gap-2">
          <h4 className="text-base font-semibold">{g.habilidades}</h4>
          <ul className="flex flex-col divide-y rounded-lg border">
            {habilidadesDoGrupo(g.id).map((h) => {
              const habilidade = ficha.habilidades[h.id]
              return (
                <li key={h.id} className="flex flex-col gap-2 p-3 sm:px-4">
                  <div className="flex min-h-11 items-center gap-4">
                    <TermoRegra tipo="habilidade" id={h.id} className="min-w-0 flex-1">
                      {h.nome}
                    </TermoRegra>
                    <div className="shrink-0">
                      <SeletorPontos
                        rotulo={h.nome}
                        valor={habilidade.valor}
                        min={0}
                        max={regrasCriacao ? 4 : 5}
                        onChange={(valor) => alterarHabilidade(h.id, valor)}
                      />
                    </div>
                  </div>
                  {habilidade.valor > 0 && (
                    <div className="flex flex-col gap-1 pt-1">
                      <Label htmlFor={`esp-${h.id}`} className="text-xs text-muted-foreground">
                        Especialização (separadas por vírgula):
                      </Label>
                      <Input
                        id={`esp-${h.id}`}
                        placeholder="Ex.: Armadilhas, Perseguição..."
                        value={habilidade.especializacoes.join(', ')}
                        onChange={(e) => alterarEspecializacao(h.id, e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
