import { Combobox } from '#/components/combobox'
import { TermoRegra } from '#/components/consulta-regra'
import { Badge } from '#/components/ui/badge'
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

  // Disciplinas alocadas
  const discNivel2 = ficha.disciplinas.find((d) => d.nivel === 2)
  const discNivel1 = ficha.disciplinas.find((d) => d.nivel === 1)
  const totalPoderes = ficha.poderes.filter((pid) => {
    const p = itemCatalogo(pid)
    return p?.tipo === 'poder' && ficha.disciplinas.some((d) => d.disciplina === p.disciplina)
  }).length

  function alterarPontosDisciplina(disciplinaId: Disciplina, alvo: number) {
    let novasDisciplinas = [...ficha.disciplinas]
    const atualIndex = novasDisciplinas.findIndex((d) => d.disciplina === disciplinaId)
    const nivelAtual = atualIndex !== -1 ? novasDisciplinas[atualIndex].nivel : 0
    const novoNivel = nivelAtual === alvo ? alvo - 1 : alvo

    if (novoNivel <= 0) {
      if (atualIndex !== -1) novasDisciplinas.splice(atualIndex, 1)
    } else if (novoNivel === 2) {
      // Regra V5: Apenas UMA disciplina com nível 2
      // Se outra já tinha 2, passa para 1 (se vago) ou 0
      novasDisciplinas = novasDisciplinas.map((d) => {
        if (d.disciplina === disciplinaId) return { ...d, nivel: 2 }
        if (d.nivel === 2) return { ...d, nivel: 1 }
        return d
      })
      if (!novasDisciplinas.some((d) => d.disciplina === disciplinaId)) {
        novasDisciplinas.push({ disciplina: disciplinaId, nivel: 2 })
      }
      // Se sobrou mais de uma disciplina em nível 1, mantém a mais recente
      const outrasNivel1 = novasDisciplinas.filter((d) => d.disciplina !== disciplinaId && d.nivel === 1)
      if (outrasNivel1.length > 1) {
        const descartar = outrasNivel1[0].disciplina
        novasDisciplinas = novasDisciplinas.filter((d) => d.disciplina !== descartar)
      }
    } else if (novoNivel === 1) {
      // Regra V5: Apenas UMA disciplina com nível 1 (além da de nível 2)
      novasDisciplinas = novasDisciplinas.filter(
        (d) => d.disciplina === disciplinaId || d.nivel !== 1,
      )
      if (atualIndex !== -1) {
        novasDisciplinas = novasDisciplinas.map((d) =>
          d.disciplina === disciplinaId ? { ...d, nivel: 1 } : d,
        )
      } else {
        novasDisciplinas.push({ disciplina: disciplinaId, nivel: 1 })
      }
    }

    // Poda poderes da disciplina cujo nível caiu ou foi zerada
    const outrosPoderes = ficha.poderes.filter((pid) => {
      const p = itemCatalogo(pid)
      return p?.tipo === 'poder' && p.disciplina !== disciplinaId
    })
    const poderesDesta = ficha.poderes.filter((pid) => {
      const p = itemCatalogo(pid)
      return p?.tipo === 'poder' && p.disciplina === disciplinaId
    })
    const poderesPodados = poderesDesta.slice(0, Math.max(0, novoNivel))

    mudar({
      disciplinas: novasDisciplinas,
      poderes: [...outrosPoderes, ...poderesPodados],
    })
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
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Disciplinas na Criação (V5)</span>
          <span className="text-xs text-muted-foreground font-medium">Orçamento 2/1 de Clã</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {ehSangueRalo
            ? 'Sangue-Ralo não possui Disciplinas de Clã na criação inicial (utiliza Alquimia de Sangue-Ralo).'
            : 'Aloque exatamente 2 pontos em uma Disciplina e 1 ponto em outra. Para cada ponto de disciplina alocado, selecione um poder.'}
        </p>

        {!ehSangueRalo && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between rounded-md border bg-background/50 px-3 py-2 text-xs">
              <span className="text-muted-foreground">Disciplina em 2 Pontos:</span>
              <Badge variant={discNivel2 ? 'default' : 'outline'} className="font-mono text-xs">
                {discNivel2 ? nomeDisciplina(discNivel2.disciplina) : '0/1'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-background/50 px-3 py-2 text-xs">
              <span className="text-muted-foreground">Disciplina em 1 Ponto:</span>
              <Badge variant={discNivel1 ? 'default' : 'outline'} className="font-mono text-xs">
                {discNivel1 ? nomeDisciplina(discNivel1.disciplina) : '0/1'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-background/50 px-3 py-2 text-xs">
              <span className="text-muted-foreground">Poderes Escolhidos:</span>
              <Badge variant={totalPoderes === 3 ? 'default' : 'outline'} className="font-mono text-xs">
                {totalPoderes} / 3
              </Badge>
            </div>
          </div>
        )}

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

            const poderesEscolhidos = ficha.poderes.filter((pid) => {
              const p = itemCatalogo(pid)
              return p?.tipo === 'poder' && p.disciplina === discId
            })

            return (
              <div key={discId} className="flex flex-col gap-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <TermoRegra tipo="disciplina" id={discId}>
                    <span className="font-medium text-foreground hover:text-vinho transition-colors cursor-pointer">
                      {discNome}
                    </span>
                  </TermoRegra>
                  <div className="flex items-center gap-1.5">
                    {[1, 2].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => alterarPontosDisciplina(discId, n)}
                        aria-label={`${discNome} nível ${n}`}
                        className={`h-8 w-8 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                          nivel >= n ? 'border-vinho bg-vinho text-white' : 'bg-background hover:bg-muted'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seletores de poderes para os pontos alocados */}
                {nivel > 0 && (
                  <div className="flex flex-col gap-3 border-t pt-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      Escolha {nivel} {nivel === 1 ? 'poder' : 'poderes'}:
                    </span>
                    {Array.from({ length: nivel }, (_, slotIndex) => {
                      const poderAtual = poderesEscolhidos[slotIndex] ?? ''
                      // Poder 1 deve ser de nível 1; Poder 2 pode ser de nível 1 ou 2
                      const maxNivelPoder = slotIndex + 1
                      const opcoesPoder = PODERES.filter(
                        (p) =>
                          p.disciplina === discId &&
                          p.nivel <= maxNivelPoder &&
                          (!poderesEscolhidos.includes(p.id) || p.id === poderAtual),
                      )

                      return (
                        <div key={slotIndex} className="flex flex-col gap-1">
                          <Label className="text-xs text-muted-foreground">
                            Poder {slotIndex + 1} (Nível {slotIndex === 0 ? '1' : '1 ou 2'}):
                          </Label>
                          <Combobox
                            opcoes={opcoesPoder.map((p) => ({
                              valor: p.id,
                              rotulo: `${p.nome} (Nível ${p.nivel})`,
                              original: p.nomeOriginal,
                              descricao: p.descricao,
                            }))}
                            valor={poderAtual || null}
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
