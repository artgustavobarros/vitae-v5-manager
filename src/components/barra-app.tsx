import { Link, useRouteContext } from '@tanstack/react-router'

import { MenuUsuario } from './menu-usuario'
import { NavegacaoInline, NavegacaoMenu, type AcaoTela } from './navegacao'
import { SinoConectado } from './notificacoes/sino-conectado'
import { Button } from './ui/button'

/**
 * Barra do topo: marca Umbra e a navegação por papel à esquerda;
 * à direita, as ações da tela, o sino e o menu de quem está logado.
 * Abaixo de `lg` para o Jogador ou `xl` para o Narrador, navegação e ações vão para o hambúrguer.
 */
export function BarraApp({ acoes = [] }: { acoes?: AcaoTela[] }) {
  const { usuario } = useRouteContext({ from: '__root__' })

  return (
    <header className="flex h-14 items-center justify-between gap-2">
      <div className="flex items-center gap-4">
        <Link to="/" className="rounded-sm font-serif text-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Umbra
        </Link>
        {usuario && <NavegacaoInline papel={usuario.papel} />}
      </div>
      <div className="flex min-w-0 items-center gap-1">
        {acoes.map((acao) => (
          <Button key={acao.rotulo} asChild variant="secondary" size="sm" className={`hidden ${usuario?.papel === 'narrador' ? 'xl:inline-flex' : 'lg:inline-flex'}`}>
            <Link {...acao.link}>{acao.rotulo}</Link>
          </Button>
        ))}
        {usuario && <SinoConectado />}
        {usuario && <MenuUsuario usuario={usuario} />}
        {usuario && <NavegacaoMenu papel={usuario.papel} acoes={acoes} />}
      </div>
    </header>
  )
}
