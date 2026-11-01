import { useId, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { Combobox } from '#/components/combobox'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '#/components/ui/dialog'
import { Input, InputNumero } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { ATRIBUTOS, HABILIDADES, DISCIPLINAS } from '#/domain/ficha'
import type { FichaAntagonistaCompleta } from '#/domain/ficha-antagonista'

function GrupoEditavel({ titulo, valores, opcoes, maximo = 15, minimo = 0, onChange }: {
  titulo: string; valores: Record<string, number>; opcoes: readonly { nome: string }[]
  maximo?: number; minimo?: number; onChange: (valores: Record<string, number>) => void
}) {
  const id = useId()
  const [novo, setNovo] = useState('')
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-serif text-base font-semibold">{titulo}</h3>
      {Object.entries(valores).map(([nome, valor]) => (
        <div key={nome} className="flex items-center gap-2">
          <Label htmlFor={`${id}-${nome}`} className="min-w-0 flex-1">{nome}</Label>
          <InputNumero id={`${id}-${nome}`} min={minimo} max={maximo} value={valor} className="w-20" required onChange={(n) => onChange({ ...valores, [nome]: n })} />
          <Button type="button" variant="ghost" size="icon" aria-label={`Remover ${nome}`} onClick={() => {
            const restantes = { ...valores }
            delete restantes[nome]
            onChange(restantes)
          }}><Trash2 className="size-4" /></Button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Combobox rotulo={`Adicionar em ${titulo}`} valor={novo || null} opcoes={opcoes.filter((o) => !(o.nome in valores)).map((o) => ({ valor: o.nome, rotulo: o.nome }))} permiteCriar placeholder="Nome da característica..." onChange={setNovo} />
        <Button type="button" variant="outline" size="icon" aria-label={`Adicionar em ${titulo}`} disabled={!novo.trim() || novo.trim() in valores} onClick={() => { onChange({ ...valores, [novo.trim()]: Math.max(1, minimo) }); setNovo('') }}><Plus className="size-4" /></Button>
      </div>
    </div>
  )
}

export function EditorFichaAntagonistaCompleta({ ficha, onChange }: {
  ficha: FichaAntagonistaCompleta; onChange: (ficha: FichaAntagonistaCompleta) => void
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="font-serif text-base font-semibold">Atributos</h3>
        <div className="grid grid-cols-3 gap-3">
          {ATRIBUTOS.map((atributo) => (
            <div key={atributo.id} className="flex min-w-0 flex-col gap-1">
              <Label htmlFor={`${id}-${atributo.id}`} className="text-xs">{atributo.nome}</Label>
              <InputNumero id={`${id}-${atributo.id}`} min={0} max={15} required value={ficha.atributos[atributo.id]} onChange={(valor) => onChange({ ...ficha, atributos: { ...ficha.atributos, [atributo.id]: valor } })} />
            </div>
          ))}
        </div>
      </div>
      <GrupoEditavel titulo="Habilidades" valores={ficha.habilidades} opcoes={HABILIDADES} onChange={(habilidades) => onChange({ ...ficha, habilidades })} />
      <GrupoEditavel titulo="Disciplinas" valores={ficha.disciplinas} opcoes={DISCIPLINAS} minimo={1} maximo={5} onChange={(disciplinas) => onChange({ ...ficha, disciplinas })} />
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">Deixe vazio o que a fonte não informa ou não se aplica à criatura.</p>
        <div className="grid grid-cols-3 gap-3">
          {([{ campo: 'humanidade', nome: 'Humanidade', maximo: 10 }, { campo: 'potenciaSangue', nome: 'Potência do Sangue', maximo: 10 }, { campo: 'fome', nome: 'Fome', maximo: 5 }] as const).map(({ campo, nome, maximo }) => (
            <div key={campo} className="flex min-w-0 flex-col gap-1">
              <Label htmlFor={`${id}-${campo}`} className="text-xs">{nome}</Label>
              <Input id={`${id}-${campo}`} type="number" min={0} max={maximo} value={ficha[campo] ?? ''} placeholder="—" onChange={(e) => onChange({ ...ficha, [campo]: e.target.value === '' ? null : Number(e.target.value) })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ResumoFichaAntagonistaCompleta({ ficha, nome }: { ficha: FichaAntagonistaCompleta; nome: string }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <Badge variant="outline" className="self-start">Ficha completa</Badge>
      <div className="grid grid-cols-3 gap-2 rounded-md bg-muted/40 p-2 text-center">
        {ATRIBUTOS.map((a) => <div key={a.id}><span className="block text-xs text-muted-foreground">{a.nome}</span><span className="font-semibold tabular-nums">{ficha.atributos[a.id]}</span></div>)}
      </div>
      <p className="text-xs text-muted-foreground">
        Humanidade {ficha.humanidade ?? '—'} · Potência do Sangue {ficha.potenciaSangue ?? '—'} · Fome {ficha.fome ?? '—'}
      </p>
      <Dialog>
        <DialogTrigger asChild><Button type="button" size="sm" variant="outline" aria-label={`Ver Habilidades e Disciplinas de ${nome}`}>Habilidades e Disciplinas</Button></DialogTrigger>
        <DialogContent className="max-h-9/10 overflow-y-auto">
          <DialogHeader><DialogTitle>{nome}</DialogTitle><DialogDescription>Ficha completa de antagonista.</DialogDescription></DialogHeader>
          {([{ titulo: 'Habilidades', valores: ficha.habilidades }, { titulo: 'Disciplinas', valores: ficha.disciplinas }]).map(({ titulo, valores }) => (
            <section key={titulo} className="flex flex-col gap-3">
              <h3 className="font-serif text-xl">{titulo}</h3>
              {Object.keys(valores).length === 0 ? <p className="text-sm text-muted-foreground">Não informadas.</p> : <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {Object.entries(valores).map(([rotulo, valor]) => <div key={rotulo} className="flex justify-between gap-2"><dt>{rotulo}</dt><dd className="tabular-nums">{valor}</dd></div>)}
              </dl>}
            </section>
          ))}
        </DialogContent>
      </Dialog>
    </div>
  )
}
