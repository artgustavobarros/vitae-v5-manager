import { Info, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Combobox, type OpcaoCombobox } from '#/components/combobox'
import { TermoRegra } from '#/components/consulta-regra'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
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

import type { OpcoesCriacaoCronica } from '#/domain/cronica'
import { CardPerdicaoCompulsaoCla } from './card-cla'
import { CamposPoderes, CamposRituais, CamposVantagensPersonagem, ListaSoltos } from './catalogo'
import { SeletorPontos } from './marcadores'
import { atributosDoGrupo, habilidadesDoGrupo, nomeDisciplina, rotuloGeracao } from './tracos'

// Valor da opção "Sem Clã", "Sem Geração" e "Sem Seita" nos combobox.
const NENHUM = 'nenhum'

function opcoesDe(
  lista: readonly { id: string; nome: string; nomeOriginal?: string }[],
  semNada: string,
  incluirOriginal = true,
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

export type ValoresFormulario = { nome: string; ficha: Ficha }

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
    return { nome: nome.trim(), ficha: { ...ficha, habilidades } }
  }

  return { nome, setNome, ficha, mudar, especializacoes, setEspecializacoes, valores }
}

export type EdicaoFicha = ReturnType<typeof useEdicaoFicha>

/**
 * Formulário manual provisório da Ficha inteira numa página, para editar uma Ficha já concluída.
 * Só respeita as faixas, sem regras do V5. Dano, Fome e Manchas não aparecem aqui; seguem como vieram.
 */
export function FormularioFicha({
  inicial,
  salvando,
  onSalvar,
}: {
  inicial: ValoresFormulario
  salvando: boolean
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
        <CamposIdentidade edicao={edicao} />
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
        <CamposVantagensPersonagem ficha={edicao.ficha} regras={false} mudar={edicao.mudar} />
      </Secao>
      <div className="border-t pt-4">
        <Button type="submit" disabled={salvando}>
          Salvar
        </Button>
      </div>
    </form>
  )
}

/**
 * Com `regrasCriacao`, Clã e Geração só oferecem o que combina: Sangue-Ralo da 14ª Geração em diante.
 * Sem ela (Narrador editando uma Ficha concluída), as listas ficam livres.
 */
export function CamposIdentidade({
  edicao,
  regrasCriacao = false,
  opcoesCronica,
}: {
  edicao: EdicaoFicha
  regrasCriacao?: boolean
  opcoesCronica?: OpcoesCriacaoCronica
}) {
  const { nome, setNome, ficha, mudar } = edicao
  const clas = regrasCriacao
    ? CLAS.filter((c) => {
        if (opcoesCronica) {
          if (c.id === 'caitiff' && !opcoesCronica.caitiffPermitido) return false
          if (c.id === 'sangue-ralo' && !opcoesCronica.sangueRaloPermitido) return false
          if (
            c.id !== 'caitiff' &&
            c.id !== 'sangue-ralo' &&
            !opcoesCronica.clasPermitidos.includes(c.id)
          )
            return false
        }
        return clasPermitidos(ficha.geracao).includes(c.id)
      })
    : CLAS
  const geracoes = regrasCriacao ? geracoesPermitidas(ficha.cla) : GERACOES
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="nome" rotulo="Nome">
          <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} />
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
            onChange={(v) => mudar(escolherGeracao(ficha, v === NENHUM ? null : Number(v)))}
            busca="Buscar Geração"
          />
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Campo id="seita" rotulo="Seita" opcional>
          <Combobox
            id="seita"
            opcoes={opcoesDe(SEITAS, 'Sem Seita')}
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
  return GRUPOS.map((g) => (
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
  ))
}

export function CamposHabilidades({ edicao }: { edicao: EdicaoFicha }) {
  const { ficha, mudar, especializacoes, setEspecializacoes } = edicao
  return GRUPOS.map((g) => (
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
  ))
}

/** Com `regrasCriacao` (Jogador), poderes e Rituais seguem as regras do V5; sem ela (Narrador), tudo com aviso. */
export function CamposDisciplinas({ edicao, regrasCriacao = false }: { edicao: EdicaoFicha; regrasCriacao?: boolean }) {
  const { ficha, mudar } = edicao
  const papel = regrasCriacao ? 'jogador' : 'narrador'
  const escolhidas = new Set(ficha.disciplinas.map((d) => d.disciplina))
  const proximaDisciplina = DISCIPLINAS.find((d) => !escolhidas.has(d.id))

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
      <TrilhaDez
        rotulo="Potência do Sangue"
        valor={ficha.potenciaSangue}
        min={FAIXAS.potenciaSangue.min}
        max={FAIXAS.potenciaSangue.max}
        onChange={(potenciaSangue) => mudar({ potenciaSangue })}
      />
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
  children,
}: {
  id: string
  rotulo: string
  opcional?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {rotulo}
        {opcional && <span className="font-normal text-muted-foreground">(opcional)</span>}
      </Label>
      {children}
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
