import { z } from 'zod'

import type { Dano } from './trilhas'

export const danoTrilhaSchema = z.object({
  superficial: z.int().min(0),
  agravado: z.int().min(0),
})

export const paradaExcepcionalCombateSchema = z.object({
  nome: z.string(),
  valor: z.int(),
})

export const paradaEspecialCombateSchema = paradaExcepcionalCombateSchema

export const especialCombateSchema = z.object({
  nome: z.string(),
  descricao: z.string().default(''),
})

export type EspecialCombate = z.infer<typeof especialCombateSchema>

export type CondicaoCombate = {
  id: string
  nome: string
  categoria: 'debuff' | 'buff' | 'estado'
  descricao: string
  efeitoMecanico: string
  classeCor: string
}

export const CONDICOES_COMBATE_V5: readonly CondicaoCombate[] = [
  {
    id: 'agarrado',
    nome: 'Agarrado',
    categoria: 'debuff',
    descricao: 'Preso em combate corpo a corpo pelo oponente.',
    efeitoMecanico: '-2 dados em todas as ações exceto tentar escapar ou disputar o agarrão (V5 p. 301).',
    classeCor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  },
  {
    id: 'caido',
    nome: 'Derrubado / Caído',
    categoria: 'debuff',
    descricao: 'No chão após ser derrubado ou arremessado.',
    efeitoMecanico: '-2 dados em ataques corpo a corpo e esquivas; ganha cobertura contra armas de fogo à distância (V5 p. 302).',
    classeCor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  },
  {
    id: 'imobilizado',
    nome: 'Imobilizado / Preso',
    categoria: 'debuff',
    descricao: 'Completamente imobilizado por amarras, algemas ou trava total.',
    efeitoMecanico: 'Incapaz de esquivar; defesas ativas impossibilitadas ou limitadas (V5 p. 301).',
    classeCor: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
  },
  {
    id: 'cego',
    nome: 'Cego / Visão Obscurecida',
    categoria: 'debuff',
    descricao: 'Cegueira temporária, escuridão sobrenatural ou fumaça densa.',
    efeitoMecanico: '-3 dados em paradas físicas e testes de percepção baseados em visão (V5 p. 302).',
    classeCor: 'bg-neutral-500/15 text-neutral-700 dark:text-neutral-300 border-neutral-500/30',
  },
  {
    id: 'em-chamas',
    nome: 'Em Chamas',
    categoria: 'debuff',
    descricao: 'O fogo consome o corpo do personagem.',
    efeitoMecanico: 'Sofre de 1 a 3 pontos de dano Agravado por turno; vampiros devem testar Rôtschreck (Frenesi de Medo) a cada turno (V5 p. 221).',
    classeCor: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
  },
  {
    id: 'estacado',
    nome: 'Estacado',
    categoria: 'debuff',
    descricao: 'Estaca de madeira perfurando o coração do vampiro.',
    efeitoMecanico: 'Paralisia total em torpor consciente; incapaz de qualquer ação física até remoção (V5 p. 221).',
    classeCor: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
  },
  {
    id: 'surpreendido',
    nome: 'Surpreendido',
    categoria: 'debuff',
    descricao: 'Apanhado de surpresa por emboscada ou ataque furtivo.',
    efeitoMecanico: 'Não pode realizar ações de ataque ou esquiva no turno da surpresa (V5 p. 300).',
    classeCor: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  },
  {
    id: 'frenesi',
    nome: 'Em Frenesi',
    categoria: 'estado',
    descricao: 'A Besta assumiu o controle total da mente do vampiro.',
    efeitoMecanico: 'Imune a penalidades de ferimento e estado Debilitado; ignora restrições mentais; foco cego na causa (V5 p. 219).',
    classeCor: 'bg-red-600/15 text-red-700 dark:text-red-400 border-red-600/30 font-semibold',
  },
  {
    id: 'sedado',
    nome: 'Sedado / Drogado',
    categoria: 'debuff',
    descricao: 'Sob efeito de narcóticos pesados, drogas no sangue ou veneno.',
    efeitoMecanico: '-2 dados em paradas físicas e mentais; dificuldade aumentada para permanecer desperto (V5 p. 310).',
    classeCor: 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30',
  },
  {
    id: 'atordoado',
    nome: 'Atordoado',
    categoria: 'debuff',
    descricao: 'Desorientado por forte choque físico, sonoro ou concussão.',
    efeitoMecanico: '-2 dados na próxima parada e perda de posicionamento.',
    classeCor: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
  },
  {
    id: 'cobertura',
    nome: 'Sob Cobertura',
    categoria: 'buff',
    descricao: 'Abrigado atrás de anteparo sólido ou barricada.',
    efeitoMecanico: '+1 a +4 dados adicionais na parada de defesa contra projéteis e armas de fogo (V5 p. 302).',
    classeCor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'ofuscado',
    nome: 'Ofuscado / Oculto',
    categoria: 'buff',
    descricao: 'Escondido pelas sombras ou camuflado por Ofuscação.',
    efeitoMecanico: 'Invisível a percepções normais; próximo ataque conta com benefício de surpresa (V5 p. 260).',
    classeCor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
  },
  {
    id: 'desacordado',
    nome: 'Desacordado / Incapacitado',
    categoria: 'estado',
    descricao: 'Inconsciente ou incapacitado de lutar.',
    efeitoMecanico: 'Fora de combate. Incapaz de agir ou se defender.',
    classeCor: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30 font-medium',
  },
  {
    id: 'morto',
    nome: 'Morto',
    categoria: 'estado',
    descricao: 'O corpo sucumbiu a ferimentos letais ou sofreu Morte Final.',
    efeitoMecanico: 'Falecido. Removido permanentemente da fila de combate.',
    classeCor: 'bg-destructive/20 text-destructive border-destructive/40 font-bold',
  },
  {
    id: 'torpor',
    nome: 'Torpor',
    categoria: 'estado',
    descricao: 'O vampiro entrou em sono comatoso após dano agravado total.',
    efeitoMecanico: 'Coma vampírico. Fora de combate até despertar.',
    classeCor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold',
  },
] as const

export function obterCondicaoCombate(id: string): CondicaoCombate | undefined {
  return CONDICOES_COMBATE_V5.find((c) => c.id === id)
}

export type EstadoSaude = 'saudavel' | 'escoriado' | 'ferido' | 'debilitado' | 'torpor' | 'morto'

export type InfoEstadoSaude = {
  estado: EstadoSaude
  rotulo: string
  descricao: string
  penalidade: string
  classeCor: string
}

export function calcularEstadoSaude(
  vitalidadeMax: number,
  dano: Dano,
  ehVampiro: boolean = true,
  condicoes?: readonly string[] | string[],
): InfoEstadoSaude {
  const max = Math.max(1, vitalidadeMax)
  const agravado = Math.min(dano.agravado, max)
  const superficial = Math.min(dano.superficial, max - agravado)
  const total = agravado + superficial

  if (condicoes?.includes('morto')) {
    return {
      estado: 'morto',
      rotulo: ehVampiro ? 'Morte Final' : 'Morto',
      descricao: ehVampiro
        ? 'O vampiro sucumbiu a dano letal permanente e sofreu a Morte Final.'
        : 'O corpo sucumbiu a ferimentos letais.',
      penalidade: 'Falecido',
      classeCor: 'bg-destructive/20 text-destructive border-destructive/40 font-bold',
    }
  }

  if (condicoes?.includes('torpor')) {
    return {
      estado: 'torpor',
      rotulo: 'Torpor',
      descricao: 'Vitalidade completamente preenchida com dano Agravado. O vampiro cai em torpor comatoso.',
      penalidade: 'Incapacitado',
      classeCor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold',
    }
  }

  if (condicoes?.includes('desacordado') || condicoes?.includes('incapacitado')) {
    return {
      estado: 'morto',
      rotulo: 'Incapacitado',
      descricao: 'Inconsciente ou incapaz de continuar lutando.',
      penalidade: 'Fora de combate',
      classeCor: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30 font-medium',
    }
  }

  if (agravado >= max) {
    if (ehVampiro) {
      return {
        estado: 'torpor',
        rotulo: 'Torpor',
        descricao: 'Vitalidade completamente preenchida com dano Agravado. O vampiro cai em torpor comatoso.',
        penalidade: 'Incapacitado',
        classeCor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold',
      }
    }
    return {
      estado: 'morto',
      rotulo: 'Incapacitado / Morto',
      descricao: 'Vitalidade completamente preenchida com dano Agravado. O corpo sucumbe a ferimentos letais.',
      penalidade: 'Incapacitado / Morto',
      classeCor: 'bg-destructive/20 text-destructive border-destructive/40 font-bold',
    }
  }

  if (total >= max) {
    return {
      estado: 'debilitado',
      rotulo: 'Debilitado (-2)',
      descricao: 'Trilha de Vitalidade cheia. Qualquer dano adicional sofrido converterá caixas superficiais em dano agravado.',
      penalidade: '-2 dados em todas as paradas físicas (V5 p. 126)',
      classeCor: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
    }
  }

  if (total >= Math.ceil(max / 2)) {
    return {
      estado: 'ferido',
      rotulo: 'Ferido',
      descricao: 'Dano substancial acumulado (metade ou mais da trilha de Vitalidade preenchida).',
      penalidade: 'Sem penalidade direta de dados',
      classeCor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    }
  }

  if (total > 0) {
    return {
      estado: 'escoriado',
      rotulo: 'Escoriado',
      descricao: 'Apenas escoriações ou ferimentos superficiais leves.',
      penalidade: 'Sem penalidades',
      classeCor: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
    }
  }

  return {
    estado: 'saudavel',
    rotulo: 'Saudável',
    descricao: 'Nenhum dano registrado na trilha de Vitalidade.',
    penalidade: 'Sem penalidades',
    classeCor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  }
}

export const participanteInimigoSchema = z.object({
  id: z.string(),
  tipo: z.literal('inimigo'),
  nome: z.string(),
  modeloId: z.string().uuid().nullable().optional(),
  categoria: z.string().optional(),
  vitalidadeMax: z.int().min(1),
  danoVitalidade: danoTrilhaSchema,
  vontadeMax: z.int().min(1),
  danoVontade: danoTrilhaSchema,
  paradas: z.object({
    fisico: z.int(),
    social: z.int(),
    mental: z.int(),
    excepcionais: z.array(paradaExcepcionalCombateSchema).default([]),
    especiais: z.array(paradaExcepcionalCombateSchema).optional(),
  }),
  especiais: z.array(especialCombateSchema).default([]),
  notas: z.string().default(''),
  revelarVitalidade: z.boolean().default(false),
  condicoes: z.array(z.string()).default([]),
})

export const participantePersonagemSchema = z.object({
  id: z.string(),
  tipo: z.literal('personagem'),
  nome: z.string(),
  personagemId: z.string().uuid(),
  ehPdn: z.boolean().default(false),
  condicoes: z.array(z.string()).default([]),
})

export const participanteCombateSchema = z.discriminatedUnion('tipo', [
  participantePersonagemSchema,
  participanteInimigoSchema,
])

export type ParticipanteInimigo = z.infer<typeof participanteInimigoSchema>
export type ParticipantePersonagem = z.infer<typeof participantePersonagemSchema>
export type ParticipanteCombate = z.infer<typeof participanteCombateSchema>

export const combateSchema = z.object({
  id: z.string().uuid(),
  rodada: z.int().min(1).default(1),
  turnoAtual: z.int().min(0).default(0),
  participantes: z.array(participanteCombateSchema).default([]),
  ativo: z.boolean().default(true),
})

export type Combate = z.infer<typeof combateSchema>

function cortarDano(dano: Dano, max: number): Dano {
  const agravado = Math.min(dano.agravado, max)
  const superficial = Math.min(dano.superficial, max - agravado)
  return { superficial, agravado }
}

export function iniciarCombate(
  participantes: ParticipanteCombate[],
  id: string = crypto.randomUUID(),
): Combate {
  return {
    id,
    rodada: 1,
    turnoAtual: 0,
    participantes: participantes.map((p) => ({
      ...p,
      condicoes: p.condicoes ?? [],
    })),
    ativo: true,
  }
}

export function ehInimigoIncapacitado(
  p: ParticipanteCombate | ParticipanteVisivel | undefined | null,
): boolean {
  if (!p || p.tipo !== 'inimigo') return false
  const conds = p.condicoes ?? []
  if (conds.some((c) => ['morto', 'desacordado', 'incapacitado', 'torpor'].includes(c))) {
    return true
  }
  if (p.danoVitalidade && p.vitalidadeMax && p.danoVitalidade.agravado >= p.vitalidadeMax) {
    return true
  }
  if ('estadoSaude' in p && p.estadoSaude && ['morto', 'torpor'].includes(p.estadoSaude.estado)) {
    return true
  }
  return false
}

export function obterProximoIndiceAtivo(combate: Combate | CombateVisivel): number {
  const indicesAtivos = combate.participantes
    .map((p, i) => (!ehInimigoIncapacitado(p) ? i : -1))
    .filter((i) => i !== -1)

  if (indicesAtivos.length <= 1) return -1
  const proximo = indicesAtivos.find((i) => i > combate.turnoAtual)
  return proximo !== undefined ? proximo : indicesAtivos[0]
}

function ajustarTurnoSeIncapacitado(combate: Combate): Combate {
  if (
    combate.participantes.length > 0 &&
    ehInimigoIncapacitado(combate.participantes[combate.turnoAtual])
  ) {
    const indicesAtivos = combate.participantes
      .map((p, i) => (!ehInimigoIncapacitado(p) ? i : -1))
      .filter((i) => i !== -1)

    if (indicesAtivos.length > 0) {
      const proximo = indicesAtivos.find((i) => i > combate.turnoAtual) ?? indicesAtivos[0]
      return {
        ...combate,
        turnoAtual: proximo,
      }
    }
  }
  return combate
}

export function avancarTurno(combate: Combate): Combate {
  if (combate.participantes.length === 0) return combate

  const indicesAtivos = combate.participantes
    .map((p, i) => (!ehInimigoIncapacitado(p) ? i : -1))
    .filter((i) => i !== -1)

  if (indicesAtivos.length === 0) return combate

  const proximoTurno = indicesAtivos.find((i) => i > combate.turnoAtual)
  if (proximoTurno !== undefined) {
    return {
      ...combate,
      turnoAtual: proximoTurno,
    }
  }

  return {
    ...combate,
    rodada: combate.rodada + 1,
    turnoAtual: indicesAtivos[0],
  }
}

export function voltarTurno(combate: Combate): Combate {
  if (combate.participantes.length === 0) return combate

  const indicesAtivos = combate.participantes
    .map((p, i) => (!ehInimigoIncapacitado(p) ? i : -1))
    .filter((i) => i !== -1)

  if (indicesAtivos.length === 0) return combate

  const indicesAnteriores = indicesAtivos.filter((i) => i < combate.turnoAtual)
  if (indicesAnteriores.length > 0) {
    return {
      ...combate,
      turnoAtual: indicesAnteriores[indicesAnteriores.length - 1],
    }
  }

  if (combate.rodada > 1) {
    return {
      ...combate,
      rodada: combate.rodada - 1,
      turnoAtual: indicesAtivos[indicesAtivos.length - 1],
    }
  }

  return combate
}

export function reordenarParticipantes(combate: Combate, participanteIdsEmOrdem: string[]): Combate {
  const atualId = combate.participantes[combate.turnoAtual]?.id

  const mapa = new Map(combate.participantes.map((p) => [p.id, p]))
  const novaLista: ParticipanteCombate[] = []

  for (const id of participanteIdsEmOrdem) {
    const part = mapa.get(id)
    if (part) {
      novaLista.push(part)
      mapa.delete(id)
    }
  }

  // Se algum participante não estava na lista reordenada, mantém no final
  for (const restante of mapa.values()) {
    novaLista.push(restante)
  }

  let novoTurnoAtual = 0
  if (atualId) {
    const idx = novaLista.findIndex((p) => p.id === atualId)
    if (idx !== -1) {
      novoTurnoAtual = idx
    }
  }

  return {
    ...combate,
    participantes: novaLista,
    turnoAtual: novoTurnoAtual,
  }
}

export function adicionarParticipante(combate: Combate, participante: ParticipanteCombate): Combate {
  return {
    ...combate,
    participantes: [
      ...combate.participantes,
      {
        ...participante,
        condicoes: participante.condicoes ?? [],
      },
    ],
  }
}

export function removerParticipante(combate: Combate, participanteId: string): Combate {
  const indexRemovido = combate.participantes.findIndex((p) => p.id === participanteId)
  if (indexRemovido === -1) return combate

  const novaLista = combate.participantes.filter((p) => p.id !== participanteId)
  let novoTurno = combate.turnoAtual

  if (novaLista.length === 0) {
    novoTurno = 0
  } else if (indexRemovido < combate.turnoAtual) {
    novoTurno = Math.max(0, combate.turnoAtual - 1)
  } else if (novoTurno >= novaLista.length) {
    novoTurno = 0
  }

  return {
    ...combate,
    participantes: novaLista,
    turnoAtual: novoTurno,
  }
}

export function aplicarDanoInimigo(
  combate: Combate,
  participanteId: string,
  tipoTrilha: 'vitalidade' | 'vontade',
  dano: Dano,
  condicaoAdicionar?: string,
): Combate {
  const novosParticipantes = combate.participantes.map((p) => {
    if (p.id !== participanteId || p.tipo !== 'inimigo') return p

    let novasCondicoes = p.condicoes ?? []
    if (condicaoAdicionar) {
      if (['morto', 'desacordado', 'incapacitado', 'torpor'].includes(condicaoAdicionar)) {
        novasCondicoes = novasCondicoes.filter(
          (c) => !['morto', 'desacordado', 'incapacitado', 'torpor'].includes(c),
        )
      }
      if (!novasCondicoes.includes(condicaoAdicionar)) {
        novasCondicoes = [...novasCondicoes, condicaoAdicionar]
      }
    } else if (tipoTrilha === 'vitalidade' && dano.agravado < p.vitalidadeMax) {
      // Se reduziu o dano agravado abaixo do máximo, remove status letal/comatoso
      novasCondicoes = novasCondicoes.filter(
        (c) => !['morto', 'desacordado', 'incapacitado', 'torpor'].includes(c),
      )
    }

    if (tipoTrilha === 'vitalidade') {
      return {
        ...p,
        danoVitalidade: cortarDano(dano, p.vitalidadeMax),
        condicoes: novasCondicoes,
      }
    } else {
      return {
        ...p,
        danoVontade: cortarDano(dano, p.vontadeMax),
        condicoes: novasCondicoes,
      }
    }
  })

  return ajustarTurnoSeIncapacitado({
    ...combate,
    participantes: novosParticipantes,
  })
}

export function alternarRevelarVitalidade(
  combate: Combate,
  participanteId: string,
  revelar?: boolean,
): Combate {
  const novosParticipantes = combate.participantes.map((p) => {
    if (p.id !== participanteId || p.tipo !== 'inimigo') return p
    return {
      ...p,
      revelarVitalidade: revelar !== undefined ? revelar : !p.revelarVitalidade,
    }
  })

  return {
    ...combate,
    participantes: novosParticipantes,
  }
}

export function alternarCondicaoParticipante(
  combate: Combate,
  participanteId: string,
  condicaoId: string,
): Combate {
  const novosParticipantes = combate.participantes.map((p) => {
    if (p.id !== participanteId) return p
    const condicoesAtuais = p.condicoes ?? []
    const existe = condicoesAtuais.includes(condicaoId)
    const novasCondicoes = existe
      ? condicoesAtuais.filter((c) => c !== condicaoId)
      : [...condicoesAtuais, condicaoId]

    return {
      ...p,
      condicoes: novasCondicoes,
    }
  })

  return ajustarTurnoSeIncapacitado({
    ...combate,
    participantes: novosParticipantes,
  })
}

export const atualizacaoInimigoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  vitalidadeMax: z.int().min(1).optional(),
  vontadeMax: z.int().min(1).optional(),
  paradas: z
    .object({
      fisico: z.int().min(1),
      social: z.int().min(1),
      mental: z.int().min(1),
      excepcionais: z.array(paradaExcepcionalCombateSchema).default([]),
      especiais: z.array(paradaExcepcionalCombateSchema).optional(),
    })
    .optional(),
  especiais: z.array(especialCombateSchema).optional(),
  notas: z.string().optional(),
})

export type AtualizacaoInimigo = z.infer<typeof atualizacaoInimigoSchema>

export function atualizarParticipanteInimigo(
  combate: Combate,
  participanteId: string,
  atualizacao: AtualizacaoInimigo,
): Combate {
  const novosParticipantes = combate.participantes.map((p) => {
    if (p.id !== participanteId || p.tipo !== 'inimigo') return p

    const novo: ParticipanteInimigo = {
      ...p,
      ...(atualizacao.nome !== undefined ? { nome: atualizacao.nome } : {}),
      ...(atualizacao.paradas !== undefined ? { paradas: atualizacao.paradas } : {}),
      ...(atualizacao.especiais !== undefined ? { especiais: atualizacao.especiais } : {}),
      ...(atualizacao.notas !== undefined ? { notas: atualizacao.notas } : {}),
      ...(atualizacao.vitalidadeMax !== undefined ? { vitalidadeMax: atualizacao.vitalidadeMax } : {}),
      ...(atualizacao.vontadeMax !== undefined ? { vontadeMax: atualizacao.vontadeMax } : {}),
    }

    if (atualizacao.vitalidadeMax !== undefined) {
      novo.danoVitalidade = cortarDano(novo.danoVitalidade, novo.vitalidadeMax)
    }
    if (atualizacao.vontadeMax !== undefined) {
      novo.danoVontade = cortarDano(novo.danoVontade, novo.vontadeMax)
    }

    return novo
  })

  return {
    ...combate,
    participantes: novosParticipantes,
  }
}

export type InfoVisibilidadeJogador = {
  jogadorId: string
  meusPersonagemIds: string[]
  coterieIdsDoJogador: string[]
  coteriesPorPersonagem: Record<string, string[]>
  condicoesPersonagens: Record<
    string,
    {
      compartilhaCondicao: boolean
      vitalidadeMax: number
      vontadeMax: number
      danoVitalidade: Dano
      danoVontade: Dano
      fome: number
    }
  >
}

export type ParticipanteVisivel = {
  id: string
  tipo: 'personagem' | 'inimigo'
  nome: string
  categoria?: string
  ehPdn?: boolean
  personagemId?: string
  ehMeu?: boolean
  condicoes?: string[]
  estadoSaude?: InfoEstadoSaude
  // Dados de Inimigo
  vitalidadeOculta?: boolean
  vitalidadeMax?: number
  danoVitalidade?: Dano
  revelarVitalidade?: boolean
  paradas?: {
    fisico: number
    social: number
    mental: number
    excepcionais: { nome: string; valor: number }[]
    especiais?: { nome: string; valor: number }[]
  }
  especiais?: { nome: string; descricao: string }[]
  notas?: string
  // Dados de Personagem
  condicaoOculta?: boolean
  condicao?: {
    vitalidadeMax: number
    vontadeMax: number
    danoVitalidade: Dano
    danoVontade: Dano
    fome: number
  }
}

export type CombateVisivel = {
  id: string
  rodada: number
  turnoAtual: number
  participantes: ParticipanteVisivel[]
  ativo: boolean
}

export function filtrarCombateParaJogador(
  combate: Combate,
  info: InfoVisibilidadeJogador,
): CombateVisivel {
  const participantesVisiveis: ParticipanteVisivel[] = combate.participantes.map((p) => {
    if (p.tipo === 'inimigo') {
      const ehVampiro = p.categoria?.toLowerCase().includes('vampiro') ?? false
      const estadoSaude = calcularEstadoSaude(
        p.vitalidadeMax,
        p.danoVitalidade,
        ehVampiro,
        p.condicoes,
      )
      if (p.revelarVitalidade) {
        return {
          id: p.id,
          tipo: 'inimigo',
          nome: p.nome,
          categoria: p.categoria,
          vitalidadeOculta: false,
          vitalidadeMax: p.vitalidadeMax,
          danoVitalidade: p.danoVitalidade,
          revelarVitalidade: true,
          especiais: p.especiais,
          condicoes: p.condicoes ?? [],
          estadoSaude,
          // Notas e paradas do inimigo são mantidas privadas do narrador na visão do jogador
        }
      }
      return {
        id: p.id,
        tipo: 'inimigo',
        nome: p.nome,
        categoria: p.categoria,
        vitalidadeOculta: true,
        revelarVitalidade: false,
        condicoes: p.condicoes ?? [],
        estadoSaude,
      }
    }

    // p.tipo === 'personagem'
    const ehMeu = info.meusPersonagemIds.includes(p.personagemId)
    const coteriesDoPersonagem = info.coteriesPorPersonagem[p.personagemId] ?? []
    const divideCoterie = coteriesDoPersonagem.some((cId) => info.coterieIdsDoJogador.includes(cId))
    const condicaoInfo = info.condicoesPersonagens[p.personagemId]
    const estadoSaude = condicaoInfo
      ? calcularEstadoSaude(
          condicaoInfo.vitalidadeMax,
          condicaoInfo.danoVitalidade,
          true,
          p.condicoes,
        )
      : undefined

    const podeVerCondicao =
      ehMeu || (divideCoterie && condicaoInfo?.compartilhaCondicao === true)

    if (podeVerCondicao && condicaoInfo) {
      return {
        id: p.id,
        tipo: 'personagem',
        nome: p.nome,
        ehPdn: p.ehPdn,
        personagemId: p.personagemId,
        ehMeu,
        condicoes: p.condicoes ?? [],
        estadoSaude,
        condicaoOculta: false,
        condicao: {
          vitalidadeMax: condicaoInfo.vitalidadeMax,
          vontadeMax: condicaoInfo.vontadeMax,
          danoVitalidade: condicaoInfo.danoVitalidade,
          danoVontade: condicaoInfo.danoVontade,
          fome: condicaoInfo.fome,
        },
      }
    }

    return {
      id: p.id,
      tipo: 'personagem',
      nome: p.nome,
      ehPdn: p.ehPdn,
      personagemId: p.personagemId,
      ehMeu,
      condicoes: p.condicoes ?? [],
      estadoSaude,
      condicaoOculta: true,
    }
  })

  return {
    id: combate.id,
    rodada: combate.rodada,
    turnoAtual: combate.turnoAtual,
    participantes: participantesVisiveis,
    ativo: combate.ativo,
  }
}
