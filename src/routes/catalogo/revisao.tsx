import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { Combobox } from '#/components/combobox'
import { CreditoWiki } from '#/components/consulta-regra'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import {
  filaRevisao,
  itensRevisao,
  ROTULO_CATEGORIA,
  type CategoriaRevisao,
  type ItemRevisao,
  type StatusRevisao,
} from '#/domain/catalogo/revisao'
import type { Confianca } from '#/domain/catalogo/tipos'
import { aprovarTraducao, listarRevisoes, sugerirTraducao } from '#/server/revisao'

export const Route = createFileRoute('/catalogo/revisao')({
  beforeLoad: ({ context }) => {
    if (context.usuario?.papel !== 'narrador') throw redirect({ to: '/' })
  },
  loader: () => listarRevisoes(),
  component: RevisaoTraducao,
})

const CHIPS: { valor: Confianca; rotulo: string }[] = [
  { valor: 'duvida', rotulo: 'Dúvida' },
  { valor: 'ingles', rotulo: 'Em inglês' },
  { valor: 'certo', rotulo: 'Certo' },
]

const TODOS = 'todos'
const POR_PAGINA = 50
const ITENS = itensRevisao()

function RevisaoTraducao() {
  const revisoes = Route.useLoaderData()
  const [confianca, setConfianca] = useState<Confianca>('duvida')
  const [categoria, setCategoria] = useState<CategoriaRevisao | null>(null)
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(POR_PAGINA)

  const fila = useMemo(
    () => filaRevisao(ITENS, revisoes, { confianca, categoria, busca }),
    [revisoes, confianca, categoria, busca],
  )
  const contagem = (c: Confianca) => filaRevisao(ITENS, revisoes, { confianca: c, categoria, busca }).length

  return (
    <main className="mx-auto min-h-dvh max-w-3xl pb-12">
      <BarraApp />
      <div className="flex flex-col gap-6 px-4 pt-2">
        <div>
          <h1 className="font-serif text-display text-balance">Revisão de tradução</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aprove o nome e a descrição ou sugira outros. A sugestão entra no código, e o item passa a Certo.
          </p>
        </div>

        <ToggleGroup
          type="single"
          variant="outline"
          value={confianca}
          onValueChange={(v) => {
            if (!v) return
            setConfianca(v as Confianca)
            setLimite(POR_PAGINA)
          }}
          className="self-start"
        >
          {CHIPS.map((chip) => (
            <ToggleGroupItem key={chip.valor} value={chip.valor} className="px-4">
              {chip.rotulo} <span className="text-muted-foreground tabular-nums">{contagem(chip.valor)}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="tipo-item">Tipo</Label>
            <Combobox
              id="tipo-item"
              opcoes={[
                { valor: TODOS, rotulo: 'Todos os tipos' },
                ...(Object.entries(ROTULO_CATEGORIA) as [CategoriaRevisao, string][]).map(([valor, rotulo]) => ({
                  valor,
                  rotulo,
                })),
              ]}
              valor={categoria ?? TODOS}
              onChange={(v) => setCategoria(v === TODOS ? null : (v as CategoriaRevisao))}
              busca="Buscar tipo"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="busca-revisao">Busca</Label>
            <Input
              id="busca-revisao"
              type="search"
              placeholder="Nome, original ou id"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        {fila.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nada para revisar aqui.</p>
        ) : (
          <ul className="flex flex-col border-t">
            {fila.slice(0, limite).map((item) => (
              <LinhaRevisao key={item.id} item={item} />
            ))}
          </ul>
        )}
        {fila.length > limite && (
          <Button variant="secondary" className="self-start" onClick={() => setLimite(limite + POR_PAGINA)}>
            Mostrar mais ({fila.length - limite})
          </Button>
        )}

        <CreditoWiki />
      </div>
    </main>
  )
}

function LinhaRevisao({ item }: { item: ItemRevisao & { status: StatusRevisao } }) {
  const router = useRouter()
  const [sugerindo, setSugerindo] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function enviar(acao: () => Promise<unknown>, aviso: string) {
    setSalvando(true)
    try {
      await acao()
      toast.success(aviso)
      setSugerindo(false)
      await router.invalidate()
    } catch {
      toast.error('Não foi possível salvar. Tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  const contexto = [
    item.rotulo,
    item.nivel && `Nível ${item.nivel}`,
    item.fonte && `${item.fonte.livro}${item.fonte.pagina ? `, p. ${item.fonte.pagina}` : ''}`,
  ].filter(Boolean)

  return (
    <li className="flex flex-col gap-2 border-b py-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {contexto.join(' · ')}
        {item.status === 'sugerido' && <Badge variant="outline">Sugestão enviada</Badge>}
      </div>
      <div className="flex flex-col">
        <span className="text-base font-semibold">{item.nome}</span>
        {item.nomeOriginal && item.nomeOriginal !== item.nome && (
          <span className="text-sm text-muted-foreground">Original: {item.nomeOriginal}</span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{item.descricao}</p>

      {sugerindo ? (
        <form
          className="flex flex-col gap-3 pt-2"
          onSubmit={(e) => {
            e.preventDefault()
            enviar(
              () =>
                sugerirTraducao({
                  data: { itemId: item.id, sugestaoNome: nome || null, sugestaoDescricao: descricao || null },
                }),
              'Sugestão enviada.',
            )
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor={`nome-${item.id}`}>Nome sugerido</Label>
            <Input id={`nome-${item.id}`} value={nome} maxLength={200} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`descricao-${item.id}`}>Descrição sugerida</Label>
            <Textarea
              id={`descricao-${item.id}`}
              value={descricao}
              maxLength={2000}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={salvando || (!nome.trim() && !descricao.trim())}>
              Enviar sugestão
            </Button>
            <Button type="button" variant="ghost" onClick={() => setSugerindo(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex gap-2 pt-2">
          <Button
            disabled={salvando}
            onClick={() => enviar(() => aprovarTraducao({ data: { itemId: item.id } }), `${item.nome} aprovado.`)}
          >
            Aprovar
          </Button>
          <Button variant="secondary" onClick={() => setSugerindo(true)}>
            Sugerir
          </Button>
        </div>
      )}
    </li>
  )
}
