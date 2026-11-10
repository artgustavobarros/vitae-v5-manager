import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '#/components/ui/dialog'
import type { AvisoRelogio } from '#/domain/relogios'
import { enfileirarAvisosRelogios } from '#/lib/avisos-relogios'

const ContextoAvisos = createContext<((avisos: AvisoRelogio[]) => void) | null>(null)

/** A fila continua entre páginas e mostra cada entrada/saída de efeito separadamente. */
export function ProvedorAvisosRelogios({ children }: { children: ReactNode }) {
  const [fila, setFila] = useState<AvisoRelogio[]>([])
  const receber = useCallback((avisos: AvisoRelogio[]) => {
    setFila((anteriores) => enfileirarAvisosRelogios(anteriores, avisos))
  }, [])
  const aviso = fila[0]
  function fechar() { setFila((anteriores) => anteriores.slice(1)) }

  return (
    <ContextoAvisos value={receber}>
      {children}
      <Dialog open={Boolean(aviso)} onOpenChange={(aberto) => { if (!aberto) fechar() }}>
        <DialogContent key={aviso?.id} className="max-h-dvh overflow-y-auto gap-6 sm:max-w-3xl sm:p-8" showCloseButton={false}>
          <DialogHeader>
            <p className="break-words text-base text-muted-foreground">{aviso?.nomeRelogio}</p>
            <DialogTitle className="break-words font-serif text-2xl sm:text-4xl">{aviso?.titulo}</DialogTitle>
            <DialogDescription className="text-base">{aviso?.ativo ? 'Efeito ativado' : 'Efeito desativado'}</DialogDescription>
          </DialogHeader>
          {aviso?.tendencia && (
            <Badge variant="outline" className={`text-base ${aviso.tendencia === 'piora' ? 'text-relogio-perigo' : 'text-relogio-tranquilo'}`}>
              {aviso.tendencia === 'piora' ? <TrendingUp /> : <TrendingDown />}
              {aviso.tendencia === 'piora' ? 'Perigo aumentando' : 'Perigo diminuindo'}
            </Badge>
          )}
          <p className="whitespace-pre-wrap break-words text-xl leading-relaxed">{aviso?.texto}</p>
          <DialogFooter>
            {fila.length > 1 && <p className="mr-auto text-base text-muted-foreground">Mais {fila.length - 1} aviso(s)</p>}
            <Button size="lg" className="text-base" onClick={fechar}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ContextoAvisos>
  )
}

export function useAvisosRelogios() { return useContext(ContextoAvisos) }
