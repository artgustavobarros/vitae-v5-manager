import { cn } from 'cn'
import { useEffect, useState, type ReactNode } from 'react'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'

import { ListaTracos } from './atributos'
import { CamposVantagensPersonagem, ListaVantagens } from './catalogo'
import {
  CamposIdentidade,
  Secao,
  useEdicaoFicha,
  type EdicaoFicha,
  type ValoresFormulario,
} from './formulario'
import {
  aplicarPredador,
  validarAtributosCriacao,
  validarConviccoes,
  validarDisciplinasCriacao,
  validarHabilidadesCriacao,
  validarVantagensDefeitosCriacao,
  type DisciplinaCriacao,
  type EscolhasPredador,
  type Especializacao,
  type PerfilHabilidade,
} from '#/domain/criacao'
import { itemCatalogo, tipoPredador } from '#/domain/catalogo'
import type { OpcoesCriacaoCronica } from '#/domain/cronica'
import type { Ficha, Habilidade } from '#/domain/ficha'
import { gruposAtributos, gruposHabilidades, ListaDisciplinas, nomeCla, nomeDisciplina, nomeSeita, rotuloGeracao } from './tracos'

import { CamposAtributosCriacao } from './wizard-atributos'
import { CamposHabilidadesCriacao } from './wizard-habilidades'
import { CamposDisciplinasCriacao } from './wizard-disciplinas'
import { CamposTipoPredadorCriacao } from './wizard-predador'
import { CamposConviccoesCriacao } from './wizard-conviccoes'
import { VisualizadorMarkdown } from '#/components/ui/editor-rich-text'

export const ETAPAS = [
  'Identidade',
  'Atributos',
  'Habilidades',
  'Disciplinas',
  'Tipo de Predador',
  'Vantagens e Defeitos',
  'Convicções e Pilares',
  'Revisão',
] as const

/**
 * Criação guiada do Rascunho em 8 etapas (V5).
 * Para o Jogador (`regrasCriacao = true`), valida travas de Atributos, Habilidades, Disciplinas 2/1,
 * Predador, 7/2 Vantagens e Defeitos e Convicções.
 * Para o Narrador (`regrasCriacao = false`), exibe avisos informativos sem bloquear avanço.
 */
export function WizardCriacao({
  inicial,
  etapa,
  salvando,
  onIrPara,
  onSalvar,
  onConcluir,
  concluirBloqueado = false,
  extraRevisao,
  regrasCriacao,
  opcoesCronica,
}: {
  inicial: ValoresFormulario
  /** De 1 a ETAPAS.length. */
  etapa: number
  salvando: boolean
  onIrPara: (etapa: number) => void
  /** Devolve false quando o salvamento falhou e o wizard deve ficar onde está. */
  onSalvar: (valores: ValoresFormulario) => Promise<boolean>
  onConcluir: (valores: ValoresFormulario) => void
  /** Ex.: Rascunho atribuído a um Jogador, que não pode ser concluído. */
  concluirBloqueado?: boolean
  /** Conteúdo a mais no fim da Revisão, como "Atribuir a um Jogador" para o Narrador. */
  extraRevisao?: ReactNode
  /** Regras estritas do V5 na criação; vale para o Jogador, bypass para o Narrador. */
  regrasCriacao: boolean
  opcoesCronica?: OpcoesCriacaoCronica
}) {
  const edicao = useEdicaoFicha(inicial)
  const [perfilHabilidade, setPerfilHabilidade] = useState<PerfilHabilidade>('equilibrado')
  const [escolhasPredador, setEscolhasPredador] = useState<EscolhasPredador | null>(null)

  const titulo = ETAPAS[etapa - 1]
  const revisao = etapa === ETAPAS.length
  const semNome = edicao.nome.trim() === ''

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [etapa])

  // Validações por etapa
  function podeAvancarEtapa(etapaAtual: number): boolean {
    if (!regrasCriacao) return true

    const ficha = edicao.ficha
    switch (etapaAtual) {
      case 1:
        return edicao.nome.trim() !== '' && ficha.cla !== null
      case 2:
        return validarAtributosCriacao(ficha.atributos).valido
      case 3: {
        const especializacoes: Especializacao[] = Object.entries(ficha.habilidades).flatMap(([id, h]) =>
          h.especializacoes.map((esp) => ({ habilidade: id as Habilidade, especializacao: esp })),
        )
        const valoresHab = Object.fromEntries(
          Object.entries(ficha.habilidades).map(([id, h]) => [id, h.valor]),
        ) as Record<Habilidade, number>
        return validarHabilidadesCriacao(perfilHabilidade, valoresHab, especializacoes).valido
      }
      case 4: {
        if (!ficha.cla) return false
        const disciplinasCriacao: DisciplinaCriacao[] = ficha.disciplinas.map((d) => ({
          id: d.disciplina,
          nivel: d.nivel,
          poderes: ficha.poderes.filter((pid) => {
            const p = itemCatalogo(pid)
            return p?.tipo === 'poder' && p.disciplina === d.disciplina
          }),
        }))
        return validarDisciplinasCriacao(ficha.cla, disciplinasCriacao).valido
      }
      case 5:
        if (ficha.cla === 'sangue-ralo') return true
        return (
          ficha.tipoPredador !== null &&
          escolhasPredador !== null &&
          Boolean(escolhasPredador.poder)
        )
      case 6: {
        if (!ficha.cla) return false
        const pred = ficha.tipoPredador ? tipoPredador(ficha.tipoPredador) : null
        const vantagensFormatadas = ficha.vantagens.map((v) => ({ id: v.id, nivel: v.nivel }))
        return validarVantagensDefeitosCriacao(ficha.cla, vantagensFormatadas, pred).valido
      }
      case 7:
        return validarConviccoes(ficha.conviccoes).valido
      default:
        return true
    }
  }

  const bloqueadoAvanco = !podeAvancarEtapa(etapa)

  async function irPara(destino: number) {
    if (await onSalvar(edicao.valores())) onIrPara(destino)
  }

  function handleConcluir() {
    const valoresAtuais = edicao.valores()
    let fichaFinal: Ficha = valoresAtuais.ficha

    // Se houver predador selecionado e escolhas resolvidas, consolida na ficha
    if (fichaFinal.tipoPredador && escolhasPredador) {
      const pred = tipoPredador(fichaFinal.tipoPredador)
      if (pred) {
        fichaFinal = aplicarPredador(fichaFinal, pred, escolhasPredador)
      }
    }

    onConcluir({
      nome: valoresAtuais.nome,
      ficha: fichaFinal,
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <Progresso etapa={etapa} />

      <Secao titulo={titulo}>
        {etapa === 1 && (
          <CamposIdentidade
            edicao={edicao}
            regrasCriacao={regrasCriacao}
            opcoesCronica={opcoesCronica}
          />
        )}
        {etapa === 2 && (
          <CamposAtributosCriacao
            ficha={edicao.ficha}
            mudar={edicao.mudar}
            regrasCriacao={regrasCriacao}
          />
        )}
        {etapa === 3 && (
          <CamposHabilidadesCriacao
            ficha={edicao.ficha}
            mudar={edicao.mudar}
            perfil={perfilHabilidade}
            onMudarPerfil={setPerfilHabilidade}
            regrasCriacao={regrasCriacao}
          />
        )}
        {etapa === 4 && (
          <CamposDisciplinasCriacao
            ficha={edicao.ficha}
            mudar={edicao.mudar}
            regrasCriacao={regrasCriacao}
            onIrParaEtapa={irPara}
          />
        )}
        {etapa === 5 && (
          <CamposTipoPredadorCriacao
            ficha={edicao.ficha}
            escolhas={escolhasPredador}
            onMudarPredador={(predadorId) => edicao.mudar({ tipoPredador: predadorId })}
            onMudarEscolhas={setEscolhasPredador}
          />
        )}
        {etapa === 6 && (
          <CamposVantagensPersonagem
            ficha={edicao.ficha}
            regras={regrasCriacao}
            mudar={edicao.mudar}
          />
        )}
        {etapa === 7 && (
          <CamposConviccoesCriacao
            ficha={edicao.ficha}
            mudar={edicao.mudar}
            regrasCriacao={regrasCriacao}
          />
        )}
        {revisao && (
          <Revisao
            edicao={edicao}
            perfilHabilidade={perfilHabilidade}
            escolhasPredador={escolhasPredador}
            onAlterar={irPara}
          />
        )}
        {revisao && extraRevisao}
      </Secao>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-4 border-t bg-background px-4 py-4 min-[1472px]:mx-0 min-[1472px]:px-0">
        {revisao && (
          <p className="text-sm text-muted-foreground">
            Ao concluir, o Personagem fica Ativo e a Ficha é bloqueada: você passa a marcar só dano, Fome e
            Manchas.
          </p>
        )}
        <div className="flex justify-between gap-2">
          <Button
            variant="secondary"
            disabled={salvando}
            className={cn(etapa === 1 && 'invisible')}
            onClick={() => irPara(etapa - 1)}
          >
            Voltar
          </Button>
          {revisao ? (
            <Button
              disabled={salvando || semNome || concluirBloqueado}
              onClick={handleConcluir}
            >
              Concluir Criação
            </Button>
          ) : (
            <Button disabled={salvando || bloqueadoAvanco} onClick={() => irPara(etapa + 1)}>
              Próximo
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Progresso({ etapa }: { etapa: number }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Etapa {etapa} de {ETAPAS.length}
      </p>
      <div aria-hidden className="mt-2 flex gap-1">
        {ETAPAS.map((nome, i) => (
          <span key={nome} className={cn('h-1 flex-1 rounded-full', i < etapa ? 'bg-vinho' : 'bg-marcador')} />
        ))}
      </div>
    </div>
  )
}

function Revisao({
  edicao,
  perfilHabilidade,
  escolhasPredador,
  onAlterar,
}: {
  edicao: EdicaoFicha
  perfilHabilidade: PerfilHabilidade
  escolhasPredador: EscolhasPredador | null
  onAlterar: (etapa: number) => void
}) {
  const { valores } = edicao
  const { nome, ficha } = valores()
  const habilidades = gruposHabilidades(ficha, { soComPontos: true })
  const predador = ficha.tipoPredador ? tipoPredador(ficha.tipoPredador) : null

  return (
    <div className="flex flex-col gap-8">
      {nome === '' && (
        <Alert className="border-vinho/45 bg-vinho/15">
          <AlertDescription className="text-foreground">
            Dê um nome ao Personagem para concluir.
          </AlertDescription>
        </Alert>
      )}

      <BlocoRevisao titulo="Identidade" etapa={1} onAlterar={onAlterar}>
        <Dado rotulo="Nome" valor={nome} />
        <Dado rotulo="Conceito" valor={ficha.conceito || '—'} />
        <Dado rotulo="Clã" valor={nomeCla(ficha)} />
        <Dado rotulo="Geração" valor={ficha.geracao === null ? '' : rotuloGeracao(ficha.geracao)} />
        <Dado rotulo="Seita" valor={nomeSeita(ficha)} />
        <Dado rotulo="Senhor" valor={ficha.senhor} />
      </BlocoRevisao>

      <BlocoRevisao titulo="Atributos" etapa={2} onAlterar={onAlterar}>
        <div className="mb-2">
          <Badge variant="outline" className="text-xs">
            Distribuição V5: 1×(4), 3×(3), 4×(2), 1×(1)
          </Badge>
        </div>
        <ListaTracos grupos={gruposAtributos(ficha)} />
      </BlocoRevisao>

      <BlocoRevisao titulo="Habilidades" etapa={3} onAlterar={onAlterar}>
        <div className="mb-2">
          <Badge variant="outline" className="text-xs capitalize">
            Perfil: {perfilHabilidade}
          </Badge>
        </div>
        {habilidades.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma Habilidade com pontos.</p>
        ) : (
          <ListaTracos grupos={habilidades} />
        )}
      </BlocoRevisao>

      <BlocoRevisao titulo="Disciplinas" etapa={4} onAlterar={onAlterar}>
        {ficha.cla === 'sangue-ralo' ? (
          <p className="text-sm text-muted-foreground pt-1">
            Sangue-Ralo não possui Disciplinas de Clã na criação.
          </p>
        ) : (
          <ListaDisciplinas ficha={ficha} />
        )}
      </BlocoRevisao>

      <BlocoRevisao titulo="Tipo de Predador" etapa={5} onAlterar={onAlterar}>
        {ficha.cla === 'sangue-ralo' ? (
          <p className="text-sm text-muted-foreground pt-1">
            Não aplicável a Sangue-Ralo (V5 Livro Básico p. 140).
          </p>
        ) : predador ? (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{predador.nome}</span>
            </div>
            {escolhasPredador && (
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span>• +1 em Disciplina: {nomeDisciplina(escolhasPredador.disciplina)}</span>
                {escolhasPredador.poder && (
                  <span>
                    • Poder Ganho: {itemCatalogo(escolhasPredador.poder)?.nome ?? escolhasPredador.poder}
                  </span>
                )}
                <span>
                  • Especialização: {escolhasPredador.especializacao.habilidade} (
                  {escolhasPredador.especializacao.especializacao})
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum Tipo de Predador selecionado.</p>
        )}
      </BlocoRevisao>

      <BlocoRevisao titulo="Vantagens e Defeitos" etapa={6} onAlterar={onAlterar}>
        <div className="mt-2 flex flex-col gap-4">
          <ListaVantagens titulo="Vantagens" escolhidas={ficha.vantagens} />
          <ListaVantagens titulo="Defeitos" escolhidas={ficha.defeitos} />
        </div>
      </BlocoRevisao>

      <BlocoRevisao titulo="Convicções e Pilares" etapa={7} onAlterar={onAlterar}>
        <div className="flex flex-col gap-3 pt-2">
          {ficha.conviccoes && ficha.conviccoes.length > 0 ? (
            ficha.conviccoes.map((c, i) => (
              <div key={i} className="flex flex-col border-b pb-2 text-sm">
                <span className="font-medium text-foreground">Convicção: "{c.conviccao}"</span>
                <span className="text-xs text-muted-foreground">
                  Pedra de Toque: {c.pedraDeToque?.trim() ? c.pedraDeToque : '(Não informada)'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma Convicção definida.</p>
          )}
          <Dado rotulo="Ambição" valor={ficha.ambicao} />
          <Dado rotulo="Desejo" valor={ficha.desejo} />
          {ficha.aparencia && <Dado rotulo="Aparência" valor={ficha.aparencia} />}
          {ficha.historia && (
            <div className="flex flex-col gap-1 border-b pb-2">
              <span className="text-sm text-muted-foreground">História:</span>
              <VisualizadorMarkdown markdown={ficha.historia} />
            </div>
          )}
        </div>
      </BlocoRevisao>
    </div>
  )
}

function BlocoRevisao({
  titulo,
  etapa,
  onAlterar,
  children,
}: {
  titulo: string
  etapa: number
  onAlterar: (etapa: number) => void
  children: ReactNode
}) {
  return (
    <section>
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-base font-semibold">{titulo}</h3>
        <Button variant="ghost" size="sm" className="-mr-3" onClick={() => onAlterar(etapa)}>
          Alterar
        </Button>
      </div>
      {children}
    </section>
  )
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 border-b text-base">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="truncate text-right">{valor || '—'}</span>
    </div>
  )
}
