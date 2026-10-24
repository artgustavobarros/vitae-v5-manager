import { useNavigate, useRouter } from '@tanstack/react-router'
import { LogOut, Settings } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { authClient } from '#/lib/auth-client'
import type { Usuario } from '#/server/sessao'

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

/** Avatar e primeiro nome de quem está logado; o menu mostra o e-mail e "Sair". */
export function MenuUsuario({ usuario }: { usuario: Usuario }) {
  const router = useRouter()
  const navigate = useNavigate()
  const primeiroNome = usuario.nome.trim().split(/\s+/)[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="-mr-2 h-12 gap-2 px-2" aria-label={`Conta de ${usuario.nome}`}>
          <Avatar className="size-8">
            {usuario.imagem && <AvatarImage src={usuario.imagem} alt="" referrerPolicy="no-referrer" />}
            <AvatarFallback className="text-xs">{iniciais(usuario.nome)}</AvatarFallback>
          </Avatar>
          <span className="max-w-24 truncate text-sm">{primeiroNome}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm">{usuario.nome}</span>
          {/* Conta por nome de usuário tem e-mail sintético, que nunca aparece. */}
          <span className="block truncate text-xs text-muted-foreground">
            {usuario.nomeUsuario ? `@${usuario.nomeUsuario}` : usuario.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void navigate({ to: '/conta' })}>
          <Settings aria-hidden />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={async () => {
            await authClient.signOut()
            await navigate({ to: '/entrar' })
            await router.invalidate()
          }}
        >
          <LogOut aria-hidden />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
