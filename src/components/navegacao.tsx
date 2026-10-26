import { Link, type LinkOptions, type LinkProps } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useState } from 'react'

import { MarcaVitae } from './marca-vitae'

import { Button } from '#/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '#/components/ui/sheet'
import type { Papel } from '#/domain/acesso'

type ItemNavegacao = { rotulo: string; to: LinkProps['to'] }

/** Ação da tela atual, como "Editar" na Ficha: botão no header ou item do hambúrguer conforme o espaço disponível. */
export type AcaoTela = { rotulo: string; link: LinkOptions }

const ITENS: Record<Papel, ItemNavegacao[]> = {
  narrador: [
    { rotulo: 'Painel', to: '/' },
    { rotulo: 'Combate', to: '/combate' },
    { rotulo: 'Rolagens', to: '/narrador/rolagens' },
    { rotulo: 'Paradas', to: '/paradas' },
    { rotulo: 'Bestiário', to: '/narrador/bestiario' },
    { rotulo: 'Personagens', to: '/narrador/personagens' },
    { rotulo: 'Coteries', to: '/narrador/coteries' },
    { rotulo: 'Jogadores', to: '/narrador/convites' },
    { rotulo: 'Crônica', to: '/narrador/cronica' },
  ],
  jogador: [
    { rotulo: 'Meus Personagens', to: '/' },
    { rotulo: 'Paradas', to: '/paradas' },
    { rotulo: 'Coteries', to: '/coteries' },
    { rotulo: 'Combate', to: '/combate' },
  ],
}

/** Links inline a partir de `lg` para o Jogador e de `xl` para o menu maior do Narrador. */
export function NavegacaoInline({ papel }: { papel: Papel }) {
  return (
    <nav aria-label="Principal" className={`hidden items-center gap-1 ${papel === 'narrador' ? 'xl:flex' : 'lg:flex'}`}>
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
        </Link>
      ))}
    </nav>
  )
}

/** Os mesmos links num Sheet abaixo do breakpoint da navegação inline de cada papel. */
export function NavegacaoMenu({ papel, acoes = [] }: { papel: Papel; acoes?: AcaoTela[] }) {
  const [aberto, setAberto] = useState(false)

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className={`-mr-2 size-12 ${papel === 'narrador' ? 'xl:hidden' : 'lg:hidden'}`} aria-label="Abrir menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="gap-0">
        <SheetHeader className="border-b">
          <SheetTitle aria-label="Vitae"><MarcaVitae /></SheetTitle>
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
