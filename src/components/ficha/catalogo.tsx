import { cn } from 'cn'
import { Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { Combobox, type OpcaoCombobox } from '#/components/combobox'
import { TermoRegra } from '#/components/consulta-regra'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import type { Papel } from '#/domain/acesso'
import {
  CAMPO_DO_RITUAL,
  itensSoltos,
  nivelDisciplina,
  opcoesPoderes,
  opcoesRituais,
  opcoesVantagens,
  poderesDaDisciplina,
  pontos,
  PONTOS_CRIACAO,
  situacaoItem,
  TEXTO_MOTIVO,
  temVagaDePoder,
  temPoderes,
  tipoRitualDa,
  type Opcao,
  type TipoRitual,
} from '#/domain/catalogo/escolhas'
import { itemCatalogo, vantagem, VANTAGENS_PERSONAGEM } from '#/domain/catalogo/index'
import type { DisciplinaComPoderes, Nivel, Poder, Ritual, Vantagem } from '#/domain/catalogo/tipos'
import type { Disciplina, EscolhaVantagem, Ficha } from '#/domain/ficha'

// Poderes, Rituais, Cerimônias, Fórmulas, Vantagens e Defeitos na Ficha: leitura e edição.

const NIVEIS: Nivel[] = [1, 2, 3, 4, 5]

export const ROTULO_RITUAIS: Record<TipoRitual, string> = {
  ritual: 'Rituais',
  cerimonia: 'Cerimônias',
  formula: 'Fórmulas',
}

function opcaoCombobox<T extends Poder | Ritual>({ item, motivos, bloqueado }: Opcao<T>): OpcaoCombobox {
  return {
    valor: item.id,
    rotulo: item.nome,
    original: item.nomeOriginal,
    descricao: item.descricao,
    grupo: `Nível ${item.nivel}`,
    aviso: motivos.map((m) => TEXTO_MOTIVO[m]).join(' · ') || undefined,
    desabilitada: bloqueado,
  }
}

/** Um poder, Ritual ou Vantagem da Ficha: toca para abrir o cartão. Removido ou acima do nível fica em vinho. */
export function ItemEscolhido({
  ficha,
  id,
  detalhe,
  acao,
}: {
  ficha: Pick<Ficha, 'disciplinas'>
  id: string
  detalhe?: ReactNode
  acao?: ReactNode
}) {
  const item = itemCatalogo(id)
  const situacao = situacaoItem(ficha, id)
  return (
    <li className="flex min-h-11 items-center justify-between gap-2 border-b text-base">
      <div className="flex flex-1 min-w-0 flex-col py-2">
        {item ? (
          <TermoRegra tipo="catalogo" id={id} className={cn(situacao !== 'ok' && 'text-vinho')}>
            {item.nome}
          </TermoRegra>
        ) : (
          <span className="text-vinho">Item removido do Catálogo</span>
        )}
        {situacao === 'acima-do-nivel' && <span className="text-xs text-vinho">Acima do nível da Disciplina</span>}
        {detalhe}
      </div>
      {acao}
    </li>
  )
}
function BotaoRemover({ nome, onClick }: { nome: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Remover ${nome}`}
      onClick={onClick}
      className="shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="size-4" />
    </Button>
  )
}

/** Poderes de uma Disciplina no formulário. O Jogador segue as regras; o Narrador vê tudo, com aviso. */
export function CamposPoderes({
  ficha,
  disciplina,
  papel,
  mudar,
}: {
  ficha: Ficha
  disciplina: DisciplinaComPoderes
  papel: Papel
  mudar: (parcial: Partial<Ficha>) => void
}) {
  const escolhidos = poderesDaDisciplina(ficha, disciplina)
  const nivel = nivelDisciplina(ficha, disciplina)
  const vaga = temVagaDePoder(ficha, disciplina)
  const opcoes = opcoesPoderes(ficha, disciplina, papel).map(opcaoCombobox)

  return (
    <div className="flex flex-col gap-2 pl-4">
      <span className="text-sm text-muted-foreground tabular-nums">
        Poderes {escolhidos.length} / {nivel}
      </span>
      {escolhidos.length > 0 && (
        <ul>
          {escolhidos.map((id) => (
            <ItemEscolhido
              key={id}
              ficha={ficha}
              id={id}
              acao={
                <BotaoRemover
                  nome={itemCatalogo(id)?.nome ?? 'item removido'}
                  onClick={() => mudar({ poderes: ficha.poderes.filter((p) => p !== id) })}
                />
              }
            />
          ))}
        </ul>
      )}
      <Combobox
        rotulo="Adicionar poder"
        opcoes={opcoes}
        valor={null}
        onChange={(id) => mudar({ poderes: [...ficha.poderes, id] })}
        placeholder={papel === 'jogador' && !vaga ? 'Sem vaga para outro poder' : 'Adicionar poder'}
        busca="Buscar poder"
        vazio="Nenhum poder disponível."
        disabled={(papel === 'jogador' && !vaga) || opcoes.length === 0}
      />
    </div>
  )
}

/** Rituais (Feitiçaria de Sangue), Cerimônias (Oblívio) ou Fórmulas (Alquimia): só a regra do nível. */
export function CamposRituais({
  ficha,
  tipo,
  papel,
  mudar,
}: {
  ficha: Ficha
  tipo: TipoRitual
  papel: Papel
  mudar: (parcial: Partial<Ficha>) => void
}) {
  const campo = CAMPO_DO_RITUAL[tipo]
  const escolhidos = ficha[campo]
  const opcoes = opcoesRituais(ficha, tipo, papel).map(opcaoCombobox)
  const rotulo = ROTULO_RITUAIS[tipo]

  return (
    <div className="flex flex-col gap-2 pl-4">
      <span className="text-sm text-muted-foreground">{rotulo}</span>
      {escolhidos.length > 0 && (
        <ul>
          {escolhidos.map((id) => (
            <ItemEscolhido
              key={id}
              ficha={ficha}
              id={id}
              acao={
                <BotaoRemover
                  nome={itemCatalogo(id)?.nome ?? 'item removido'}
                  onClick={() => mudar({ [campo]: escolhidos.filter((r) => r !== id) })}
                />
              }
            />
          ))}
        </ul>
      )}
      <Combobox
        rotulo={`Adicionar ${rotulo}`}
        opcoes={opcoes}
        valor={null}
        onChange={(id) => mudar({ [campo]: [...escolhidos, id] })}
        placeholder={`Adicionar a ${rotulo}`}
        busca="Buscar"
        vazio="Nada disponível neste nível."
        disabled={opcoes.length === 0}
      />
    </div>
  )
}

/**
 * Vantagens ou Defeitos, do Personagem ou da Coterie: nível e nota livre por linha.
 * Com `regras`, o nível só oferece os do livro; sem elas (Narrador), todos, com aviso.
 */
export function CamposVantagens({
  escolhidas,
  tipo,
  catalogo = VANTAGENS_PERSONAGEM,
  regras,
  contador,
  onChange,
}: {
  escolhidas: EscolhaVantagem[]
  tipo: Vantagem['tipo']
  catalogo?: readonly Vantagem[]
  regras: boolean
  /** Ex.: 7 para "x / 7"; só informa. */
  contador?: number
  onChange: (escolhidas: EscolhaVantagem[]) => void
}) {
  const titulo = tipo === 'vantagem' ? 'Vantagens' : 'Defeitos'
  const opcoes: OpcaoCombobox[] = opcoesVantagens(escolhidas, tipo, catalogo).map((v) => ({
    valor: v.id,
    rotulo: v.nome,
    original: v.nomeOriginal,
    descricao: v.descricao,
    grupo: v.grupo,
    aviso: v.preRequisito,
  }))
  const trocar = (i: number, parcial: Partial<EscolhaVantagem>) =>
    onChange(escolhidas.map((e, j) => (j === i ? { ...e, ...parcial } : e)))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold">{titulo}</h3>
        {contador !== undefined && (
          <span className="text-sm text-muted-foreground tabular-nums">
            {pontos(escolhidas)} / {contador}
          </span>
        )}
      </div>
      {escolhidas.length > 0 && (
        <ul>
          {escolhidas.map((e, i) => {
            const item = vantagem(e.id)
            const niveis = regras && item ? item.niveis : NIVEIS
            return (
              <ItemEscolhido
                key={`${e.id}-${i}`}
                ficha={{ disciplinas: [] }}
                id={e.id}
                detalhe={
                  <div className="mt-2 flex items-center gap-2">
                    <Combobox
                      rotulo={`Nível de ${item?.nome ?? 'item removido'}`}
                      opcoes={niveis.map((n) => ({
                        valor: String(n),
                        rotulo: `Nível ${n}`,
                        aviso: item && !item.niveis.includes(n) ? 'Nível fora do livro' : undefined,
                      }))}
                      valor={String(e.nivel)}
                      onChange={(v) => trocar(i, { nivel: Number(v) })}
                      className="w-32 shrink-0"
                    />
                    <Input
                      aria-label={`Nota de ${item?.nome ?? 'item removido'}`}
                      placeholder="Nota (opcional)"
                      value={e.nota ?? ''}
                      maxLength={200}
                      onChange={(ev) => trocar(i, { nota: ev.target.value || undefined })}
                      className="flex-1 min-w-0"
                    />
                    <BotaoRemover
                      nome={item?.nome ?? 'item removido'}
                      onClick={() => onChange(escolhidas.filter((_, j) => j !== i))}
                    />
                  </div>
                }
              />
            )
          })}
        </ul>
      )}
      <Combobox
        rotulo={`Adicionar ${tipo === 'vantagem' ? 'Vantagem' : 'Defeito'}`}
        opcoes={opcoes}
        valor={null}
        onChange={(id) => {
          const item = vantagem(id)
          if (item) onChange([...escolhidas, { id, nivel: item.niveis[0] }])
        }}
        placeholder={tipo === 'vantagem' ? 'Adicionar Vantagem' : 'Adicionar Defeito'}
        busca="Buscar"
        disabled={opcoes.length === 0}
      />
    </div>
  )
}

/** Vantagens e Defeitos do Personagem no formulário e no wizard. */
export function CamposVantagensPersonagem({
  ficha,
  regras,
  mudar,
}: {
  ficha: Ficha
  regras: boolean
  mudar: (parcial: Partial<Ficha>) => void
}) {
  return (
    <>
      <CamposVantagens
        escolhidas={ficha.vantagens}
        tipo="vantagem"
        regras={regras}
        contador={PONTOS_CRIACAO.vantagens}
        onChange={(vantagens) => mudar({ vantagens })}
      />
      <CamposVantagens
        escolhidas={ficha.defeitos}
        tipo="defeito"
        regras={regras}
        contador={PONTOS_CRIACAO.defeitos}
        onChange={(defeitos) => mudar({ defeitos })}
      />
    </>
  )
}

/** Vantagens ou Defeitos só para leitura: nome, nível e nota. */
export function ListaVantagens({ titulo, escolhidas }: { titulo: string; escolhidas: EscolhaVantagem[] }) {
  return (
    <div className="flex flex-col">
      <h3 className="text-sm text-muted-foreground">{titulo}</h3>
      {escolhidas.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Nenhum.</p>
      ) : (
        <ul>
          {escolhidas.map((e, i) => (
            <ItemEscolhido
              key={`${e.id}-${i}`}
              ficha={{ disciplinas: [] }}
              id={e.id}
              detalhe={e.nota && <span className="text-sm text-muted-foreground">{e.nota}</span>}
              acao={<span className="text-sm text-muted-foreground tabular-nums">{e.nivel}</span>}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

/** Poderes e Rituais de uma Disciplina, só para leitura, embaixo dela na Ficha. */
export function ListaPoderes({ ficha, disciplina }: { ficha: Ficha; disciplina: Disciplina }) {
  const tipoRitual = tipoRitualDa(disciplina)
  const ids = [
    ...(temPoderes(disciplina) ? poderesDaDisciplina(ficha, disciplina) : []),
    ...(tipoRitual ? ficha[CAMPO_DO_RITUAL[tipoRitual]] : []),
  ]
  if (ids.length === 0) return null
  return (
    <ul className="pl-4">
      {ids.map((id) => (
        <ItemEscolhido key={id} ficha={ficha} id={id} />
      ))}
    </ul>
  )
}

/** Itens fora de qualquer Disciplina da Ficha (removidos ou de Disciplina tirada), em vermelho. */
export function ListaSoltos({
  ficha,
  onRemover,
}: {
  ficha: Ficha
  /** No formulário, cada linha ganha o botão de remover. */
  onRemover?: (id: string) => void
}) {
  const ids = itensSoltos(ficha)
  if (ids.length === 0) return null
  return (
    <div className="flex flex-col">
      <h3 className="text-sm text-muted-foreground">Fora das Disciplinas</h3>
      <ul>
        {ids.map((id) => (
          <ItemEscolhido
            key={id}
            ficha={ficha}
            id={id}
            acao={onRemover && <BotaoRemover nome={itemCatalogo(id)?.nome ?? 'item removido'} onClick={() => onRemover(id)} />}
          />
        ))}
      </ul>
    </div>
  )
}
