export function MarcaVitae({ tamanho = 'padrao' }: { tamanho?: 'padrao' | 'grande' }) {
  const grande = tamanho === 'grande'

  return (
    <span
      className={`font-sans font-medium leading-none tracking-tight ${grande ? 'text-display' : 'text-xl'}`}
      aria-hidden="true"
    >
      <span className="text-vinho">V</span>
      <span className="text-foreground">itæ</span>
    </span>
  )
}
