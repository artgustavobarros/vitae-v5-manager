import { Link, type LinkOptions, type LinkProps } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '#/components/ui/sheet'
import type { Papel } from '#/domain/acesso'
import { contarRevisoesPendentes } from '#/server/revisao'

type ItemNavegacao = { rotulo: string; to: LinkProps['to'] }

/** Ação da tela atual, como "Editar" na Ficha: botão no header em `lg`+, item do hambúrguer abaixo. */
export type AcaoTela = { rotulo: string; link: LinkOptions }

const ITENS: Record<Papel, ItemNavegacao[]> = {
  narrador: [
    { rotulo: 'Painel', to: '/' },
    { rotulo: 'Personagens', to: '/narrador/personagens' },
    { rotulo: 'Coteries', to: '/narrador/coteries' },
    { rotulo: 'Jogadores', to: '/narrador/convites' },
    { rotulo: 'Crônica', to: '/narrador/cronica' },
    { rotulo: 'Revisão', to: '/catalogo/revisao' },
  ],
  jogador: [
    { rotulo: 'Meus Personagens', to: '/' },
    { rotulo: 'Coteries', to: '/coteries' },
  ],
}

/** Itens do Catálogo que o Narrador ainda não aprovou nem sugeriu; aparece ao lado de "Revisão". */
function usePendentesRevisao(papel: Papel): number {
  const [pendentes, setPendentes] = useState(0)
  useEffect(() => {
    if (papel !== 'narrador') return
    const atualizar = () => {
      contarRevisoesPendentes()
        .then(setPendentes)
        .catch(() => setPendentes(0))
    }
    atualizar()
    window.addEventListener('revisao-atualizada', atualizar)
    return () => window.removeEventListener('revisao-atualizada', atualizar)
  }, [papel])
  return pendentes
}

function Contador({ item, pendentes }: { item: ItemNavegacao; pendentes: number }) {
  if (item.to !== '/catalogo/revisao' || pendentes === 0) return null
  return (
    <Badge variant="secondary" className="ml-2 tabular-nums" aria-label={`${pendentes} pendentes`}>
      {pendentes}
    </Badge>
  )
}

/** Links principais inline no header, de `lg` para cima. */
export function NavegacaoInline({ papel }: { papel: Papel }) {
  const pendentes = usePendentesRevisao(papel)
  return (
    <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
      {ITENS[papel].map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: true }}
          className="flex h-12 items-center rounded-md px-4 text-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          // A cor fica só em active/inactive: as duas na mesma className brigam pela ordem do CSS.
          activeProps={{ className: 'text-foreground font-semibold', 'aria-current': 'page' }}
          inactiveProps={{ className: 'text-muted-foreground' }}
        >
          {item.rotulo}
          <Contador item={item} pendentes={pendentes} />
        </Link>
      ))}
    </nav>
  )
}

/** Abaixo de `lg` (tablet e celular), os mesmos links num Sheet aberto pelo hambúrguer. */
export function NavegacaoMenu({ papel, acoes = [] }: { papel: Papel; acoes?: AcaoTela[] }) {
  const [aberto, setAberto] = useState(false)
  const pendentes = usePendentesRevisao(papel)

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="-mr-2 size-12 lg:hidden" aria-label="Abrir menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="gap-0">
        <SheetHeader className="border-b">
          <SheetTitle className="font-serif text-2xl">Umbra</SheetTitle>
          <SheetDescription className="sr-only">Navegação principal</SheetDescription>
        </SheetHeader>
        <nav aria-label="Principal" className="flex flex-col gap-2 px-2 py-4">
          {ITENS[papel].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              onClick={() => setAberto(false)}
              className="flex h-12 items-center rounded-md px-3 text-base outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
              activeProps={{ className: 'bg-accent font-semibold', 'aria-current': 'page' }}
            >
              {item.rotulo}
              <Contador item={item} pendentes={pendentes} />
            </Link>
          ))}
        </nav>
        {acoes.length > 0 && (
          <section aria-labelledby="acoes-tela" className="flex flex-col gap-2 border-t px-2 py-4">
            <h2 id="acoes-tela" className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nesta tela
            </h2>
            <div className="flex flex-col gap-2">
              {acoes.map((acao) => (
                <Link
                  key={acao.rotulo}
                  {...acao.link}
                  onClick={() => setAberto(false)}
                  className="flex h-12 items-center rounded-md px-3 text-base outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {acao.rotulo}
                </Link>
              ))}
            </div>
          </section>
        )}
      </SheetContent>
    </Sheet>
  )
}
