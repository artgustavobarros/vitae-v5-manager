import { VisaoJogador } from '#/components/combate/visao-jogador'
import { CarrosselCombate } from '#/components/combate/carrossel-combate'
import type { CombateVisivel } from '#/domain/combate'

export function CombatePublico({ combate }: { combate: CombateVisivel | null }) {
  return <VisaoJogador combate={combate} publico ContainerParticipantes={CarrosselCombate} />
}
