import { Info, Plus, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Combobox, type OpcaoCombobox } from '#/components/combobox'
import { TermoRegra } from '#/components/consulta-regra'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { EditorRichText } from '#/components/ui/editor-rich-text'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { semItem, temPoderes, tipoRitualDa } from '#/domain/catalogo/escolhas'
import {
  CLAS,
  DISCIPLINAS,
  FAIXAS,
  clasPermitidos,
  escolherCla,
  escolherGeracao,
  geracoesPermitidas,
  GRUPOS,
  HABILIDADES,
  SEITAS,
  type Cla,
  type Disciplina,
  type Ficha,
  type Habilidade,
  type Seita,
} from '#/domain/ficha'

import { CardPerdicaoCompulsaoCla } from './card-cla'
import { CamposPoderes, CamposRituais, CamposVantagensPersonagem, ListaSoltos } from './catalogo'
import { SeletorPontos } from './marcadores'
import { atributosDoGrupo, habilidadesDoGrupo, nomeDisciplina, rotuloGeracao } from './tracos'

// Valor da opção "Sem Clã", "Sem Geração" e "Sem Seita" nos combobox.
const NENHUM = 'nenhum'

function opcoesDe(
  lista: readonly { id: string; nome: string; nomeOriginal?: string }[],
  semNada: string,
  incluirOriginal = false,
): OpcaoCombobox[] {
  return [
    { valor: NENHUM, rotulo: semNada },
    ...lista.map((x) => ({
      valor: x.id,
      rotulo: x.nome,
      ...(incluirOriginal && x.nomeOriginal ? { original: x.nomeOriginal } : {}),
    })),
  ]
}

const GERACOES = Array.from(
  { length: FAIXAS.geracao.max - FAIXAS.geracao.min + 1 },
  (_, i) => FAIXAS.geracao.min + i,
)

export type ValoresFormulario = { nome: string; jogadorNome?: string | null; ficha: Ficha }

/** Especializações digitadas como "Gatos, Cavalos" viram ["Gatos", "Cavalos"]. */
function lerEspecializacoes(texto: string): string[] {
  return texto
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e !== '')
}

/** Estado de edição compartilhado pelo formulário inteiro e pelo wizard de criação. */
export function useEdicaoFicha(inicial: ValoresFormulario) {
  const [nome, setNome] = useState(inicial.nome)
  const [jogadorNome, setJogadorNome] = useState(inicial.jogadorNome ?? '')
  const [ficha, setFicha] = useState(inicial.ficha)
  // Texto cru das Especializações, para a vírgula não sumir enquanto se digita.
  const [especializacoes, setEspecializacoes] = useState(
    () =>
      Object.fromEntries(
        HABILIDADES.map((h) => [h.id, inicial.ficha.habilidades[h.id].especializacoes.join(', ')]),
      ) as Record<Habilidade, string>,
  )

  function mudar(parcial: Partial<Ficha>) {
    setFicha((atual) => ({ ...atual, ...parcial }))
  }

  function valores(): ValoresFormulario {
    const habilidades = Object.fromEntries(
      HABILIDADES.map((h) => {
        const { valor } = ficha.habilidades[h.id]
        return [h.id, { valor, especializacoes: valor > 0 ? lerEspecializacoes(especializacoes[h.id]) : [] }]
      }),
    ) as Ficha['habilidades']
    return {
      nome: nome.trim(),
      jogadorNome: jogadorNome.trim() || null,
      ficha: { ...ficha, habilidades },
    }
  }

  return { nome, setNome, jogadorNome, setJogadorNome, ficha, mudar, especializacoes, setEspecializacoes, valores }
}

export type EdicaoFicha = ReturnType<typeof useEdicaoFicha>

/**
 * Formulário da Ficha inteira numa página.
 * Campos que dependem de outra escolha (Disciplinas/Vantagens sem Clã, Potência do Sangue sem Geração)
 * mostram um aviso e levam o foco até o campo necessário.
 */
export function FormularioFicha({
  inicial,
  salvando,
  podeAlterarCla = true,
  acoes,
  onSalvar,
}: {
  inicial: ValoresFormulario
  salvando: boolean
  podeAlterarCla?: boolean
  /** Ações extras do rodapé (ex.: Excluir Personagem), do lado oposto ao Salvar. */
  acoes?: ReactNode
  onSalvar: (valores: ValoresFormulario) => void
}) {
  const edicao = useEdicaoFicha(inicial)

  return (
    <form
      className="flex flex-col gap-8 pb-12"
      onSubmit={(e) => {
        e.preventDefault()
        onSalvar(edicao.valores())
      }}
    >
      <Secao titulo="Identidade">
        <CamposIdentidade edicao={edicao} podeAlterarCla={podeAlterarCla} />
        <CamposAmbicaoDesejo edicao={edicao} />
      </Secao>
      <Secao titulo="Atributos">
        <CamposAtributos edicao={edicao} />
      </Secao>
      <Secao titulo="Habilidades">
        <CamposHabilidades edicao={edicao} />
      </Secao>
      <Secao titulo="Disciplinas">
        <CamposDisciplinas edicao={edicao} />
      </Secao>
      <Secao titulo="Sangue e Humanidade">
        <CamposSangue edicao={edicao} />
      </Secao>
      <Secao titulo="Vantagens e Defeitos">
        {edicao.ficha.cla ? (
          <CamposVantagensPersonagem ficha={edicao.ficha} regras={false} mudar={edicao.mudar} />
        ) : (
          <AvisoPreRequisito
            mensagem="Escolha o Clã antes de definir Vantagens e Defeitos."
            rotuloAcao="Escolher Clã"
            campoAlvoId="cla"
          />
        )}
      </Secao>
      <Secao titulo="Convicções e História">
        <CamposConviccoesHistoria edicao={edicao} />
      </Secao>
      <div className="flex items-center justify-between gap-4 border-t pt-4">
        <Button type="submit" disabled={salvando}>
          Salvar
        </Button>
        {acoes}
      </div>
    </form>
  )
}

/**
 * Com `regrasCriacao`, Clã e Geração só oferecem o que combina: Sangue-Ralo da 14ª Geração em diante.
 * Sem ela (Narrador editando uma Ficha concluída), as listas ficam livres.
 * Com o Clã travado, a Geração só oferece opções que o preservam.
 */
export function CamposIdentidade({
  edicao,
  regrasCriacao = false,
  podeAlterarCla = true,
}: {
  edicao: EdicaoFicha
  regrasCriacao?: boolean
  podeAlterarCla?: boolean
}) {
  const { nome, setNome, jogadorNome, setJogadorNome, ficha, mudar } = edicao
  const clas = regrasCriacao
    ? CLAS.filter((c) => {
        return clasPermitidos(ficha.geracao).includes(c.id)
      })
    : CLAS
  const geracoes = regrasCriacao || !podeAlterarCla ? geracoesPermitidas(ficha.cla) : GERACOES
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Campo id="nome" rotulo="Nome do Personagem">
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} />
        </Campo>
        <Campo id="jogadorNome" rotulo="Jogador" opcional>
          <Input
            id="jogadorNome"
            placeholder="Ex.: Geovane"
            value={jogadorNome}
            onChange={(e) => setJogadorNome(e.target.value)}
            maxLength={120}
          />
        </Campo>
        <Campo id="conceito" rotulo="Conceito" opcional>
          <Input
            id="conceito"
            placeholder="Ex.: Hacker anarquista, Artista decadente..."
            value={ficha.conceito ?? ''}
            onChange={(e) => mudar({ conceito: e.target.value })}
            maxLength={120}
          />
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Campo id="cla" rotulo="Clã">
          <Combobox
            id="cla"
            opcoes={opcoesDe(clas, 'Sem Clã', false)}
            valor={ficha.cla ?? NENHUM}
            disabled={!podeAlterarCla}
            onChange={(v) => mudar(escolherCla(ficha, v === NENHUM ? null : (v as Cla)))}
            busca="Buscar Clã"
          />
        </Campo>
        <Campo id="geracao" rotulo="Geração">
          <Combobox
            id="geracao"
            opcoes={[
              { valor: NENHUM, rotulo: 'Sem Geração' },
              ...geracoes.map((g) => ({ valor: String(g), rotulo: rotuloGeracao(g) })),
            ]}
            valor={ficha.geracao === null ? NENHUM : String(ficha.geracao)}
            onChange={(v) => {
              const geracao = v === NENHUM ? null : Number(v)
              mudar(podeAlterarCla ? escolherGeracao(ficha, geracao) : { geracao })
            }}
            busca="Buscar Geração"
          />
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Campo id="seita" rotulo="Seita" opcional>
          <Combobox
            id="seita"
            opcoes={opcoesDe(SEITAS, 'Sem Seita', false)}
            valor={ficha.seita ?? NENHUM}
            onChange={(v) => mudar({ seita: v === NENHUM ? null : (v as Seita) })}
            busca="Buscar Seita"
          />
        </Campo>
        <Campo id="senhor" rotulo="Senhor" opcional>
          <Input id="senhor" value={ficha.senhor} onChange={(e) => mudar({ senhor: e.target.value })} />
        </Campo>
      </div>
      {ficha.cla && <CardPerdicaoCompulsaoCla cla={ficha.cla} />}
    </>
  )
}

export function CamposAmbicaoDesejo({ edicao }: { edicao: EdicaoFicha }) {
  const { ficha, mudar } = edicao
  return (
    <>
      <Campo id="ambicao" rotulo="Ambição" opcional>
        <Input id="ambicao" value={ficha.ambicao} onChange={(e) => mudar({ ambicao: e.target.value })} />
      </Campo>
      <Campo id="desejo" rotulo="Desejo" opcional>
        <Input id="desejo" value={ficha.desejo} onChange={(e) => mudar({ desejo: e.target.value })} />
      </Campo>
    </>
  )
}

export function CamposAtributos({ edicao }: { edicao: EdicaoFicha }) {
  const { ficha, mudar } = edicao
  return (
    <div className="grid gap-x-8 gap-y-4 md:grid-cols-3">
      {GRUPOS.map((g) => (
        <Grupo key={g.id} titulo={g.atributos}>
          {atributosDoGrupo(g.id).map((a) => (
            <LinhaPontos
              key={a.id}
              nome={
                <TermoRegra tipo="atributo" id={a.id}>
                  {a.nome}
                </TermoRegra>
              }
            >
              <SeletorPontos
                rotulo={a.nome}
                valor={ficha.atributos[a.id]}
                min={FAIXAS.atributo.min}
                max={FAIXAS.atributo.max}
                onChange={(valor) => mudar({ atributos: { ...ficha.atributos, [a.id]: valor } })}
              />
            </LinhaPontos>
          ))}
        </Grupo>
      ))}
    </div>
  )
}

export function CamposHabilidades({ edicao }: { edicao: EdicaoFicha }) {
  const { ficha, mudar, especializacoes, setEspecializacoes } = edicao
  return (
    <div className="grid gap-x-8 gap-y-4 md:grid-cols-3">
      {GRUPOS.map((g) => (
        <Grupo key={g.id} titulo={g.habilidades}>
          {habilidadesDoGrupo(g.id).map((h) => {
            const habilidade = ficha.habilidades[h.id]
            return (
              <li key={h.id} className="border-b">
                <div className="flex min-h-12 items-center justify-between gap-2 text-base">
                  <TermoRegra tipo="habilidade" id={h.id}>
                    {h.nome}
                  </TermoRegra>
                  <SeletorPontos
                    rotulo={h.nome}
                    valor={habilidade.valor}
                    min={FAIXAS.habilidade.min}
                    max={FAIXAS.habilidade.max}
                    onChange={(valor) =>
                      mudar({ habilidades: { ...ficha.habilidades, [h.id]: { ...habilidade, valor } } })
                    }
                  />
                </div>
                {habilidade.valor > 0 && (
                  <Input
                    aria-label={`Especializações de ${h.nome}`}
                    placeholder="Especializações, separadas por vírgula"
                    value={especializacoes[h.id]}
                    onChange={(e) => setEspecializacoes({ ...especializacoes, [h.id]: e.target.value })}
                    className="mb-2"
                  />
                )}
              </li>
            )
          })}
        </Grupo>
      ))}
    </div>
  )
}

/** Com `regrasCriacao` (Jogador), poderes e Rituais seguem as regras do V5; sem ela (Narrador), tudo com aviso. */
export function CamposDisciplinas({ edicao, regrasCriacao = false }: { edicao: EdicaoFicha; regrasCriacao?: boolean }) {
  const { ficha, mudar } = edicao
  const papel = regrasCriacao ? 'jogador' : 'narrador'
  const escolhidas = new Set(ficha.disciplinas.map((d) => d.disciplina))
  const proximaDisciplina = DISCIPLINAS.find((d) => !escolhidas.has(d.id))

  if (!ficha.cla) {
    return (
      <>
        <AvisoPreRequisito
          mensagem="Escolha o Clã antes de definir as Disciplinas."
          rotuloAcao="Escolher Clã"
          campoAlvoId="cla"
        />
        <ListaSoltos ficha={ficha} onRemover={(id) => mudar(semItem(ficha, id))} />
      </>
    )
  }

  return (
    <>
      {ficha.disciplinas.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma Disciplina ainda.</p>
      )}
      <ul className="flex flex-col gap-4">
        {ficha.disciplinas.map((d, i) => {
          const nome = nomeDisciplina(d.disciplina)
          const trocar = (nova: Partial<(typeof ficha.disciplinas)[number]>) =>
            mudar({ disciplinas: ficha.disciplinas.map((x, j) => (j === i ? { ...x, ...nova } : x)) })
          return (
            <li key={d.disciplina} className="border-b pb-2">
              <div className="flex items-center gap-2">
                <Combobox
                  rotulo={`Disciplina ${i + 1}`}
                  opcoes={DISCIPLINAS.filter((x) => x.id === d.disciplina || !escolhidas.has(x.id)).map((x) => ({
                    valor: x.id,
                    rotulo: x.nome,
                    original: x.nomeOriginal,
                  }))}
                  valor={d.disciplina}
                  onChange={(v) => trocar({ disciplina: v as Disciplina })}
                  busca="Buscar Disciplina"
                  className="flex-1"
                />
                <InfoRegra tipo="disciplina" id={d.disciplina} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover ${nome}`}
                  onClick={() => mudar({ disciplinas: ficha.disciplinas.filter((_, j) => j !== i) })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <SeletorPontos
                rotulo={nome}
                valor={d.nivel}
                min={FAIXAS.disciplina.min}
                max={FAIXAS.disciplina.max}
                onChange={(nivel) => trocar({ nivel })}
              />
              <div className="flex flex-col gap-4 pb-2">
                {temPoderes(d.disciplina) && (
                  <CamposPoderes ficha={ficha} disciplina={d.disciplina} papel={papel} mudar={mudar} />
                )}
                {tipoRitualDa(d.disciplina) && (
                  <CamposRituais ficha={ficha} tipo={tipoRitualDa(d.disciplina)!} papel={papel} mudar={mudar} />
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <ListaSoltos ficha={ficha} onRemover={(id) => mudar(semItem(ficha, id))} />
      <Button
        type="button"
        variant="secondary"
        className="self-start"
        disabled={!proximaDisciplina}
        onClick={() =>
          proximaDisciplina &&
          mudar({ disciplinas: [...ficha.disciplinas, { disciplina: proximaDisciplina.id, nivel: 1 }] })
        }
      >
        Adicionar Disciplina
      </Button>
    </>
  )
}

export function CamposSangue({ edicao }: { edicao: EdicaoFicha }) {
  const { ficha, mudar } = edicao
  return (
    <>
      {ficha.geracao === null ? (
        <div className="flex flex-col gap-2">
          <span className="flex h-12 items-center text-base">Potência do Sangue</span>
          <AvisoPreRequisito
            mensagem="Escolha a Geração antes de definir a Potência do Sangue."
            rotuloAcao="Escolher Geração"
            campoAlvoId="geracao"
          />
        </div>
      ) : (
        <TrilhaDez
          rotulo="Potência do Sangue"
          valor={ficha.potenciaSangue}
          min={FAIXAS.potenciaSangue.min}
          max={FAIXAS.potenciaSangue.max}
          onChange={(potenciaSangue) => mudar({ potenciaSangue })}
        />
      )}
      <TrilhaDez
        rotulo="Humanidade"
        valor={ficha.humanidade}
        min={FAIXAS.humanidade.min}
        max={FAIXAS.humanidade.max}
        onChange={(humanidade) => mudar({ humanidade })}
      />
    </>
  )
}

export function CamposConviccoesHistoria({ edicao }: { edicao: EdicaoFicha }) {
  const { ficha, mudar } = edicao
  const conviccoes = ficha.conviccoes ?? []

  function adicionarConviccao() {
    if (conviccoes.length >= 3) return
    mudar({ conviccoes: [...conviccoes, { conviccao: '', pedraDeToque: '' }] })
  }

  function alterarConviccao(index: number, campo: 'conviccao' | 'pedraDeToque', valor: string) {
    mudar({
      conviccoes: conviccoes.map((c, i) => (i === index ? { ...c, [campo]: valor } : c)),
    })
  }

  function removerConviccao(index: number) {
    mudar({ conviccoes: conviccoes.filter((_, i) => i !== index) })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-semibold">Convicções e Pedras de Toque</h3>
          <span className="text-sm text-muted-foreground tabular-nums">{conviccoes.length} / 3</span>
        </div>
        {conviccoes.map((par, i) => (
          <div key={i} className="grid grid-cols-1 gap-4 border-b pb-4 sm:grid-cols-2">
            <Campo id={`conviccao-${i}`} rotulo={`Convicção ${i + 1}`}>
              <Input
                id={`conviccao-${i}`}
                placeholder="Ex.: Nunca machucar inocentes"
                value={par.conviccao}
                onChange={(e) => alterarConviccao(i, 'conviccao', e.target.value)}
              />
            </Campo>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Campo id={`pedra-${i}`} rotulo="Pedra de Toque" opcional>
                  <Input
                    id={`pedra-${i}`}
                    placeholder="Ex.: Irmã caçula Clara"
                    value={par.pedraDeToque}
                    onChange={(e) => alterarConviccao(i, 'pedraDeToque', e.target.value)}
                  />
                </Campo>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remover Convicção ${i + 1}`}
                onClick={() => removerConviccao(i)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {conviccoes.length < 3 && (
          <Button type="button" variant="secondary" className="self-start" onClick={adicionarConviccao}>
            <Plus aria-hidden />
            Adicionar Convicção
          </Button>
        )}
      </div>
      <Campo id="aparencia" rotulo="Aparência" opcional>
        <Textarea
          id="aparencia"
          placeholder="Traços marcantes, roupas, postura..."
          value={ficha.aparencia}
          onChange={(e) => mudar({ aparencia: e.target.value })}
          rows={3}
        />
      </Campo>
      <Campo id="historia" rotulo="História" opcional>
        <EditorRichText
          id="historia"
          value={ficha.historia}
          onChange={(historia) => mudar({ historia })}
          rows={6}
        />
      </Campo>
    </div>
  )
}

function focarCampo(id: string) {
  const elemento = document.getElementById(id)
  if (!elemento) return
  elemento.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  elemento.focus()
}

function AvisoPreRequisito({
  mensagem,
  rotuloAcao,
  campoAlvoId,
}: {
  mensagem: string
  rotuloAcao: string
  campoAlvoId: string
}) {
  return (
    <Alert className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <AlertDescription className="text-sm text-muted-foreground">{mensagem}</AlertDescription>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 self-start sm:self-auto"
        onClick={() => focarCampo(campoAlvoId)}
      >
        {rotuloAcao}
      </Button>
    </Alert>
  )
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-2xl">{titulo}</h2>
      {children}
    </section>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-sm text-muted-foreground">{titulo}</h3>
      <ul>{children}</ul>
    </div>
  )
}

function Campo({
  id,
  rotulo,
  opcional = false,
  dica,
  children,
}: {
  id: string
  rotulo: string
  opcional?: boolean
  dica?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {rotulo}
        {opcional && <span className="font-normal text-muted-foreground">(opcional)</span>}
      </Label>
      {children}
      {dica && <p className="text-xs text-muted-foreground">{dica}</p>}
    </div>
  )
}

/** Ícone ao lado de um Select que abre a consulta de regra da opção escolhida. */
function InfoRegra({ tipo, id }: { tipo: 'cla' | 'disciplina'; id: string }) {
  return (
    <TermoRegra tipo={tipo} id={id} icone className="shrink-0 text-muted-foreground">
      <Info className="size-4" />
    </TermoRegra>
  )
}

function LinhaPontos({ nome, children }: { nome: ReactNode; children: ReactNode }) {
  return (
    <li className="flex min-h-12 items-center justify-between gap-2 border-b text-base">
      <span>{nome}</span>
      {children}
    </li>
  )
}

/** Trilha de 0 a 10 numa linha só, como na ficha oficial; o rótulo fica em cima para caber no celular. */
function TrilhaDez(props: {
  rotulo: string
  valor: number
  min: number
  max: number
  onChange: (valor: number) => void
}) {
  return (
    <div className="flex flex-col">
      <span className="flex h-12 items-center text-base">
        {props.rotulo} <span className="ml-2 text-muted-foreground tabular-nums">{props.valor}</span>
      </span>
      <SeletorPontos {...props} compacto />
    </div>
  )
}
