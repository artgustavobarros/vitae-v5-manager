import { useId, useState } from 'react'
import { Shuffle } from 'lucide-react'
import { toast } from 'sonner'

import { Combobox } from '#/components/combobox'
import { TermoRegra } from '#/components/consulta-regra'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '#/components/ui/dialog'
import { InputNumero } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { SelectMultiplo } from '#/components/ui/select-multiplo'
import { Switch } from '#/components/ui/switch'
import type { ModeloAntagonista } from '#/domain/bestiario'
import { PODERES, RITUAIS_TODOS, itemCatalogo } from '#/domain/catalogo'
import { requisitosItem } from '#/domain/catalogo/requisitos'
import { DISCIPLINAS } from '#/domain/ficha'
import {
  CAMPO_SOBRENATURAL, DISCIPLINA_RITUAL, ROTULO_RITUAL, TIPOS_RITUAIS,
  obterPerfilSobrenatural, opcoesSobrenaturais, sortearRecursosSobrenaturais, trocarPoder,
  validarSelecaoParaModelo, type QuantidadesRituais, type RecursosSobrenaturais,
} from '#/domain/poderes-antagonista'

const nomesDisciplinas = new Map(DISCIPLINAS.map(d => [d.id, d.nome]))

function erroSelecao(modelo: ModeloAntagonista, selecao: RecursosSobrenaturais | null, quantidades: QuantidadesRituais) {
  if (!selecao) return 'Sorteie ou escolha os poderes para continuar.'
  try {
    validarSelecaoParaModelo(modelo, selecao)
    for (const tipo of TIPOS_RITUAIS) {
      if (selecao[CAMPO_SOBRENATURAL[tipo]].length !== (quantidades[tipo] ?? 0)) return `Escolha ${quantidades[tipo] ?? 0} ${(quantidades[tipo] ?? 0) === 1 ? 'item' : 'itens'} em ${ROTULO_RITUAL[tipo]}.`
    }
    return null
  } catch (erro) { return erro instanceof Error ? erro.message : 'Seleção inválida.' }
}

export function ConfigurarPoderesAntagonista({ modelo, valor, onChange }: {
  modelo: ModeloAntagonista
  valor?: RecursosSobrenaturais
  onChange: (valor: RecursosSobrenaturais) => void
}) {
  const id = useId()
  const perfil = obterPerfilSobrenatural(modelo)
  const fixos = new Set(perfil.fixos)
  const [aberto, setAberto] = useState(false)
  const [selecao, setSelecao] = useState<RecursosSobrenaturais | null>(null)
  const [quantidades, setQuantidades] = useState<QuantidadesRituais>(perfil.quantidades)
  const [mostrarCondicoes, setMostrarCondicoes] = useState(false)
  if (!perfil.livres && !Object.keys(perfil.disciplinas).length) return null

  function abrir(abrirDialogo: boolean) {
    if (abrirDialogo) {
      const novasQuantidades = valor ? Object.fromEntries(TIPOS_RITUAIS.map(t => [t, valor[CAMPO_SOBRENATURAL[t]].length])) : perfil.quantidades
      setQuantidades(novasQuantidades)
      try { setSelecao(valor ? structuredClone(valor) : sortearRecursosSobrenaturais(modelo, { quantidades: novasQuantidades })) }
      catch (erro) {
        setSelecao({ disciplinas: perfil.disciplinas, livres: perfil.livres, poderes: [], rituais: [], cerimonias: [], formulas: [], confirmacoes: [] })
        toast.error(erro instanceof Error ? erro.message : 'Falha ao sortear poderes.')
      }
    }
    setAberto(abrirDialogo)
  }

  function sortear() {
    try { setSelecao(sortearRecursosSobrenaturais(modelo, { quantidades, confirmacoes: selecao?.confirmacoes })) }
    catch (erro) { toast.error(erro instanceof Error ? erro.message : 'Falha ao sortear poderes.') }
  }

  const condicoes = [...PODERES, ...RITUAIS_TODOS].filter(item => {
    const disciplina = item.tipo === 'poder' ? item.disciplina : DISCIPLINA_RITUAL[item.tipo]
    const nivel = perfil.disciplinas[disciplina] ?? (item.tipo === 'poder' ? perfil.livres : 0)
    return item.nivel <= nivel && requisitosItem(item.id).condicao
  })
  const confirmacoes = new Set(selecao?.confirmacoes)
  const erro = erroSelecao(modelo, selecao, quantidades)
  const grupos = DISCIPLINAS.filter(d => d.id !== 'alquimia-de-sangue-ralo' && perfil.disciplinas[d.id])
  const temRituais = TIPOS_RITUAIS.filter(tipo => perfil.disciplinas[DISCIPLINA_RITUAL[tipo]])

  return (
    <Dialog open={aberto} onOpenChange={abrir}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-auto max-w-full whitespace-normal text-left" aria-label={`Configurar poderes de ${modelo.nome}`}>
          {valor ? `Revisar poderes (${valor.poderes.length})` : 'Poderes: sortear ao adicionar'}
          {temRituais.length > 0 && ' · configurar Rituais'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Poderes de {modelo.nome}</DialogTitle>
          <DialogDescription>Sorteie um conjunto ou escolha cada poder. Esta seleção vale só para este Inimigo no Combate.</DialogDescription>
        </DialogHeader>
        <Button type="button" variant="outline" onClick={sortear} className="justify-self-start gap-2"><Shuffle className="size-4" />Sortear poderes e Rituais</Button>
        <p className="text-xs text-muted-foreground">Um poder por ponto de Disciplina, de seu nível ou inferior. Trocar um poder remove os dependentes que perderem os requisitos.</p>
        {selecao && <>
          {grupos.map(d => {
            const escolhidos = selecao.poderes.filter(pid => { const p = itemCatalogo(pid); return p?.tipo === 'poder' && p.disciplina === d.id })
            return (
              <Card key={d.id}>
                <CardHeader><CardTitle className="font-serif text-base">{d.nome} {perfil.disciplinas[d.id]}</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {Array.from({ length: perfil.disciplinas[d.id] ?? 0 }, (_, indice) => {
                    const atual = escolhidos[indice] ?? ''
                    const semAtual = { ...selecao, poderes: selecao.poderes.filter(pid => pid !== atual) }
                    const opcoes = opcoesSobrenaturais(semAtual, 'poder', d.id).filter(o => o.item.nivel <= indice + 1)
                    return <div key={`${d.id}-${indice + 1}`} className="flex flex-col gap-1">
                      <Label htmlFor={`${id}-${d.id}-${indice}`}>Poder {indice + 1} · até nível {indice + 1}{fixos.has(atual) && ' · indicado no Modelo'}</Label>
                      <Combobox id={`${id}-${d.id}-${indice}`} valor={atual || null} disabled={fixos.has(atual)}
                        opcoes={opcoes.map(o => ({ valor: o.item.id, rotulo: `${o.item.nome} · ${o.item.nivel}`, descricao: o.item.descricao, aviso: o.motivos.join('; '), desabilitada: o.motivos.length > 0 }))}
                        onChange={pid => setSelecao(trocarPoder(selecao, atual, pid))} placeholder="Escolher poder" />
                      {atual && <TermoRegra tipo="catalogo" id={atual} className="self-start text-xs text-muted-foreground">Consultar poder</TermoRegra>}
                    </div>
                  })}
                </CardContent>
              </Card>
            )
          })}
          {perfil.livres > 0 && <div className="flex flex-col gap-1">
            <Label htmlFor={`${id}-livre`}>Um poder de nível 1 de qualquer Disciplina</Label>
            <Combobox id={`${id}-livre`} valor={selecao.poderes[0] ?? null}
              opcoes={opcoesSobrenaturais({ ...selecao, poderes: [] }, 'poder').filter(o => o.item.nivel === 1).map(o => ({ valor: o.item.id, rotulo: `${o.item.tipo === 'poder' ? nomesDisciplinas.get(o.item.disciplina) : ''} · ${o.item.nome}`, aviso: o.motivos.join('; '), desabilitada: o.motivos.length > 0 }))}
              onChange={pid => setSelecao(trocarPoder(selecao, selecao.poderes[0] ?? '', pid))} placeholder="Escolher poder livre" />
          </div>}
          {temRituais.map(tipo => {
            const campo = CAMPO_SOBRENATURAL[tipo]
            const opcoes = opcoesSobrenaturais(selecao, tipo)
            const selecionados = selecao[campo].map(pid => ({ valor: pid, rotulo: itemCatalogo(pid)?.nome ?? pid }))
            return <Card key={tipo}>
              <CardHeader><CardTitle className="font-serif text-base">{ROTULO_RITUAL[tipo]}</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={`${id}-${tipo}-quantidade`}>Quantidade para este Inimigo</Label>
                  <InputNumero id={`${id}-${tipo}-quantidade`} className="w-20" min={0} max={100} value={quantidades[tipo] ?? 0}
                    onChange={n => { setQuantidades({ ...quantidades, [tipo]: n }); setSelecao({ ...selecao, [campo]: selecao[campo].slice(0, n) }) }} />
                </div>
                <SelectMultiplo valores={selecao[campo]} rotulo={ROTULO_RITUAL[tipo]} placeholder={`Escolher ${ROTULO_RITUAL[tipo].toLowerCase()}`} disabled={!quantidades[tipo]}
                  opcoes={[...selecionados, ...opcoes.map(o => ({ valor: o.item.id, rotulo: `${o.item.nome} · nível ${o.item.nivel}`, detalhe: o.motivos.join('; ') || o.item.descricao, desabilitado: o.motivos.length > 0 || selecao[campo].length >= (quantidades[tipo] ?? 0) }))]}
                  onChange={ids => setSelecao(trocarPoder({ ...selecao, [campo]: ids.slice(0, quantidades[tipo] ?? 0) }, '', ''))} />
                {selecao[campo].map(pid => <TermoRegra key={pid} tipo="catalogo" id={pid} className="self-start text-xs">{itemCatalogo(pid)?.nome}</TermoRegra>)}
              </CardContent>
            </Card>
          })}
          {condicoes.length > 0 && <div className="flex flex-col gap-3 border-t pt-3">
            <Button type="button" variant="ghost" className="justify-self-start whitespace-normal" onClick={() => setMostrarCondicoes(!mostrarCondicoes)} aria-expanded={mostrarCondicoes}>Condições adicionais de Clã, origem e preparo ({condicoes.length})</Button>
            {mostrarCondicoes && condicoes.map(item => <div key={item.id} className="flex items-start gap-3">
              <Switch id={`${id}-condicao-${item.id}`} checked={confirmacoes.has(item.id)} onCheckedChange={checked => setSelecao(trocarPoder({ ...selecao, confirmacoes: checked ? [...selecao.confirmacoes, item.id] : selecao.confirmacoes.filter(pid => pid !== item.id) }, '', ''))} />
              <Label htmlFor={`${id}-condicao-${item.id}`} className="flex flex-col gap-1 text-xs"><span>{item.nome}</span><span className="text-muted-foreground">Confirmo: {requisitosItem(item.id).condicao}</span></Label>
            </div>)}
          </div>}
        </>}
        {erro && <p role="status" className="text-sm text-destructive">{erro}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
          <Button type="button" disabled={!!erro} onClick={() => { if (selecao) { onChange(selecao); setAberto(false) } }}>Usar seleção</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ResumoRecursosSobrenaturais({ recursos }: { recursos?: RecursosSobrenaturais }) {
  if (!recursos) return null
  const grupos = [{ rotulo: 'Poderes', ids: recursos.poderes }, ...TIPOS_RITUAIS.map(tipo => ({ rotulo: ROTULO_RITUAL[tipo], ids: recursos[CAMPO_SOBRENATURAL[tipo]] }))].filter(g => g.ids.length)
  if (!grupos.length) return null
  return <Dialog>
    <DialogTrigger asChild><Button type="button" variant="outline" size="sm">Poderes e Rituais ({grupos.reduce((total, g) => total + g.ids.length, 0)})</Button></DialogTrigger>
    <DialogContent className="max-h-dvh overflow-y-auto">
      <DialogHeader><DialogTitle className="font-serif text-xl">Poderes deste Inimigo</DialogTitle><DialogDescription>Seleção individual para este Combate. Toque em um item para consultar as regras.</DialogDescription></DialogHeader>
      {grupos.map(g => <section key={g.rotulo} className="flex flex-col gap-2"><h2 className="font-serif text-base">{g.rotulo}</h2>{g.ids.map(pid => { const item = itemCatalogo(pid); return <TermoRegra key={pid} tipo="catalogo" id={pid} className="self-start text-sm">{item?.nome ?? pid}{item && 'nivel' in item ? ` · nível ${item.nivel}` : ''}</TermoRegra> })}</section>)}
    </DialogContent>
  </Dialog>
}
