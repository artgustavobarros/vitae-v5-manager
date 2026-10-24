import { Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
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

import { SeletorPontos } from './marcadores'
import { atributosDoGrupo, habilidadesDoGrupo, nomeDisciplina, rotuloGeracao } from './tracos'

// O Select do Radix não aceita valor vazio; este marca "Sem Clã", "Sem Geração" e "Sem Seita".
const NENHUM = 'nenhum'

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
export function CamposIdentidade({ edicao, regrasCriacao = false }: { edicao: EdicaoFicha; regrasCriacao?: boolean }) {
  const { nome, setNome, ficha, mudar } = edicao
  const clas = regrasCriacao ? CLAS.filter((c) => clasPermitidos(ficha.geracao).includes(c.id)) : CLAS
  const geracoes = regrasCriacao ? geracoesPermitidas(ficha.cla) : GERACOES
  return (
    <>
      <Campo id="nome" rotulo="Nome">
        <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} />
      </Campo>
      <div className="grid grid-cols-2 gap-4">
        <Campo id="cla" rotulo="Clã">
          <Select
            value={ficha.cla ?? NENHUM}
            onValueChange={(v) => mudar(escolherCla(ficha, v === NENHUM ? null : (v as Cla)))}
          >
            <SelectTrigger id="cla" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NENHUM}>Sem Clã</SelectItem>
              {clas.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo id="geracao" rotulo="Geração">
          <Select
            value={ficha.geracao === null ? NENHUM : String(ficha.geracao)}
            onValueChange={(v) => mudar(escolherGeracao(ficha, v === NENHUM ? null : Number(v)))}
          >
            <SelectTrigger id="geracao" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NENHUM}>Sem Geração</SelectItem>
              {geracoes.map((g) => (
                <SelectItem key={g} value={String(g)}>
                  {rotuloGeracao(g)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Campo id="seita" rotulo="Seita" opcional>
          <Select
            value={ficha.seita ?? NENHUM}
            onValueChange={(v) => mudar({ seita: v === NENHUM ? null : (v as Seita) })}
          >
            <SelectTrigger id="seita" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NENHUM}>Sem Seita</SelectItem>
              {SEITAS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo id="senhor" rotulo="Senhor" opcional>
          <Input id="senhor" value={ficha.senhor} onChange={(e) => mudar({ senhor: e.target.value })} />
        </Campo>
      </div>
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
        <LinhaPontos key={a.id} nome={a.nome}>
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
              <span>{h.nome}</span>
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

export function CamposDisciplinas({ edicao }: { edicao: EdicaoFicha }) {
  const { ficha, mudar } = edicao
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
                <Select value={d.disciplina} onValueChange={(v) => trocar({ disciplina: v as Disciplina })}>
                  <SelectTrigger aria-label={`Disciplina ${i + 1}`} className="w-full flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCIPLINAS.filter((x) => x.id === d.disciplina || !escolhidas.has(x.id)).map((x) => (
                      <SelectItem key={x.id} value={x.id}>
                        {x.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            </li>
          )
        })}
      </ul>
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

function LinhaPontos({ nome, children }: { nome: string; children: ReactNode }) {
  return (
    <li className="flex min-h-12 items-center justify-between gap-2 border-b text-base">
      <span>{nome}</span>
      {children}
    </li>
  )
}

/** Trilha de 0 a 10 em duas linhas de 5, para caber no celular. */
function TrilhaDez(props: {
  rotulo: string
  valor: number
  min: number
  max: number
  onChange: (valor: number) => void
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="flex h-12 items-center text-base">
        {props.rotulo} <span className="ml-2 text-muted-foreground tabular-nums">{props.valor}</span>
      </span>
      <SeletorPontos {...props} className="grid grid-cols-5" />
    </div>
  )
}
