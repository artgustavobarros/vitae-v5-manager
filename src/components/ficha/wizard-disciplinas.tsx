import { Combobox } from '#/components/combobox'
import { TermoRegra } from '#/components/consulta-regra'
import { Label } from '#/components/ui/label'
import { PODERES, itemCatalogo } from '#/domain/catalogo'
import {
  DISCIPLINAS_DO_CLA,
  validarDisciplinasCriacao,
  type DisciplinaCriacao,
} from '#/domain/criacao'
import type { Disciplina, Ficha } from '#/domain/ficha'
import { nomeDisciplina } from './tracos'

export function CamposDisciplinasCriacao({
  ficha,
  mudar,
  regrasCriacao = false,
}: {
  ficha: Ficha
  mudar: (parcial: Partial<Ficha>) => void
  regrasCriacao?: boolean
}) {
  const cla = ficha.cla ?? 'caitiff'
  const ehSangueRalo = cla === 'sangue-ralo'
  const disciplinasPermitidas = DISCIPLINAS_DO_CLA[cla] ?? []

  // Adaptar ficha.disciplinas para o formato de validação
  const disciplinasCriacao: DisciplinaCriacao[] = ficha.disciplinas.map((d) => ({
    id: d.disciplina,
    nivel: d.nivel,
    poderes: ficha.poderes.filter((pid) => {
      const p = itemCatalogo(pid)
      return p?.tipo === 'poder' && p.disciplina === d.disciplina
    }),
  }))

  const validacao = validarDisciplinasCriacao(cla, disciplinasCriacao)

  function alterarPontosDisciplina(disciplinaId: Disciplina, novoNivel: number) {
    let novasDisciplinas = [...ficha.disciplinas]
    const index = novasDisciplinas.findIndex((d) => d.disciplina === disciplinaId)

    if (novoNivel <= 0) {
      if (index !== -1) novasDisciplinas.splice(index, 1)
    } else {
      if (index !== -1) {
        novasDisciplinas[index] = { disciplina: disciplinaId, nivel: novoNivel }
      } else {
        novasDisciplinas.push({ disciplina: disciplinaId, nivel: novoNivel })
      }
    }

    mudar({ disciplinas: novasDisciplinas })
  }

  function escolherPoder(disciplinaId: Disciplina, slotIndex: number, poderId: string) {
    const poderesDaDisc = ficha.poderes.filter((pid) => {
      const p = itemCatalogo(pid)
      return p?.tipo === 'poder' && p.disciplina === disciplinaId
    })
    const outrosPoderes = ficha.poderes.filter((pid) => {
      const p = itemCatalogo(pid)
      return p?.tipo === 'poder' && p.disciplina !== disciplinaId
    })

    if (slotIndex < poderesDaDisc.length) {
      poderesDaDisc[slotIndex] = poderId
    } else {
      poderesDaDisc.push(poderId)
    }

    mudar({ poderes: [...outrosPoderes, ...poderesDaDisc] })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Disciplinas na Criação (V5)</span>
          <span className="text-xs text-muted-foreground">Regra 2/1 de Clã</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {ehSangueRalo
            ? 'Sangue-Ralo não possui Disciplinas de Clã na criação inicial.'
            : 'Aloque 2 pontos em uma Disciplina de clã e 1 ponto em outra. Para cada ponto, escolha um poder do Catálogo.'}
        </p>

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

      {!ehSangueRalo && (
        <div className="flex flex-col gap-4">
          {disciplinasPermitidas.map((discId) => {
            const discNome = nomeDisciplina(discId)
            const alocacao = ficha.disciplinas.find((d) => d.disciplina === discId)
            const nivel = alocacao?.nivel ?? 0

            // Poderes disponíveis desta disciplina até o nível alocado
            const poderesDisponiveis = PODERES.filter(
              (p) => p.disciplina === discId && p.nivel <= Math.max(1, nivel),
            )

            const poderesEscolhidos = ficha.poderes.filter((pid) => {
              const p = itemCatalogo(pid)
              return p?.tipo === 'poder' && p.disciplina === discId
            })

            return (
              <div key={discId} className="flex flex-col gap-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <TermoRegra tipo="disciplina" id={discId}>
                    {discNome}
                  </TermoRegra>
                  <div className="flex items-center gap-1">
                    {[1, 2].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => alterarPontosDisciplina(discId, nivel === n ? n - 1 : n)}
                        className={`h-8 w-8 rounded-full border text-xs font-semibold transition-colors ${
                          nivel >= n ? 'border-vinho bg-vinho text-white' : 'bg-background hover:bg-muted'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seletores de poderes obrigatórios para os pontos alocados */}
                {nivel > 0 && (
                  <div className="flex flex-col gap-2 border-t pt-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Escolha {nivel} {nivel === 1 ? 'poder' : 'poderes'}:
                    </span>
                    {Array.from({ length: nivel }, (_, slotIndex) => {
                      const poderAtual = poderesEscolhidos[slotIndex] ?? ''
                      return (
                        <div key={slotIndex} className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">Poder {slotIndex + 1}:</Label>
                          <Combobox
                            opcoes={poderesDisponiveis.map((p) => ({
                              valor: p.id,
                              rotulo: `${p.nome} (Nível ${p.nivel})`,
                              original: p.nomeOriginal,
                              descricao: p.descricao,
                            }))}
                            valor={poderAtual}
                            onChange={(pId) => escolherPoder(discId, slotIndex, pId)}
                            placeholder="Selecionar poder..."
                            busca="Buscar poder"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
