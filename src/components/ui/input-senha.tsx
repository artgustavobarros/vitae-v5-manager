import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'

export function InputSenha({ className, ...props }: React.ComponentProps<typeof Input>) {
  const [visivel, setVisivel] = React.useState(false)

  return (
    <div className="relative flex items-center">
      <Input
        type={visivel ? 'text' : 'password'}
        className={cn('pr-10', className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setVisivel(!visivel)}
        aria-label={visivel ? 'Ocultar senha' : 'Ver senha'}
        className="absolute right-0 h-9 w-9 text-muted-foreground hover:bg-transparent hover:text-foreground"
      >
        {visivel ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  )
}
