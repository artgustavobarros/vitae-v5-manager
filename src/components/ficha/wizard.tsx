import { cn } from 'cn'
import { useEffect, type ReactNode } from 'react'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'

import { ListaTracos } from './atributos'
import { CamposVantagensPersonagem, ListaVantagens } from './catalogo'
import {
  CamposAmbicaoDesejo,
  CamposAtributos,
  CamposDisciplinas,
  CamposHabilidades,
  CamposIdentidade,
  CamposSangue,
  Secao,
  useEdicaoFicha,
  type EdicaoFicha,
  type ValoresFormulario,
} from './formulario'
import { gruposAtributos, gruposHabilidades, ListaDisciplinas, nomeCla, nomeSeita, rotuloGeracao } from './tracos'

export const ETAPAS = ['Identidade', 'Atributos', 'Habilidades', 'Disciplinas', 'Sangue', 'Vantagens e Defeitos', 'Revisão'] as const

/**
 * Criação do Rascunho em etapas. Para o Jogador, valem Clã e Geração e as regras de poderes, Rituais e Vantagens.
 * Cada passo para a frente ou para trás salva o Rascunho; "Concluir" fica na Revisão.
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
  /** Regra de Clã e Geração na Identidade; vale para o Jogador, não para o Narrador. */
  regrasCriacao: boolean
}) {
  const edicao = useEdicaoFicha(inicial)
  const titulo = ETAPAS[etapa - 1]
  const revisao = etapa === ETAPAS.length
  const semNome = edicao.nome.trim() === ''

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [etapa])

  async function irPara(destino: number) {
    if (await onSalvar(edicao.valores())) onIrPara(destino)
  }

  return (
    <div className="flex flex-col gap-8">
      <Progresso etapa={etapa} />

      <Secao titulo={titulo}>
        {etapa === 1 && <CamposIdentidade edicao={edicao} regrasCriacao={regrasCriacao} />}
        {etapa === 2 && <CamposAtributos edicao={edicao} />}
        {etapa === 3 && <CamposHabilidades edicao={edicao} />}
        {etapa === 4 && <CamposDisciplinas edicao={edicao} regrasCriacao={regrasCriacao} />}
        {etapa === 5 && (
          <>
            <CamposSangue edicao={edicao} />
            <CamposAmbicaoDesejo edicao={edicao} />
          </>
        )}
        {etapa === 6 && (
          <CamposVantagensPersonagem ficha={edicao.ficha} regras={regrasCriacao} mudar={edicao.mudar} />
        )}
        {revisao && <Revisao edicao={edicao} onAlterar={irPara} />}
        {revisao && extraRevisao}
      </Secao>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-4 border-t bg-background px-4 py-4">
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
            <Button disabled={salvando || semNome || concluirBloqueado} onClick={() => onConcluir(edicao.valores())}>
              Concluir
            </Button>
          ) : (
            <Button disabled={salvando} onClick={() => irPara(etapa + 1)}>
              Próximo
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/** "Etapa 2 de 6" com uma barra por etapa, no estilo do horizonte de Humanidade. */
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

function Revisao({ edicao, onAlterar }: { edicao: EdicaoFicha; onAlterar: (etapa: number) => void }) {
  const { valores } = edicao
  const { nome, ficha } = valores()
  const habilidades = gruposHabilidades(ficha, { soComPontos: true })

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
        <Dado rotulo="Clã" valor={nomeCla(ficha)} />
        <Dado rotulo="Geração" valor={ficha.geracao === null ? '' : rotuloGeracao(ficha.geracao)} />
        <Dado rotulo="Seita" valor={nomeSeita(ficha)} />
        <Dado rotulo="Senhor" valor={ficha.senhor} />
      </BlocoRevisao>

      <BlocoRevisao titulo="Atributos" etapa={2} onAlterar={onAlterar}>
        <ListaTracos grupos={gruposAtributos(ficha)} />
      </BlocoRevisao>

      <BlocoRevisao titulo="Habilidades" etapa={3} onAlterar={onAlterar}>
        {habilidades.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma Habilidade com pontos.</p>
        ) : (
          <ListaTracos grupos={habilidades} />
        )}
      </BlocoRevisao>

      <BlocoRevisao titulo="Disciplinas" etapa={4} onAlterar={onAlterar}>
        <ListaDisciplinas ficha={ficha} />
      </BlocoRevisao>

      <BlocoRevisao titulo="Sangue" etapa={5} onAlterar={onAlterar}>
        <Dado rotulo="Potência do Sangue" valor={String(ficha.potenciaSangue)} />
        <Dado rotulo="Humanidade" valor={String(ficha.humanidade)} />
        <Dado rotulo="Ambição" valor={ficha.ambicao} />
        <Dado rotulo="Desejo" valor={ficha.desejo} />
      </BlocoRevisao>

      <BlocoRevisao titulo="Vantagens e Defeitos" etapa={6} onAlterar={onAlterar}>
        <div className="mt-2 flex flex-col gap-4">
          <ListaVantagens titulo="Vantagens" escolhidas={ficha.vantagens} />
          <ListaVantagens titulo="Defeitos" escolhidas={ficha.defeitos} />
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
