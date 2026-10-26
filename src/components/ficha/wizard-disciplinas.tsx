import { AlertCircle, Info } from 'lucide-react'
import { Combobox } from '#/components/combobox'
import { TermoRegra } from '#/components/consulta-regra'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { PODERES, itemCatalogo } from '#/domain/catalogo'
import {
  DISCIPLINAS_DO_CLA,
  validarDisciplinasCriacao,
  type DisciplinaCriacao,
} from '#/domain/criacao'
import type { Disciplina, Ficha } from '#/domain/ficha'
import { nomeCla, nomeDisciplina } from './tracos'

export function CamposDisciplinasCriacao({
  ficha,
  mudar,
  regrasCriacao = false,
  onIrParaEtapa,
}: {
  ficha: Ficha
  mudar: (parcial: Partial<Ficha>) => void
  regrasCriacao?: boolean
  onIrParaEtapa?: (etapa: number) => void
}) {
  const cla = ficha.cla

  // Se o Clã não foi selecionado, não exibe as disciplinas e avisa o usuário (lógica inversa)
  if (!cla) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center sm:p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-vinho/10 text-vinho">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="flex max-w-md flex-col gap-1.5">
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Nenhum Clã Selecionado
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            As Disciplinas e Poderes iniciais dependem do Clã do seu personagem.
            Volte para a etapa <strong className="text-foreground">Identidade</strong> e selecione um Clã para desbloquear as opções.
          </p>
        </div>
        {onIrParaEtapa && (
          <Button
            type="button"
            variant="outline"
            className="border-vinho/40 text-vinho hover:bg-vinho/10 cursor-pointer"
            onClick={() => onIrParaEtapa(1)}
          >
            Ir para Identidade
          </Button>
        )}
      </div>
    )
  }

  // Sangue-Ralo não possui Disciplinas de Clã convencionais na criação (V5 p. 140)
  if (cla === 'sangue-ralo') {
    return (
      <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs uppercase tracking-wider">
            Sangue-Ralo (Thin-Blood)
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Sem Disciplinas de Clã na Criação
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vampiros Sangue-Ralo (14ª, 15ª ou 16ª Geração) possuem sangue muito fraco para manifestar Disciplinas vampíricas convencionais no momento do Abraço.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seus poderes sobrenaturais vêm da <strong>Alquimia de Sangue-Ralo</strong> ou de <strong>Méritos de Sangue-Ralo</strong> específicos (como <em>Afinidade com Disciplina</em>), configurados na etapa de Vantagens e Defeitos.
          </p>
        </div>
      </div>
    )
  }

  const ehCaitiff = cla === 'caitiff'
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

  // Disciplinas alocadas permitidas
  const discNivel2 = ficha.disciplinas.find((d) => d.nivel === 2 && disciplinasPermitidas.includes(d.disciplina))
  const discNivel1 = ficha.disciplinas.find((d) => d.nivel === 1 && disciplinasPermitidas.includes(d.disciplina))
  const totalPoderes = ficha.poderes.filter((pid) => {
    const p = itemCatalogo(pid)
    return p?.tipo === 'poder' && ficha.disciplinas.some((d) => d.disciplina === p.disciplina && disciplinasPermitidas.includes(d.disciplina))
  }).length

  // Disciplinas fora do clã (se o usuário trocou de clã após já ter alocado pontos)
  const disciplinasForaDoCla = ficha.disciplinas.filter(
    (d) => d.nivel > 0 && !disciplinasPermitidas.includes(d.disciplina),
  )

  function limparDisciplinasIncompativeis() {
    const filtradas = ficha.disciplinas.filter((d) => disciplinasPermitidas.includes(d.disciplina))
    const poderesFiltrados = ficha.poderes.filter((pid) => {
      const p = itemCatalogo(pid)
      return p?.tipo === 'poder' && disciplinasPermitidas.includes(p.disciplina as Disciplina)
    })
    mudar({ disciplinas: filtradas, poderes: poderesFiltrados })
  }

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
      {disciplinasForaDoCla.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-vinho/45 bg-vinho/15 p-3 text-xs text-foreground">
          <span>
            Você possui pontos alocados em disciplinas que não pertencem ao Clã atual (
            {disciplinasForaDoCla.map((d) => nomeDisciplina(d.disciplina)).join(', ')}).
          </span>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="shrink-0 cursor-pointer text-xs"
            onClick={limparDisciplinasIncompativeis}
          >
            Limpar Incompatíveis
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">
            {ehCaitiff ? 'Disciplinas na Criação (Caitiff / Sem Clã)' : `Disciplinas de Clã (${nomeCla(ficha)})`}
          </span>
          <span className="text-xs text-muted-foreground font-medium">Orçamento 2/1 de Clã</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {ehCaitiff
            ? 'Como Caitiff (Sem Clã), você pode escolher quaisquer duas Disciplinas do Catálogo: aloque exatamente 2 pontos em uma e 1 ponto em outra.'
            : 'Aloque exatamente 2 pontos em uma Disciplina de Clã e 1 ponto em outra. Para cada ponto de disciplina alocado, selecione um poder.'}
        </p>

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
                          <div className="flex items-center gap-2">
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
                              className="min-w-0 flex-1"
                            />
                            {itemCatalogo(poderAtual)?.tipo === 'poder' && (
                              <TermoRegra
                                tipo="catalogo"
                                id={poderAtual}
                                icone
                                className="shrink-0 text-muted-foreground"
                              >
                                <Info className="size-4" />
                              </TermoRegra>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
    </div>
  )
}
