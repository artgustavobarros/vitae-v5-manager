import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { iniciais } from '#/domain/acesso'

export { iniciais }

/**
 * Avatar do usuário: foto da conta Google se houver; se não tiver, exibe as iniciais.
 */
export function AvatarUsuario({
  nome,
  imagem,
  className = 'size-8',
}: {
  nome: string
  imagem?: string | null
  className?: string
}) {
  return (
    <Avatar className={className}>
      {imagem && <AvatarImage src={imagem} alt="" referrerPolicy="no-referrer" />}
      <AvatarFallback className="text-xs">{iniciais(nome)}</AvatarFallback>
    </Avatar>
  )
}
