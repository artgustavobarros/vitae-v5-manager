import { BadgeEspecial } from '#/components/badge-especial'
import type { DificuldadeGeral } from '#/domain/dificuldade-antagonista'

export function ChipDificuldadeAntagonista({ dificuldade }: { dificuldade: DificuldadeGeral | null }) {
  if (!dificuldade) return null
  const { forte, normal } = dificuldade
  const valor = normal === null ? `${forte}` : `${forte}/${normal}`
  const descricao = normal === null
    ? `Dificuldade fixa de **${forte} sucessos** para enfrentar este antagonista no modo simplificado.`
    : `**${forte} sucessos** nas áreas em que o antagonista se destaca; **${normal} sucessos** nos demais testes.`
  return <BadgeEspecial className="w-fit" nome={`Dificuldade ${valor}`} descricao={`${descricao}\n\nSubstitui a rolagem de oposição do antagonista. São sucessos necessários, não quantidade de dados.`} />
}
