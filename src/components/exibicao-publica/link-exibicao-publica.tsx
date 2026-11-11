import { Copy, ExternalLink, Monitor } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { consultarLinkPublico, gerarLinkPublico, revogarLinkPublico } from '#/server/exibicao-publica'

export function LinkExibicaoPublica({ recurso }: { recurso: 'combate' | 'relogios' }) {
  const [aberto, setAberto] = useState(false)
  const [ativo, setAtivo] = useState(false)
  const [url, setUrl] = useState('')
  const [ocupado, setOcupado] = useState(false)

  async function executar(acao: () => Promise<void>) {
    setOcupado(true)
    try { await acao() }
    catch (erro) { toast.error(erro instanceof Error ? erro.message : 'Não foi possível alterar o link público.') }
    finally { setOcupado(false) }
  }

  function abrir() {
    setAberto(true)
    void executar(async () => { setAtivo(await consultarLinkPublico()) })
  }

  return (
    <>
      <Button variant="outline" onClick={abrir}><Monitor className="size-4" />Visão pública</Button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Exibição da mesa</DialogTitle>
            <DialogDescription>Quem tiver o link pode acompanhar Combate e Relógios sem entrar na conta. Ninguém pode editar por ele.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4" aria-busy={ocupado}>
            <p className="text-sm text-muted-foreground">
              {ativo ? 'Existe um link ativo. Gerar outro desconecta as telas abertas no link anterior.' : 'Nenhum link público ativo. Gere um para abrir em outra janela ou aparelho.'}
            </p>
            {url && <div className="space-y-2">
              <Label htmlFor="link-exibicao-publica">Link público</Label>
              <Input id="link-exibicao-publica" value={url} readOnly onFocus={(evento) => evento.currentTarget.select()} />
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" disabled={ocupado} onClick={() => {
                  void executar(async () => { await navigator.clipboard.writeText(url); toast.success('Link copiado') })
                }}><Copy className="size-4" />Copiar link</Button>
                <Button asChild variant="outline"><a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />Abrir visão pública</a></Button>
              </div>
            </div>}
            <p className="text-xs text-muted-foreground">O link dá acesso somente ao conteúdo público. Ao recarregar esta página, gere outro link se precisar copiá-lo novamente.</p>
          </div>
          <DialogFooter className="gap-2">
            {ativo && <Button variant="destructive" disabled={ocupado} onClick={() => {
              void executar(async () => { await revogarLinkPublico(); setAtivo(false); setUrl(''); toast.success('Link público revogado') })
            }}>Revogar link</Button>}
            <Button disabled={ocupado} onClick={() => {
              void executar(async () => {
                const { token } = await gerarLinkPublico()
                setUrl(`${window.location.origin}/publico/${token}/${recurso}`)
                setAtivo(true)
              })
            }}>{ocupado ? 'Aguarde…' : ativo ? 'Gerar novo link' : 'Gerar link'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
