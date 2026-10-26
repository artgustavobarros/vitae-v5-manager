import { z } from 'zod'

import { casaBusca } from './catalogo/busca'
import type { Papel } from './acesso'
import { ATRIBUTOS, HABILIDADES, type Ficha, type Grupo } from './ficha'

export const paradaPersonalizadaSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().trim().min(1, 'Dê um nome à Parada').max(80, 'Use até 80 caracteres'),
  atributo: z.enum(ATRIBUTOS.map((a) => a.id)),
  habilidade: z.enum(HABILIDADES.map((h) => h.id)),
})

export type ParadaPersonalizada = z.infer<typeof paradaPersonalizadaSchema>
export type ParadaCalculada = ParadaPersonalizada & {
  grupo: Grupo
  atributoNome: string
  atributoValor: number
  habilidadeNome: string
  habilidadeValor: number
  total: number
  personalizada: boolean
}

/** Sugestões de abordagem; o Narrador escolhe a combinação adequada à cena. */
export const PARADAS_PADRAO: readonly ParadaPersonalizada[] = [
  { id: 'padrao-intimidar-presenca', nome: 'Intimidar pela presença', atributo: 'carisma', habilidade: 'intimidacao' },
  { id: 'padrao-intimidar-ameacas', nome: 'Intimidar com ameaças', atributo: 'manipulacao', habilidade: 'intimidacao' },
  { id: 'padrao-convencer', nome: 'Convencer', atributo: 'carisma', habilidade: 'persuasao' },
  { id: 'padrao-enganar', nome: 'Enganar', atributo: 'manipulacao', habilidade: 'subterfugio' },
  { id: 'padrao-ler-intencoes', nome: 'Ler intenções', atributo: 'raciocinio', habilidade: 'sagacidade' },
  { id: 'padrao-socializar', nome: 'Circular em sociedade', atributo: 'carisma', habilidade: 'etiqueta' },
  { id: 'padrao-perceber', nome: 'Perceber perigo', atributo: 'raciocinio', habilidade: 'percepcao' },
  { id: 'padrao-investigar', nome: 'Investigar pistas', atributo: 'inteligencia', habilidade: 'investigacao' },
  { id: 'padrao-ocultismo', nome: 'Reconhecer o sobrenatural', atributo: 'inteligencia', habilidade: 'ocultismo' },
  { id: 'padrao-medicina', nome: 'Prestar primeiros socorros', atributo: 'raciocinio', habilidade: 'medicina' },
  { id: 'padrao-furtividade', nome: 'Mover-se sem ser visto', atributo: 'destreza', habilidade: 'furtividade' },
  { id: 'padrao-esquivar', nome: 'Esquivar', atributo: 'destreza', habilidade: 'atletismo' },
  { id: 'padrao-brigar', nome: 'Lutar desarmado', atributo: 'forca', habilidade: 'briga' },
  { id: 'padrao-armas-brancas', nome: 'Atacar com arma branca', atributo: 'forca', habilidade: 'armas-brancas' },
  { id: 'padrao-atirar', nome: 'Atirar com precisão', atributo: 'autocontrole', habilidade: 'armas-de-fogo' },
  { id: 'padrao-arrombar', nome: 'Abrir fechadura', atributo: 'destreza', habilidade: 'ladroagem' },
  { id: 'padrao-dirigir', nome: 'Manobrar um veículo', atributo: 'destreza', habilidade: 'conducao' },
]

export function listarParadas(ficha: Ficha, personalizadas: readonly ParadaPersonalizada[], ordem: readonly string[] = []): ParadaCalculada[] {
  const calculadas = [...PARADAS_PADRAO, ...personalizadas].map((parada, indice) => {
    const atributoValor = ficha.atributos[parada.atributo]
    const habilidadeValor = ficha.habilidades[parada.habilidade].valor
    const habilidade = HABILIDADES.find((h) => h.id === parada.habilidade)!
    return {
      ...parada,
      atributoNome: ATRIBUTOS.find((a) => a.id === parada.atributo)!.nome,
      atributoValor,
      habilidadeNome: habilidade.nome,
      grupo: habilidade.grupo,
      habilidadeValor,
      total: atributoValor + habilidadeValor,
      personalizada: indice >= PARADAS_PADRAO.length,
    }
  })
  return ordenarParadas(calculadas, ordem)
}

export function ordenarParadas<T extends { id: string }>(paradas: readonly T[], ordem: readonly string[]): T[] {
  const restantes = new Map(paradas.map((p) => [p.id, p]))
  const ordenadas: T[] = []
  for (const id of ordem) {
    const parada = restantes.get(id)
    if (parada) {
      ordenadas.push(parada)
      restantes.delete(id)
    }
  }
  return [...ordenadas, ...restantes.values()]
}

export type TipoParadas = Grupo | 'todos'

export function encontrarParadasRepetidas(compartilhadas: readonly ParadaPersonalizada[], entrada: ParadaPersonalizada): ParadaPersonalizada[] {
  return [...PARADAS_PADRAO, ...compartilhadas].filter((p) =>
    p.id !== entrada.id && p.atributo === entrada.atributo && p.habilidade === entrada.habilidade,
  )
}

export function podeGerenciarParada(usuario: { id: string; papel: Papel }, criadoPorId: string | null): boolean {
  return usuario.papel === 'narrador' || criadoPorId === usuario.id
}

export function reordenarParadas(paradas: readonly { id: string }[], origemId: string, destinoId: string): string[] {
  const ids = paradas.map((p) => p.id)
  const origem = ids.indexOf(origemId)
  const destino = ids.indexOf(destinoId)
  if (origem < 0 || destino < 0) throw new Error('Parada não encontrada')
  ids.splice(origem, 1)
  ids.splice(destino, 0, origemId)
  return ids
}

export function filtrarParadas(paradas: readonly ParadaCalculada[], tipo: TipoParadas, busca = ''): ParadaCalculada[] {
  return paradas.filter((p) =>
    (tipo === 'todos' || p.grupo === tipo) && casaBusca(busca, [p.nome, p.atributoNome, p.habilidadeNome]),
  )
}
