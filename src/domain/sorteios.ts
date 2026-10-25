import { PODERES } from './catalogo'
import { DISCIPLINAS, type Cla } from './ficha'

export type TipoRessonancia = 'colerico' | 'melancolico' | 'fleumatico' | 'sanguineo'

export type IntensidadeRessonancia = 'desprezivel' | 'fugaz' | 'intensa' | 'aguda'

export type RessonanciaDef = {
  id: TipoRessonancia
  nome: string
  emocoes: string
  disciplinas: string[]
  disciplinaIds: readonly string[]
}

export type IntensidadeDef = {
  id: IntensidadeRessonancia
  nome: string
  descricao: string
}

export type Discrasia = {
  id: string
  nome: string
  tipoRessonancia: TipoRessonancia
  descricao: string
}

export type ManifestacaoSangueFraco = {
  disciplinaId: string
  disciplinaNome: string
  nivel: 1 | 2
  poderes: Array<{
    id: string
    nome: string
    nivel: number
    descricao: string
  }>
}

export type CompulsaoGeralDef = {
  id: 'fome' | 'dominancia' | 'dano' | 'paranoia'
  nome: string
  descricao: string
}

export type CompulsaoClanicaDef = {
  claId: Cla
  nome: string
  descricao: string
}

/**
 * Verifica se um clã (ou identificador/objeto) corresponde a Sangue-Fraco / Sangue-Ralo.
 * V5 p. 114/229: Manifestações temporárias de disciplinas só se aplicam a vampiros do clã Sangue-Fraco.
 */
export function ehSangueFraco(cla: unknown): boolean {
  if (!cla) return false
  if (typeof cla === 'string') {
    return cla === 'sangue-fraco' || cla === 'sangue-ralo'
  }
  if (typeof cla === 'object' && 'id' in cla && typeof cla.id === 'string') {
    const id = cla.id
    return id === 'sangue-fraco' || id === 'sangue-ralo'
  }
  return false
}

export const RESSONANCIAS: readonly RessonanciaDef[] = [
  {
    id: 'colerico',
    nome: 'Colérico',
    emocoes: 'Raiva, hostilidade, agressão, fúria',
    disciplinas: ['Celeridade', 'Potência'],
    disciplinaIds: ['celeridade', 'potencia'],
  },
  {
    id: 'melancolico',
    nome: 'Melancólico',
    emocoes: 'Tristeza, luto, dor, desespero, depressão',
    disciplinas: ['Fortitude', 'Oblívio'],
    disciplinaIds: ['fortitude', 'oblivio'],
  },
  {
    id: 'fleumatico',
    nome: 'Fleumático',
    emocoes: 'Calma, letargia, preguiça, indiferença',
    disciplinas: ['Auspícios', 'Dominação'],
    disciplinaIds: ['auspicios', 'dominacao'],
  },
  {
    id: 'sanguineo',
    nome: 'Sanguíneo',
    emocoes: 'Paixão, desejo, luxúria, entusiasmo, volúpia',
    disciplinas: ['Feitiçaria de Sangue', 'Presença'],
    disciplinaIds: ['feiticaria-de-sangue', 'presenca'],
  },
] as const

export const INTENSIDADES: readonly IntensidadeDef[] = [
  {
    id: 'desprezivel',
    nome: 'Desprezível',
    descricao: 'Sem benefício mecânico imediato.',
  },
  {
    id: 'fugaz',
    nome: 'Fugaz',
    descricao: '+1 dado na parada de Disciplinas associadas até a próxima alimentação.',
  },
  {
    id: 'intensa',
    nome: 'Intensa',
    descricao: '+2 dados na parada de Disciplinas associadas até a próxima alimentação.',
  },
  {
    id: 'aguda',
    nome: 'Aguda',
    descricao: '+2 dados nas Disciplinas associadas e confere uma Discrasia.',
  },
] as const

export const DISCRASIAS: readonly Discrasia[] = [
  // Colérico
  {
    id: 'furia-fervente',
    nome: 'Fúria Fervente',
    tipoRessonancia: 'colerico',
    descricao: '+1 de dano adicional em ataques corpo a corpo ou desarmados.',
  },
  {
    id: 'foco-predatorio',
    nome: 'Foco Predatório',
    tipoRessonancia: 'colerico',
    descricao: 'Pode repetir um dado em testes de perseguição ou confronto físico direto.',
  },
  {
    id: 'agressao-explosiva',
    nome: 'Agressão Explosiva',
    tipoRessonancia: 'colerico',
    descricao: '+2 dados na iniciativa e no primeiro turno de uma cena de conflito.',
  },
  // Melancólico
  {
    id: 'mente-obscura',
    nome: 'Mente Obscura',
    tipoRessonancia: 'melancolico',
    descricao: '+2 dados em testes para resistir a poderes mentais e de coerção.',
  },
  {
    id: 'paciencia-triste',
    nome: 'Paciência Triste',
    tipoRessonancia: 'melancolico',
    descricao: 'Reduz em 1 ponto a perda de Força de Vontade por frustração.',
  },
  {
    id: 'eco-funebre',
    nome: 'Eco Fúnebre',
    tipoRessonancia: 'melancolico',
    descricao: '+2 dados em testes de Ocultismo ou Investigação ligados a morte ou cadáveres.',
  },
  // Fleumático
  {
    id: 'frieza-calculista',
    nome: 'Frieza Calculista',
    tipoRessonancia: 'fleumatico',
    descricao: '+2 dados para manter a calma ou resistir a provocações e insultos.',
  },
  {
    id: 'percepcao-imperturbavel',
    nome: 'Percepção Imperturbável',
    tipoRessonancia: 'fleumatico',
    descricao: 'Ignora penalidades causadas por distrações sensoriais externas ou ruídos.',
  },
  {
    id: 'reserva-mental',
    nome: 'Reserva Mental',
    tipoRessonancia: 'fleumatico',
    descricao: 'Permite recuperar 1 ponto adicional de Força de Vontade superficial.',
  },
  // Sanguíneo
  {
    id: 'magnetismo-arrebatador',
    nome: 'Magnetismo Arrebatador',
    tipoRessonancia: 'sanguineo',
    descricao: '+2 dados em testes de Persuasão baseados em sedução ou charme.',
  },
  {
    id: 'euforia-compartilhada',
    nome: 'Euforia Compartilhada',
    tipoRessonancia: 'sanguineo',
    descricao: 'A vítima do Beijo fica dócil e não oferece resistência nem recorda trauma.',
  },
  {
    id: 'chama-passional',
    nome: 'Chama Passional',
    tipoRessonancia: 'sanguineo',
    descricao: 'Gastar 1 Força de Vontade concede 2 sucessos extras em uma apresentação artística.',
  },
] as const

export const COMPULSOES_GERAIS: readonly CompulsaoGeralDef[] = [
  {
    id: 'fome',
    nome: 'Fome',
    descricao: 'A Besta exige sangue. O vampiro deve se alimentar imediatamente de qualquer humano ou fonte de sangue acessível, ignorando outros objetivos.',
  },
  {
    id: 'dominancia',
    nome: 'Dominância',
    descricao: 'A Besta quer exercer autoridade. O vampiro é compelido a subjugar ou fazer outro se curvar diante de si.',
  },
  {
    id: 'dano',
    nome: 'Dano',
    descricao: 'A Besta quer destruir. O vampiro deve infligir dano físico ou emocional severo a alguém antes de poder agir normalmente.',
  },
  {
    id: 'paranoia',
    nome: 'Paranoia',
    descricao: 'A Besta vê perigo em todo lugar. O vampiro suspeita de todos ao redor, recusando ajuda e buscando abrigo ou postura defensiva extrema.',
  },
] as const

export const COMPULSOES_CLANICAS: readonly CompulsaoClanicaDef[] = [
  {
    claId: 'banu-haqim',
    nome: 'Julgamento',
    descricao: 'O vampiro é impelido a punir qualquer um que viole seu código moral pessoal.',
  },
  {
    claId: 'brujah',
    nome: 'Rebelião',
    descricao: 'Revolta cega contra qualquer figura de autoridade ou imposição externa.',
  },
  {
    claId: 'gangrel',
    nome: 'Impulso Animal',
    descricao: 'O pensamento racional recua, cedendo lugar a instintos de sobrevivência animal.',
  },
  {
    claId: 'hecata',
    nome: 'Morbidez',
    descricao: 'Obsessão por desvendar e contemplar a morte, cadáveres ou o sofrimento mortal.',
  },
  {
    claId: 'lasombra',
    nome: 'Crueldade',
    descricao: 'A necessidade implacável de demonstrar superioridade e submeter os fracos.',
  },
  {
    claId: 'malkaviano',
    nome: 'Delírio',
    descricao: 'Suas percepções se descolam da realidade física, obscurecendo a razão.',
  },
  {
    claId: 'ministerio',
    nome: 'Transgressão',
    descricao: 'O desejo irresistível de seduzir ou corromper outros a quebrarem suas convicções.',
  },
  {
    claId: 'nosferatu',
    nome: 'Criptofilia',
    descricao: 'A fixação em desenterrar segredos alheios que possam servir de moeda de troca.',
  },
  {
    claId: 'ravnos',
    nome: 'Tentação da Sorte',
    descricao: 'Necessidade irresistível de aceitar riscos audaciosos e apostas perigosas.',
  },
  {
    claId: 'salubri',
    nome: 'Altruísmo Empático',
    descricao: 'Incapacidade de ignorar o sofrimento de outros, assumindo a dor alheia.',
  },
  {
    claId: 'toreador',
    nome: 'Obsessão Estética',
    descricao: 'Transe absoluto diante de uma obra de arte sublime ou pessoa cativante.',
  },
  {
    claId: 'tremere',
    nome: 'Perfeccionismo Arcano',
    descricao: 'Obsessão por controle meticuloso e rigor metodológico sobre cada detalhe.',
  },
  {
    claId: 'tzimisce',
    nome: 'Possessão Territorial',
    descricao: 'Defesa implacável e possessiva de suas propriedades, servos e território.',
  },
  {
    claId: 'ventrue',
    nome: 'Comando Régio',
    descricao: 'Necessidade inabalável de dar ordens e fazer todos cumprirem sua vontade.',
  },
] as const

export type ResultadoRessonancia = {
  tipo: RessonanciaDef
  intensidade: IntensidadeDef
  dadoD10: number
  discrasia?: Discrasia
  manifestacaoSangueFraco: ManifestacaoSangueFraco
}

export type CompulsaoSorteada = {
  tipo: 'geral' | 'cla'
  claId?: Cla
  nome: string
  descricao: string
}

function escolherAleatorio<T>(lista: readonly T[], rng: () => number): T {
  const indice = Math.min(Math.floor(rng() * lista.length), lista.length - 1)
  return lista[indice]
}

export function sortearManifestacaoSangueFraco(
  tipoRessonancia: TipoRessonancia,
  nivel: 1 | 2,
  rng: () => number = Math.random,
): ManifestacaoSangueFraco {
  const mapaDisciplinas: Record<TipoRessonancia, readonly string[]> = {
    colerico: ['celeridade', 'potencia'],
    melancolico: ['fortitude', 'oblivio'],
    fleumatico: ['auspicios', 'dominacao'],
    sanguineo: ['feiticaria-de-sangue', 'presenca'],
  }

  const disciplinasPossiveis = mapaDisciplinas[tipoRessonancia]
  const disciplinaId = escolherAleatorio(disciplinasPossiveis, rng)
  const disciplinaNome =
    DISCIPLINAS.find((d) => d.id === disciplinaId)?.nome ?? disciplinaId

  // Poder nível 1 sem amálgama
  const poderesLvl1 = PODERES.filter(
    (p) => p.disciplina === disciplinaId && p.nivel === 1 && !p.amalgama,
  )
  const poder1 = escolherAleatorio(poderesLvl1, rng)

  const poderesEscolhidos = [
    {
      id: poder1.id,
      nome: poder1.nome,
      nivel: 1,
      descricao: poder1.descricao,
    },
  ]

  if (nivel === 2) {
    const poderesLvl2 = PODERES.filter(
      (p) => p.disciplina === disciplinaId && p.nivel === 2 && !p.amalgama,
    )
    if (poderesLvl2.length > 0) {
      const poder2 = escolherAleatorio(poderesLvl2, rng)
      poderesEscolhidos.push({
        id: poder2.id,
        nome: poder2.nome,
        nivel: 2,
        descricao: poder2.descricao,
      })
    }
  }

  return {
    disciplinaId,
    disciplinaNome,
    nivel,
    poderes: poderesEscolhidos,
  }
}

export function sortearRessonancia(
  rng: () => number = Math.random,
  dadoD10Forcado?: number,
): ResultadoRessonancia {
  const tipo = escolherAleatorio(RESSONANCIAS, rng)

  const dadoD10 =
    dadoD10Forcado !== undefined
      ? dadoD10Forcado
      : Math.floor(rng() * 10) + 1

  let intensidadeId: IntensidadeRessonancia
  if (dadoD10 <= 5) {
    intensidadeId = 'desprezivel'
  } else if (dadoD10 <= 8) {
    intensidadeId = 'fugaz'
  } else if (dadoD10 === 9) {
    intensidadeId = 'intensa'
  } else {
    intensidadeId = 'aguda'
  }

  const intensidade = INTENSIDADES.find((i) => i.id === intensidadeId)!
  const discrasia = intensidadeId === 'aguda' ? sortearDiscrasia(tipo.id, rng) : undefined

  // V5: Ressonâncias máximas (9 ou 10 no d10: Intensa e Aguda) concedem Disciplina Nível 2
  // (1 poder de nível 1 e 1 poder de nível 2). Caso contrário, concedem Disciplina Nível 1.
  const nivelSangueFraco = dadoD10 >= 9 ? 2 : 1
  const manifestacaoSangueFraco = sortearManifestacaoSangueFraco(
    tipo.id,
    nivelSangueFraco,
    rng,
  )

  return {
    tipo,
    intensidade,
    dadoD10,
    discrasia,
    manifestacaoSangueFraco,
  }
}

export function sortearDiscrasia(
  tipoRessonancia?: TipoRessonancia,
  rng: () => number = Math.random,
): Discrasia {
  const candidatas = tipoRessonancia
    ? DISCRASIAS.filter((d) => d.tipoRessonancia === tipoRessonancia)
    : DISCRASIAS
  return escolherAleatorio(candidatas, rng)
}

export function sortearCompulsao(
  tipo: 'geral' | 'cla',
  claId?: Cla,
  rng: () => number = Math.random,
): CompulsaoSorteada {
  if (tipo === 'geral') {
    const comp = escolherAleatorio(COMPULSOES_GERAIS, rng)
    return {
      tipo: 'geral',
      nome: comp.nome,
      descricao: comp.descricao,
    }
  }

  if (claId) {
    const achada = COMPULSOES_CLANICAS.find((c) => c.claId === claId)
    if (achada) {
      return {
        tipo: 'cla',
        claId: achada.claId,
        nome: achada.nome,
        descricao: achada.descricao,
      }
    }
  }

  const comp = escolherAleatorio(COMPULSOES_CLANICAS, rng)
  return {
    tipo: 'cla',
    claId: comp.claId,
    nome: comp.nome,
    descricao: comp.descricao,
  }
}
