import { ATRIBUTOS, HABILIDADES, type Atributo, type Cla, type Disciplina, type Habilidade } from '../ficha'
import { itemCatalogo, poder } from '../catalogo'
import type { TipoPredador } from '../catalogo/tipos'
import type {
  DadosCriacao,
  DisciplinaCriacao,
  EscolhaVantagemCriacao,
  Especializacao,
  PerfilHabilidade,
  ResultadoValidacaoAtributos,
  ResultadoValidacaoConviccoes,
  ResultadoValidacaoCriacao,
  ResultadoValidacaoDisciplinas,
  ResultadoValidacaoHabilidades,
  ResultadoValidacaoVantagens,
} from './tipos'

export const DISCIPLINAS_DO_CLA: Record<Cla, readonly Disciplina[]> = {
  'banu-haqim': ['celeridade', 'feiticaria-de-sangue', 'ofuscacao'],
  brujah: ['celeridade', 'potencia', 'presenca'],
  gangrel: ['animalismo', 'fortitude', 'proteanismo'],
  hecata: ['auspicios', 'fortitude', 'oblivio'],
  lasombra: ['dominacao', 'oblivio', 'potencia'],
  malkaviano: ['auspicios', 'dominacao', 'ofuscacao'],
  ministerio: ['ofuscacao', 'presenca', 'proteanismo'],
  nosferatu: ['animalismo', 'ofuscacao', 'potencia'],
  ravnos: ['animalismo', 'ofuscacao', 'presenca'],
  salubri: ['auspicios', 'dominacao', 'fortitude'],
  toreador: ['auspicios', 'celeridade', 'presenca'],
  tremere: ['auspicios', 'dominacao', 'feiticaria-de-sangue'],
  tzimisce: ['animalismo', 'dominacao', 'proteanismo'],
  ventrue: ['dominacao', 'fortitude', 'presenca'],
  caitiff: [
    'animalismo',
    'auspicios',
    'celeridade',
    'dominacao',
    'feiticaria-de-sangue',
    'fortitude',
    'oblivio',
    'ofuscacao',
    'potencia',
    'presenca',
    'proteanismo',
  ],
  'sangue-ralo': [],
}

export const SLOTS_ATRIBUTOS_PADRAO: Record<1 | 2 | 3 | 4, number> = {
  4: 1,
  3: 3,
  2: 4,
  1: 1,
}

export const SLOTS_HABILIDADES_POR_PERFIL: Record<PerfilHabilidade, Record<number, number>> = {
  especialista: { 4: 1, 3: 3, 2: 3, 1: 3 },
  equilibrado: { 4: 0, 3: 3, 2: 5, 1: 7 },
  generalista: { 4: 0, 3: 1, 2: 8, 1: 10 },
}

export const HABILIDADES_ESPECIALIZACAO_GRATIS: readonly Habilidade[] = [
  'erudicao',
  'oficios',
  'performance',
  'ciencia',
]

/**
 * Validação de atributos para criação de personagem V5:
 * Exatamente 1 em 4, 3 em 3, 4 em 2 e 1 em 1 (base 1 em tudo).
 */
export function validarAtributosCriacao(atributos: Record<Atributo, number>): ResultadoValidacaoAtributos {
  const erros: string[] = []
  const contagem: Record<1 | 2 | 3 | 4, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }

  for (const attr of ATRIBUTOS) {
    const valor = atributos[attr.id]
    if (valor === undefined || valor === null || Number.isNaN(valor)) {
      erros.push(`Atributo "${attr.nome}" não informado.`)
      continue
    }

    if (valor < 1 || valor > 4) {
      erros.push(`Atributo "${attr.nome}" deve ter valor entre 1 e 4 na criação (valor atual: ${valor}).`)
    }

    if (valor === 1 || valor === 2 || valor === 3 || valor === 4) {
      contagem[valor]++
    }
  }

  const slots: Record<1 | 2 | 3 | 4, { esperado: number; atual: number }> = {
    4: { esperado: SLOTS_ATRIBUTOS_PADRAO[4], atual: contagem[4] },
    3: { esperado: SLOTS_ATRIBUTOS_PADRAO[3], atual: contagem[3] },
    2: { esperado: SLOTS_ATRIBUTOS_PADRAO[2], atual: contagem[2] },
    1: { esperado: SLOTS_ATRIBUTOS_PADRAO[1], atual: contagem[1] },
  }

  for (const k of [4, 3, 2, 1] as const) {
    if (slots[k].atual !== slots[k].esperado) {
      erros.push(
        `Slots de Atributos (${k}): esperado ${slots[k].esperado}, atual ${slots[k].atual}.`,
      )
    }
  }

  return {
    valido: erros.length === 0,
    erros,
    slots,
  }
}

/**
 * Validação de habilidades para criação de personagem V5:
 * Especialista (1x4, 3x3, 3x2, 3x1), Equilibrado (3x3, 5x2, 7x1) ou Generalista (1x3, 8x2, 10x1).
 * Especializações: 1 grátis em Erudição, Ofícios, Performance ou Ciência (se tiver >= 1 ponto) + 1 livre em qualquer perícia com >= 1 ponto.
 */
export function validarHabilidadesCriacao(
  perfil: PerfilHabilidade,
  habilidades: Record<Habilidade, number>,
  especializacoes: Especializacao[],
): ResultadoValidacaoHabilidades {
  const erros: string[] = []
  const contagem: Record<number, number> = { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 }
  const configSlots = SLOTS_HABILIDADES_POR_PERFIL[perfil]

  for (const hab of HABILIDADES) {
    const valor = habilidades[hab.id]
    if (valor === undefined || valor === null || Number.isNaN(valor)) {
      erros.push(`Habilidade "${hab.nome}" não informada.`)
      continue
    }

    if (valor < 0 || valor > 4) {
      erros.push(`Habilidade "${hab.nome}" deve ter valor entre 0 e 4 na criação (valor atual: ${valor}).`)
    }

    if (valor >= 0 && valor <= 4) {
      contagem[valor] = (contagem[valor] ?? 0) + 1
    }
  }

  const slots: Record<number, { esperado: number; atual: number }> = {
    4: { esperado: configSlots[4] ?? 0, atual: contagem[4] ?? 0 },
    3: { esperado: configSlots[3] ?? 0, atual: contagem[3] ?? 0 },
    2: { esperado: configSlots[2] ?? 0, atual: contagem[2] ?? 0 },
    1: { esperado: configSlots[1] ?? 0, atual: contagem[1] ?? 0 },
  }

  for (const k of [4, 3, 2, 1]) {
    if (slots[k].atual !== slots[k].esperado) {
      erros.push(`Slots de Habilidades (${k}): esperado ${slots[k].esperado}, atual ${slots[k].atual}.`)
    }
  }

  // Especializações pessoais (origem !== 'predador')
  const pessoais = especializacoes.filter((e) => e.origem !== 'predador')

  for (const esp of pessoais) {
    if (!esp.especializacao || esp.especializacao.trim().length === 0) {
      erros.push(`Especialização em "${esp.habilidade}" possui texto vazio.`)
    }

    const valorHab = habilidades[esp.habilidade] ?? 0
    if (valorHab < 1) {
      const nomeHab = HABILIDADES.find((h) => h.id === esp.habilidade)?.nome ?? esp.habilidade
      erros.push(
        `Especialização "${esp.especializacao}" requer ao menos 1 ponto na perícia ${nomeHab} (atual: ${valorHab}).`,
      )
    }

    if (esp.origem === 'gratis' && !HABILIDADES_ESPECIALIZACAO_GRATIS.includes(esp.habilidade)) {
      erros.push(
        `Especialização grátis ("${esp.especializacao}") deve ser em Erudição, Ofícios, Performance ou Ciência.`,
      )
    }
  }

  const temPontoAcademico = HABILIDADES_ESPECIALIZACAO_GRATIS.some((h) => (habilidades[h] ?? 0) >= 1)

  if (temPontoAcademico) {
    if (pessoais.length !== 2) {
      erros.push(
        `Devem ser escolhidas exatamente 2 especializações iniciais (1 grátis em Erudição/Ofícios/Performance/Ciência e 1 livre), mas foram encontradas ${pessoais.length}.`,
      )
    } else {
      const temGratisValida = pessoais.some(
        (e) =>
          HABILIDADES_ESPECIALIZACAO_GRATIS.includes(e.habilidade) &&
          (habilidades[e.habilidade] ?? 0) >= 1 &&
          (e.origem === 'gratis' || !e.origem),
      )
      if (!temGratisValida) {
        erros.push(
          'Uma das especializações iniciais deve ser alocada em Erudição, Ofícios, Performance ou Ciência.',
        )
      }
    }
  } else {
    if (pessoais.length !== 1) {
      erros.push(
        `Personagem sem pontos em perícias acadêmicas deve escolher exatamente 1 especialização livre, mas foram encontradas ${pessoais.length}.`,
      )
    }
  }

  return {
    valido: erros.length === 0,
    erros,
    slots,
  }
}

/**
 * Validação de disciplinas para criação de personagem V5:
 * Clã padrão: 2 disciplinas de clã (uma em 2, uma em 1).
 * Caitiff: 2 quaisquer disciplinas (uma em 2, uma em 1).
 * Sangue-Ralo: 0 disciplinas normais.
 * Cada ponto exige exatamente 1 poder do Catálogo com nível <= disciplina e amálgamas atendidos.
 */
export function validarDisciplinasCriacao(
  cla: Cla | null,
  disciplinas: DisciplinaCriacao[],
): ResultadoValidacaoDisciplinas {
  const erros: string[] = []

  if (!cla) {
    return {
      valido: false,
      erros: ['Selecione um Clã na etapa Identidade para definir e validar as Disciplinas.'],
    }
  }

  const alocadas = disciplinas.filter((d) => d.nivel > 0)

  if (cla === 'sangue-ralo') {
    if (alocadas.length > 0) {
      erros.push('Sangue-Ralo não possui disciplinas normais na criação.')
    }
    return { valido: erros.length === 0, erros }
  }

  // Verifica quantidade e níveis das disciplinas
  if (alocadas.length !== 2) {
    erros.push(`Devem ser alocadas exatamente 2 disciplinas (uma em 2 e uma em 1), atual: ${alocadas.length}.`)
  } else {
    const niveis = alocadas.map((d) => d.nivel).sort((a, b) => a - b)
    if (niveis[0] !== 1 || niveis[1] !== 2) {
      erros.push(`Distribuição de níveis de disciplinas inválida: esperado [1, 2], encontrado [${niveis.join(', ')}].`)
    }
  }

  // Clã padrão: disciplinas devem ser do clã
  if (cla !== 'caitiff') {
    const permitidas = DISCIPLINAS_DO_CLA[cla] ?? []
    for (const d of alocadas) {
      if (!permitidas.includes(d.id)) {
        erros.push(`A disciplina "${d.id}" não pertence ao clã ${cla}.`)
      }
    }
  }

  // Níveis por disciplina para checagem de amálgama
  const nivelPorDisciplina = new Map<Disciplina, number>(disciplinas.map((d) => [d.id, d.nivel]))

  // Validação de poderes para cada disciplina
  for (const d of alocadas) {
    if (d.poderes.length !== d.nivel) {
      erros.push(
        `Disciplina "${d.id}" de nível ${d.nivel} requer exatamente ${d.nivel} poder(es), mas possui ${d.poderes.length}.`,
      )
    }

    const poderesVistos = new Set<string>()

    for (const pid of d.poderes) {
      if (poderesVistos.has(pid)) {
        erros.push(`Poder "${pid}" repetido na disciplina "${d.id}".`)
      }
      poderesVistos.add(pid)

      const p = poder(pid)
      if (!p) {
        erros.push(`Poder "${pid}" não encontrado no Catálogo.`)
        continue
      }

      if (p.disciplina !== d.id) {
        erros.push(`Poder "${p.nome}" pertence à disciplina "${p.disciplina}", não a "${d.id}".`)
      }

      if (p.nivel > d.nivel) {
        erros.push(`Poder "${p.nome}" é de nível ${p.nivel}, superior ao nível ${d.nivel} da disciplina "${d.id}".`)
      }

      if (p.amalgama) {
        const nivelOutra = nivelPorDisciplina.get(p.amalgama.disciplina) ?? 0
        if (nivelOutra < p.amalgama.nivel) {
          erros.push(
            `Poder "${p.nome}" exige amálgama com ${p.amalgama.disciplina} nível ${p.amalgama.nivel}, mas o personagem possui nível ${nivelOutra}.`,
          )
        }
      }
    }
  }

  return {
    valido: erros.length === 0,
    erros,
  }
}

/**
 * Validação de Vantagens e Defeitos:
 * Pessoal: 7 de vantagens e 2 de defeitos (excluindo os do predador).
 * Sangue-Ralo: de 1 a 3 Méritos de Sangue-Ralo e a mesma quantidade de Defeitos de Sangue-Ralo.
 */
export function validarVantagensDefeitosCriacao(
  cla: Cla | null,
  vantagens: EscolhaVantagemCriacao[],
  predador: TipoPredador | null,
): ResultadoValidacaoVantagens {
  const erros: string[] = []

  if (!cla) {
    return {
      valido: false,
      erros: ['Selecione um Clã na etapa Identidade para definir as Vantagens e Defeitos.'],
      pontosVantagens: 0,
      pontosDefeitos: 0,
    }
  }

  // Exclui traços marcados com origem predador
  let pessoais = vantagens.filter((v) => v.origem !== 'predador')

  // Se nenhum item foi explicitamente tagueado com origem 'predador', mas há predador definido,
  // exclui traços fixos concedidos pelo predador se a soma ultrapassar os limites
  if (predador && !vantagens.some((v) => v.origem === 'predador')) {
    const predVant = [...predador.vantagens]
    const predDef = [...predador.defeitos]

    pessoais = pessoais.filter((v) => {
      const idxV = predVant.findIndex((pv) => pv.id === v.id && pv.nivel === v.nivel)
      if (idxV !== -1) {
        predVant.splice(idxV, 1)
        return false
      }
      const idxD = predDef.findIndex((pd) => pd.id === v.id && pd.nivel === v.nivel)
      if (idxD !== -1) {
        predDef.splice(idxD, 1)
        return false
      }
      return true
    })
  }

  const ehDefeito = (id: string) => {
    const item = itemCatalogo(id)
    if (item && item.tipo === 'defeito') return true
    if (item && item.tipo === 'vantagem') return false
    return id.startsWith('defeito-')
  }

  const ehSangueRalo = (id: string) => {
    const item = itemCatalogo(id)
    if (item && 'grupo' in item && item.grupo === 'Sangue-Ralo') return true
    return id.includes('sangue-ralo')
  }

  if (cla === 'sangue-ralo') {
    const meritosSR = pessoais.filter((v) => ehSangueRalo(v.id) && !ehDefeito(v.id))
    const defeitosSR = pessoais.filter((v) => ehSangueRalo(v.id) && ehDefeito(v.id))

    const pontosVantagens = meritosSR.reduce((acc, v) => acc + v.nivel, 0)
    const pontosDefeitos = defeitosSR.reduce((acc, v) => acc + v.nivel, 0)

    if (meritosSR.length < 1 || meritosSR.length > 3) {
      erros.push(`Sangue-Ralo deve escolher entre 1 e 3 Méritos de Sangue-Ralo (atual: ${meritosSR.length}).`)
    }

    if (defeitosSR.length !== meritosSR.length) {
      erros.push(
        `Sangue-Ralo deve possuir quantidade igual de Méritos e Defeitos de Sangue-Ralo (${meritosSR.length} méritos vs ${defeitosSR.length} defeitos).`,
      )
    }

    return {
      valido: erros.length === 0,
      erros,
      pontosVantagens,
      pontosDefeitos,
    }
  }

  // Clãs padrão e Caitiff
  let pontosVantagens = 0
  let pontosDefeitos = 0

  for (const v of pessoais) {
    if (ehSangueRalo(v.id)) {
      erros.push(`Vantagens e Defeitos de Sangue-Ralo só são permitidos para Sangue-Ralo ("${v.id}").`)
    }

    if (ehDefeito(v.id)) {
      pontosDefeitos += v.nivel
    } else {
      pontosVantagens += v.nivel
    }
  }

  if (pontosVantagens !== 7) {
    erros.push(`Devem ser escolhidos exatamente 7 pontos de Vantagens pessoais (atual: ${pontosVantagens}).`)
  }

  if (pontosDefeitos !== 2) {
    erros.push(`Devem ser escolhidos exatamente 2 pontos de Defeitos pessoais (atual: ${pontosDefeitos}).`)
  }

  return {
    valido: erros.length === 0,
    erros,
    pontosVantagens,
    pontosDefeitos,
  }
}

/**
 * Validação de Convicções e Pedras de Toque:
 * Entre 1 e 3 pares. Cada convicção deve ter uma pedra de toque preenchida.
 */
export function validarConviccoes(
  conviccoes: { conviccao: string; pedraDeToque: string }[],
): ResultadoValidacaoConviccoes {
  const erros: string[] = []

  if (conviccoes.length < 1 || conviccoes.length > 3) {
    erros.push(`Devem ser definidas entre 1 e 3 Convicções com Pedras de Toque (atual: ${conviccoes.length}).`)
  }

  for (let i = 0; i < conviccoes.length; i++) {
    const c = conviccoes[i]
    if (!c.conviccao || c.conviccao.trim().length === 0) {
      erros.push(`Convicção ${i + 1} não pode estar vazia.`)
    }
  }

  return {
    valido: erros.length === 0,
    erros,
  }
}

/**
 * Consolida todas as validações da criação guiada.
 * Se `ehNarrador = true`, não bloqueia (`valido = true`), apenas lista avisos/erros informativos.
 */
export function validarCriacaoCompleta(
  dados: DadosCriacao,
  cla: Cla,
  ehNarrador: boolean,
): ResultadoValidacaoCriacao {
  const resAtributos = validarAtributosCriacao(dados.atributos)
  const resHabilidades = validarHabilidadesCriacao(
    dados.perfilHabilidade,
    dados.habilidades,
    dados.especializacoes,
  )
  const resDisciplinas = validarDisciplinasCriacao(cla, dados.disciplinas)
  const resVantagens = validarVantagensDefeitosCriacao(cla, dados.vantagens, dados.predador)
  const resConviccoes = validarConviccoes(dados.conviccoes)

  const erros = [
    ...resAtributos.erros,
    ...resHabilidades.erros,
    ...resDisciplinas.erros,
    ...resVantagens.erros,
    ...resConviccoes.erros,
  ]

  const avisos = ehNarrador ? [...erros] : []

  return {
    valido: ehNarrador ? true : erros.length === 0,
    erros,
    avisos,
    detalhes: {
      atributos: resAtributos,
      habilidades: resHabilidades,
      disciplinas: resDisciplinas,
      vantagensDefeitos: resVantagens,
      conviccoes: resConviccoes,
    },
  }
}
