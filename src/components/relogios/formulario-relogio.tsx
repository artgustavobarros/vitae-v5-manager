import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Combobox } from '#/components/combobox'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader } from '#/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { Textarea } from '#/components/ui/textarea'
import { Tabs, TabsContent } from '#/components/ui/tabs'
import { relogioSchema, type EfeitoRelogio, type Relogio } from '#/domain/relogios'
import { AbasEfeitosRelogio } from './abas-efeitos-relogio'

const TIPOS = ['Ameaça', 'Objetivo', 'Prazo', 'Disputa'].map((valor) => ({ valor, rotulo: valor }))
const PERIGO = [{ valor: 'aumenta', rotulo: 'O valor aumenta' }, { valor: 'diminui', rotulo: 'O valor diminui' }]
const CONDICOES = [{ valor: 'a_partir_de', rotulo: 'Nesta etapa ou acima' }, { valor: 'ate', rotulo: 'Nesta etapa ou abaixo' }]

export function FormularioRelogio({ dados, onChange, novo, ocupado, onSalvar, onFechar }: {
  dados: Relogio; onChange: (dados: Relogio) => void; novo: boolean; ocupado: boolean
  onSalvar: (dados: Relogio) => Promise<void>; onFechar: () => void
}) {
  const [efeitoSelecionado, setEfeitoSelecionado] = useState<string | null>(null)
  const efeitoAtual = dados.efeitos.some((efeito) => efeito.id === efeitoSelecionado)
    ? efeitoSelecionado ?? undefined : dados.efeitos[0]?.id

  function campo<K extends keyof Relogio>(nome: K, valor: Relogio[K]) { onChange({ ...dados, [nome]: valor }) }
  function alterarEfeito(id: string, valores: Partial<EfeitoRelogio>) {
    campo('efeitos', dados.efeitos.map((efeito) => efeito.id === id ? { ...efeito, ...valores } : efeito))
  }
  function adicionarEfeito() {
    const id = crypto.randomUUID()
    campo('efeitos', [...dados.efeitos, {
      id, titulo: '', condicao: 'a_partir_de', etapa: dados.total,
      textoAtivacao: '', textoDesativacao: '',
    }])
    setEfeitoSelecionado(id)
  }
  function removerEfeito(indice: number) {
    const restantes = dados.efeitos.filter((_, posicao) => posicao !== indice)
    campo('efeitos', restantes)
    setEfeitoSelecionado(restantes[Math.min(indice, restantes.length - 1)]?.id ?? null)
  }
  async function enviar(event: React.FormEvent) {
    event.preventDefault()
    const validacao = relogioSchema.safeParse(dados)
    if (!validacao.success) {
      const erro = validacao.error.issues[0]
      const indice = erro.path[0] === 'efeitos' && typeof erro.path[1] === 'number' ? erro.path[1] : undefined
      if (indice !== undefined) setEfeitoSelecionado(dados.efeitos[indice]?.id ?? null)
      toast.error(indice === undefined ? erro.message : `Efeito ${indice + 1}: ${erro.message}`)
      return
    }
    await onSalvar(validacao.data)
  }

  return (
    <Dialog open onOpenChange={(aberto) => { if (!aberto && !ocupado) onFechar() }}>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-w-4xl sm:p-8 [&_label]:text-base [&_input]:md:text-base [&_textarea]:md:text-base [&_button]:text-base" showCloseButton={!ocupado}>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{novo ? 'Novo Relógio' : 'Editar Relógio'}</DialogTitle>
          <DialogDescription className="text-base">O Narrador controla as etapas. Zero e o limite não retiram o Relógio.</DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="min-w-0 space-y-6">
          <fieldset disabled={ocupado} className="min-w-0 space-y-4">
            <legend className="sr-only">Configuração do Relógio</legend>
            <div className="space-y-2">
              <Label htmlFor="relogio-nome">Nome</Label>
              <Input id="relogio-nome" required maxLength={120} value={dados.nome} placeholder="Suspeita da Segunda Inquisição"
                onChange={(event) => campo('nome', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relogio-tipo">Tipo de evento</Label>
              <Combobox id="relogio-tipo" rotulo="Tipo de evento" opcoes={TIPOS} valor={dados.tipo} permiteCriar disabled={ocupado}
                onChange={(tipo) => campo('tipo', tipo)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relogio-descricao">Descrição (opcional)</Label>
              <Textarea id="relogio-descricao" value={dados.descricao} maxLength={2000}
                onChange={(event) => campo('descricao', event.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relogio-total">Total de etapas</Label>
                <Input id="relogio-total" type="number" inputMode="numeric" min={1} max={100} step={1} required value={dados.total}
                  onChange={(event) => campo('total', Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relogio-atual">{novo ? 'Etapa inicial' : 'Etapa atual'}</Label>
                <Input id="relogio-atual" type="number" inputMode="numeric" min={0} max={dados.total} step={1} required value={dados.atual}
                  onChange={(event) => campo('atual', Number(event.target.value))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="relogio-perigo">O perigo aumenta quando…</Label>
              <Combobox id="relogio-perigo" rotulo="O perigo aumenta quando" opcoes={PERIGO} valor={dados.perigo} disabled={ocupado}
                onChange={(valor) => campo('perigo', valor === 'aumenta' ? 'aumenta' : 'diminui')} />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="relogio-visivel" checked={dados.visivel} disabled={ocupado} onCheckedChange={(valor) => campo('visivel', valor)} />
              <Label htmlFor="relogio-visivel">Visível para todos os Jogadores</Label>
            </div>
          </fieldset>
          <section className="space-y-4" aria-labelledby="efeitos-titulo">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="efeitos-titulo" className="font-serif text-xl">Efeitos</h2>
              <Button type="button" variant="outline" disabled={ocupado || dados.efeitos.length >= 30} onClick={adicionarEfeito}>
                <Plus className="size-4" />Adicionar efeito
              </Button>
            </div>
            <p className="text-base text-muted-foreground">Cada efeito fica ativo enquanto sua condição valer. Entrar ou sair mostra o texto correspondente para todos que veem o Relógio.</p>
            {dados.efeitos.length > 0 && <Tabs className="min-w-0" value={efeitoAtual} onValueChange={setEfeitoSelecionado}>
              <AbasEfeitosRelogio efeitos={dados.efeitos} selecionado={efeitoAtual} ocupado={ocupado} />
            {dados.efeitos.map((efeito, indice) => (
              <TabsContent key={efeito.id} value={efeito.id}>
              <Card className="gap-4">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <h3 className="text-base font-semibold">Efeito {indice + 1}</h3>
                  <Button type="button" variant="ghost" size="icon-lg" aria-label={`Remover efeito ${indice + 1}`} disabled={ocupado}
                    onClick={() => removerEfeito(indice)}><Trash2 className="size-4" /></Button>
                </CardHeader>
                <CardContent>
                  <fieldset disabled={ocupado} className="min-w-0 space-y-4">
                    <legend className="sr-only">Efeito {indice + 1}</legend>
                    <div className="space-y-2">
                      <Label htmlFor={`${efeito.id}-titulo`}>Título do efeito</Label>
                      <Input id={`${efeito.id}-titulo`} required maxLength={120} value={efeito.titulo}
                        onChange={(event) => alterarEfeito(efeito.id, { titulo: event.target.value })} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`${efeito.id}-etapa`}>Etapa do efeito</Label>
                        <Input id={`${efeito.id}-etapa`} type="number" inputMode="numeric" min={0} max={dados.total} step={1} required value={efeito.etapa}
                          onChange={(event) => alterarEfeito(efeito.id, { etapa: Number(event.target.value) })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${efeito.id}-condicao`}>Ativo quando estiver…</Label>
                        <Combobox id={`${efeito.id}-condicao`} rotulo={`Condição do efeito ${indice + 1}`} opcoes={CONDICOES} valor={efeito.condicao} disabled={ocupado}
                          onChange={(valor) => alterarEfeito(efeito.id, { condicao: valor === 'ate' ? 'ate' : 'a_partir_de' })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${efeito.id}-entrada`}>Texto ao ativar</Label>
                      <Textarea id={`${efeito.id}-entrada`} required maxLength={2000} value={efeito.textoAtivacao}
                        placeholder="Ninguém da cidade consegue dormir."
                        onChange={(event) => alterarEfeito(efeito.id, { textoAtivacao: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${efeito.id}-saida`}>Texto ao desativar</Label>
                      <Textarea id={`${efeito.id}-saida`} required maxLength={2000} value={efeito.textoDesativacao}
                        placeholder="Algumas pessoas voltaram a dormir."
                        onChange={(event) => alterarEfeito(efeito.id, { textoDesativacao: event.target.value })} />
                    </div>
                  </fieldset>
                </CardContent>
              </Card>
              </TabsContent>
            ))}
            </Tabs>}
          </section>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={ocupado} onClick={onFechar}>Cancelar</Button>
            <Button type="submit" disabled={ocupado}>{ocupado ? 'Salvando…' : 'Salvar Relógio'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
