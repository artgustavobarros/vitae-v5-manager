import { VisaoPublicaCombate } from '#/components/combate/apresentacao'
import { CarrosselCombate } from '#/components/combate/carrossel-combate'
import type { CombateVisivel } from '#/domain/combate'

export function CombatePublico({ combate }: { combate: CombateVisivel | null }) {
  return <VisaoPublicaCombate combate={combate} ContainerParticipantes={CarrosselCombate} />
}
