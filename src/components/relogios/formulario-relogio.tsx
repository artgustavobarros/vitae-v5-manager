import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { configuracaoRelogioSchema, type ConfiguracaoRelogio } from '#/domain/relogios'

export function FormularioRelogio({ dados, onChange, novo, ocupado, onSalvar, onFechar }: {
  dados: ConfiguracaoRelogio; onChange: (dados: ConfiguracaoRelogio) => void; novo: boolean; ocupado: boolean
  onSalvar: (dados: ConfiguracaoRelogio) => Promise<void>; onFechar: () => void
}) {
  function campo<K extends keyof ConfiguracaoRelogio>(nome: K, valor: ConfiguracaoRelogio[K]) { onChange({ ...dados, [nome]: valor }) }

  async function enviar(event: React.FormEvent) {
    event.preventDefault()
    const validacao = configuracaoRelogioSchema.safeParse(dados)
    if (!validacao.success) {
      toast.error(validacao.error.issues[0].message)
      return
    }
    await onSalvar(validacao.data)
  }

  return (
    <Dialog open onOpenChange={(aberto) => { if (!aberto && !ocupado) onFechar() }}>
      <DialogContent className="max-h-dvh overflow-y-auto" showCloseButton={!ocupado}>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{novo ? 'Novo Relógio' : 'Editar Relógio'}</DialogTitle>
          <DialogDescription>Defina o título e as etapas. Só o Narrador pode alterar o Relógio.</DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="min-w-0 space-y-6">
          <fieldset disabled={ocupado} className="min-w-0 space-y-4">
            <legend className="sr-only">Configuração do Relógio</legend>
            <div className="space-y-2">
              <Label htmlFor="relogio-nome">Título</Label>
              <Input id="relogio-nome" required maxLength={120} value={dados.nome} placeholder="Suspeita da Segunda Inquisição"
                onChange={(event) => campo('nome', event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relogio-titulo-publico">Título público (opcional)</Label>
              <Input id="relogio-titulo-publico" maxLength={120} value={dados.tituloPublico ?? ''}
                aria-describedby="relogio-titulo-publico-ajuda"
                onChange={(event) => campo('tituloPublico', event.target.value)} />
              <p id="relogio-titulo-publico-ajuda" className="text-sm text-muted-foreground">
                Jogadores e o link público usam este título. Se ficar vazio, usam o título acima.
              </p>
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
            <div className="flex items-center gap-3">
              <Switch id="relogio-visivel" checked={dados.visivel} disabled={ocupado} onCheckedChange={(valor) => campo('visivel', valor)} />
              <Label htmlFor="relogio-visivel">Visível para o público</Label>
            </div>
          </fieldset>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={ocupado} onClick={onFechar}>Cancelar</Button>
            <Button type="submit" disabled={ocupado}>{ocupado ? 'Salvando…' : 'Salvar Relógio'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
