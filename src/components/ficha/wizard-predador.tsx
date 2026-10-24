import { useEffect } from 'react'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Combobox } from '#/components/combobox'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { PODERES, TIPOS_PREDADOR, tipoPredador } from '#/domain/catalogo'
import type { EscolhasPredador } from '#/domain/criacao'
import type { Disciplina, Ficha, Habilidade } from '#/domain/ficha'
import { nomeDisciplina, nomeHabilidade } from './tracos'

export function CamposTipoPredadorCriacao({
  ficha,
  escolhas,
  onMudarPredador,
  onMudarEscolhas,
}: {
  ficha: Ficha
  escolhas: EscolhasPredador | null
  onMudarPredador: (predadorId: string | null) => void
  onMudarEscolhas: (novasEscolhas: EscolhasPredador) => void
}) {
  const predadorAtual = ficha.tipoPredador ? tipoPredador(ficha.tipoPredador) : null

  function obterPoderInicial(discId: Disciplina): string | undefined {
    const nivelAtual = ficha.disciplinas.find((d) => d.disciplina === discId)?.nivel ?? 0
    const novoNivel = nivelAtual + 1
    const opcoes = PODERES.filter(
      (p) => p.disciplina === discId && p.nivel <= novoNivel && !ficha.poderes.includes(p.id),
    )
    return opcoes[0]?.id
  }

  // Garante que haja um poder selecionado se já houver disciplina escolhida
  useEffect(() => {
    if (escolhas && escolhas.disciplina && !escolhas.poder) {
      const poderInicial = obterPoderInicial(escolhas.disciplina)
      if (poderInicial) {
        onMudarEscolhas({ ...escolhas, poder: poderInicial })
      }
    }
  }, [escolhas?.disciplina, escolhas?.poder])

  function selecionarPredador(id: string | null) {
    onMudarPredador(id)
    if (!id) return
    const p = tipoPredador(id)
    if (!p) return

    // Inicializar escolhas padrão
    const primeiraDisc = p.opcoesDisciplina[0]
    const primeiraEsp = p.opcoesEspecializacao[0]
    onMudarEscolhas({
      disciplina: primeiraDisc,
      poder: obterPoderInicial(primeiraDisc),
      especializacao: {
        habilidade: primeiraEsp.habilidade,
        especializacao: primeiraEsp.sugestoes[0] ?? '',
      },
      tracoEscolhido: p.escolhasTracos?.[0]?.opcoes[0]
        ? {
            id: p.escolhasTracos[0].opcoes[0].id,
            nivel: p.escolhasTracos[0].opcoes[0].nivel,
            tipo: p.escolhasTracos[0].opcoes[0].tipo,
            nota: p.escolhasTracos[0].opcoes[0].nota,
          }
        : undefined,
    })
  }

  function alterarDisciplina(disc: Disciplina) {
    if (!escolhas) return
    onMudarEscolhas({
      ...escolhas,
      disciplina: disc,
      poder: obterPoderInicial(disc),
    })
  }

  function alterarHabilidadeEspecializacao(hab: Habilidade) {
    if (!escolhas || !predadorAtual) return
    const opt = predadorAtual.opcoesEspecializacao.find((o) => o.habilidade === hab)
    onMudarEscolhas({
      ...escolhas,
      especializacao: {
        habilidade: hab,
        especializacao: opt?.sugestoes[0] ?? '',
      },
    })
  }

  function alterarTextoEspecializacao(texto: string) {
    if (!escolhas) return
    onMudarEscolhas({
      ...escolhas,
      especializacao: {
        ...escolhas.especializacao,
        especializacao: texto,
      },
    })
  }

  if (!ficha.cla) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center sm:p-12">
        <div className="flex max-w-md flex-col gap-1.5">
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Clã Não Selecionado
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Volte para a etapa <strong className="text-foreground">Identidade</strong> e selecione o Clã do personagem antes de configurar o Tipo de Predador.
          </p>
        </div>
      </div>
    )
  }

  if (ficha.cla === 'sangue-ralo') {
    return (
      <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs uppercase tracking-wider">
            Sangue-Ralo (Thin-Blood)
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Sem Tipo de Predador na Criação
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vampiros Sangue-Ralo não selecionam Tipo de Predador na criação de personagem (conforme o Livro Básico de V5, p. 140). A caça deles é instintiva e improvisada entre os mortais.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Você pode avançar diretamente para a etapa de <strong>Vantagens e Defeitos</strong>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="seletor-predador" className="text-base font-semibold">
          Tipo de Predador
        </Label>
        <p className="text-xs text-muted-foreground">
          O método habitual de caça do vampiro, concedendo disciplina, especialização e traços.
        </p>
        <Combobox
          id="seletor-predador"
          opcoes={TIPOS_PREDADOR.map((p) => ({
            valor: p.id,
            rotulo: p.nome,
            original: p.nomeOriginal,
            descricao: p.descricao,
          }))}
          valor={ficha.tipoPredador ?? ''}
          onChange={(v) => selecionarPredador(v || null)}
          placeholder="Selecione um Tipo de Predador..."
          busca="Buscar predador"
        />
      </div>

      {predadorAtual && escolhas && (
        <Card className="border-border/60 bg-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base text-foreground">{predadorAtual.nome}</CardTitle>
            <CardDescription className="text-xs">{predadorAtual.descricao}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            {/* Disciplina extra (+1 ponto) e Poder Adicional */}
            <div className="flex flex-col gap-3 rounded-md border bg-background p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-vinho uppercase tracking-wider">
                  +1 Ponto em Disciplina (escolha 1)
                </span>
                <p className="text-xs text-muted-foreground">
                  Ganhe +1 ponto na Disciplina e escolha um poder adicional desse nível ou inferior.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {predadorAtual.opcoesDisciplina.map((discId) => {
                  const ativo = escolhas.disciplina === discId
                  const nivelAtual = ficha.disciplinas.find((d) => d.disciplina === discId)?.nivel ?? 0
                  const novoNivel = nivelAtual + 1
                  return (
                    <button
                      key={discId}
                      type="button"
                      onClick={() => alterarDisciplina(discId)}
                      className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                        ativo ? 'border-vinho bg-vinho text-white' : 'bg-background hover:bg-muted'
                      }`}
                    >
                      {nomeDisciplina(discId)} ({nivelAtual} → {novoNivel})
                    </button>
                  )
                })}
              </div>

              {/* Seletor do novo poder para a disciplina escolhida */}
              {escolhas.disciplina && (
                <div className="flex flex-col gap-1.5 border-t pt-3">
                  {(() => {
                    const nivelAtual =
                      ficha.disciplinas.find((d) => d.disciplina === escolhas.disciplina)?.nivel ?? 0
                    const novoNivel = nivelAtual + 1
                    const opcoesPoder = PODERES.filter(
                      (p) =>
                        p.disciplina === escolhas.disciplina &&
                        p.nivel <= novoNivel &&
                        (!ficha.poderes.includes(p.id) || p.id === escolhas.poder),
                    )

                    return (
                      <>
                        <Label htmlFor="poder-predador" className="text-xs text-muted-foreground font-medium">
                          Poder de {nomeDisciplina(escolhas.disciplina)} (Nível {novoNivel} ou inferior):
                        </Label>
                        <Combobox
                          id="poder-predador"
                          opcoes={opcoesPoder.map((p) => ({
                            valor: p.id,
                            rotulo: `${p.nome} (Nível ${p.nivel})`,
                            original: p.nomeOriginal,
                            descricao: p.descricao,
                          }))}
                          valor={escolhas.poder ?? null}
                          onChange={(pId) => onMudarEscolhas({ ...escolhas, poder: pId })}
                          placeholder="Selecionar poder..."
                          busca="Buscar poder"
                        />
                      </>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Especialização de Habilidade */}
            <div className="flex flex-col gap-2 rounded-md border bg-background p-3">
              <span className="text-xs font-semibold text-vinho uppercase tracking-wider">
                Especialização do Predador
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {predadorAtual.opcoesEspecializacao.map((opt) => {
                    const ativo = escolhas.especializacao.habilidade === opt.habilidade
                    return (
                      <button
                        key={opt.habilidade}
                        type="button"
                        onClick={() => alterarHabilidadeEspecializacao(opt.habilidade)}
                        className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                          ativo ? 'border-vinho bg-vinho text-white' : 'bg-background hover:bg-muted'
                        }`}
                      >
                        {nomeHabilidade(opt.habilidade)}
                      </button>
                    )
                  })}
                </div>

                <div className="flex flex-col gap-1 pt-1">
                  <Label className="text-xs text-muted-foreground">
                    Especialização em {nomeHabilidade(escolhas.especializacao.habilidade)}:
                  </Label>
                  <Input
                    value={escolhas.especializacao.especializacao}
                    onChange={(e) => alterarTextoEspecializacao(e.target.value)}
                    placeholder="Especialização..."
                    className="text-xs"
                  />
                  {/* Sugestões rápidas */}
                  {predadorAtual.opcoesEspecializacao
                    .find((o) => o.habilidade === escolhas.especializacao.habilidade)
                    ?.sugestoes.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => alterarTextoEspecializacao(sug)}
                        className="text-left text-xs text-muted-foreground underline hover:text-foreground"
                      >
                        Sugestão: {sug}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Traços alternativos se houver */}
            {predadorAtual.escolhasTracos && predadorAtual.escolhasTracos.length > 0 && (
              <div className="flex flex-col gap-2 rounded-md border bg-background p-3">
                {predadorAtual.escolhasTracos.map((esc, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-vinho uppercase tracking-wider">
                      {esc.rotulo}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {esc.opcoes.map((opt) => {
                        const ativo = escolhas.tracoEscolhido?.id === opt.id
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              onMudarEscolhas({
                                ...escolhas,
                                tracoEscolhido: {
                                  id: opt.id,
                                  nivel: opt.nivel,
                                  tipo: opt.tipo,
                                  nota: opt.nota,
                                },
                              })
                            }
                            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                              ativo ? 'border-vinho bg-vinho text-white' : 'bg-background hover:bg-muted'
                            }`}
                          >
                            {opt.nome} ({opt.nivel}) {opt.nota ? `· ${opt.nota}` : ''}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bônus automáticos */}
            <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t pt-2">
              <span className="font-semibold text-foreground">Bônus automáticos aplicados na conclusão:</span>
              {predadorAtual.modificadorHumanidade && (
                <span>• Humanidade: {predadorAtual.modificadorHumanidade > 0 ? '+1' : '-1'}</span>
              )}
              {predadorAtual.modificadorPotenciaSangue && (
                <span>• Potência do Sangue: +{predadorAtual.modificadorPotenciaSangue}</span>
              )}
              {predadorAtual.vantagens.map((v) => (
                <span key={v.id}>
                  • Vantagem: {v.nome} ({v.nivel}) {v.nota ? `- ${v.nota}` : ''}
                </span>
              ))}
              {predadorAtual.defeitos.map((d) => (
                <span key={d.id}>
                  • Defeito: {d.nome} ({d.nivel}) {d.nota ? `- ${d.nota}` : ''}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
