/**
 * Catálogo de Tipos de Predador do V5 (Corebook, Players Guide e suplementos canônicos).
 *
 * Cada Tipo de Predador define a caça habitual de um vampiro e aplica
 * automaticamente bônus e opções na criação (fatia 5, `docs/fatia-5-criacao-guiada.md`).
 */

import type { Fonte, TipoPredador } from './tipos'

function CORE(pagina: number): Fonte {
  return { livro: 'Corebook', pagina }
}

function PG(pagina: number): Fonte {
  return { livro: 'Players Guide', pagina }
}

function CBG(pagina: number): Fonte {
  return { livro: 'Cults of the Blood Gods', pagina }
}

function LSRR(pagina: number): Fonte {
  return { livro: 'Let the Streets Run Red', pagina }
}

export const TIPOS_PREDADOR: readonly TipoPredador[] = [
  {
    id: 'tipo-predador-vira-lata',
    tipo: 'tipo-predador',
    nome: 'Vira-lata',
    nomeOriginal: 'Alleycat',
    descricao: 'Caça por assalto físico violento ou emboscada súbita em becos escuros.',
    confianca: 'certo',
    fonte: CORE(175),
    opcoesEspecializacao: [
      { habilidade: 'briga', sugestoes: ['Imobilização', 'Ataque Furtivo'] },
      { habilidade: 'intimidacao', sugestoes: ['Assalto', 'Extorsão'] },
    ],
    opcoesDisciplina: ['celeridade', 'potencia'],
    modificadorHumanidade: -1,
    vantagens: [
      { id: 'vantagem-contatos', nome: 'Contatos', nivel: 3, nota: 'Trunfo Criminal' },
    ],
    defeitos: [
      { id: 'defeito-inimigos', nome: 'Inimigos', nivel: 1, nota: 'Polícia ou vítima sobrevivente' },
    ],
  },
  {
    id: 'tipo-predador-sacoleiro',
    tipo: 'tipo-predador',
    nome: 'Sacoleiro',
    nomeOriginal: 'Bagger',
    descricao: 'Evita caçar humanos vivos diretamente, adquirindo sangue frio armazenado em hospitais ou no mercado negro.',
    confianca: 'certo',
    fonte: CORE(175),
    opcoesEspecializacao: [
      { habilidade: 'ladroagem', sugestoes: ['Arrombamento', 'Cofres Refrigerados'] },
      { habilidade: 'manha', sugestoes: ['Mercado Negro', 'Contrabando'] },
    ],
    opcoesDisciplina: ['ofuscacao', 'feiticaria-de-sangue'],
    vantagens: [],
    defeitos: [],
    escolhasTracos: [
      {
        rotulo: 'Vantagem (escolha 1)',
        opcoes: [
          { tipo: 'vantagem', id: 'vantagem-recursos', nome: 'Recursos', nivel: 1, nota: 'Equipamento de conservação' },
          { tipo: 'vantagem', id: 'vantagem-contatos', nome: 'Contatos', nivel: 1, nota: 'Banco de sangue ou funerária' },
        ],
      },
    ],
  },
  {
    id: 'tipo-predador-sanguessuga',
    tipo: 'tipo-predador',
    nome: 'Sanguessuga',
    nomeOriginal: 'Blood Leech',
    descricao: 'Alimenta-se exclusivamente do sangue de outros vampiros, tornando-se predador dos predadores.',
    confianca: 'certo',
    fonte: CORE(176),
    opcoesEspecializacao: [
      { habilidade: 'briga', sugestoes: ['Vampiros', 'Emboscada de Membros'] },
      { habilidade: 'furtividade', sugestoes: ['Contra Disciplinas', 'Espreita de Vampiros'] },
    ],
    opcoesDisciplina: ['celeridade', 'proteanismo'],
    modificadorHumanidade: -1,
    modificadorPotenciaSangue: 1,
    vantagens: [],
    defeitos: [
      { id: 'defeito-tabu-alimentar', nome: 'Tabu Alimentar', nivel: 2, nota: 'Não pode se nutrir de sangue mortal' },
      { id: 'defeito-segredo-sombrio', nome: 'Segredo Sombrio', nivel: 1, nota: 'Diablerista ou predador de Membros' },
    ],
  },
  {
    id: 'tipo-predador-trinchador',
    tipo: 'tipo-predador',
    nome: 'Trinchador',
    nomeOriginal: 'Cleaver',
    descricao: 'Alimenta-se secretamente da própria família, amigos íntimos ou círculo doméstico mortal.',
    confianca: 'certo',
    fonte: CORE(176),
    opcoesEspecializacao: [
      { habilidade: 'persuasao', sugestoes: ['Manipulação Emocional', 'Gaslighting'] },
      { habilidade: 'subterfugio', sugestoes: ['Disfarce Doméstico', 'Álibis'] },
    ],
    opcoesDisciplina: ['animalismo', 'dominacao'],
    vantagens: [
      { id: 'vantagem-rebanho', nome: 'Rebanho', nivel: 2, nota: 'Família mortal' },
    ],
    defeitos: [
      { id: 'defeito-segredo-sombrio', nome: 'Segredo Sombrio', nivel: 1, nota: 'Trinchador (Cleaver)' },
    ],
  },
  {
    id: 'tipo-predador-consensualista',
    tipo: 'tipo-predador',
    nome: 'Consensualista',
    nomeOriginal: 'Consensualist',
    descricao: 'Nunca se alimenta sem o consentimento genuíno e explícito da vítima mortal.',
    confianca: 'certo',
    fonte: CORE(176),
    opcoesEspecializacao: [
      { habilidade: 'medicina', sugestoes: ['Flebotomia', 'Coleta de Sangue'] },
      { habilidade: 'persuasao', sugestoes: ['Consentimento', 'Negociação'] },
    ],
    opcoesDisciplina: ['auspicios', 'fortitude'],
    modificadorHumanidade: 1,
    vantagens: [],
    defeitos: [
      { id: 'defeito-presa-restrita', nome: 'Presa Restrita', nivel: 1, nota: 'Apenas presas consentidas' },
      { id: 'defeito-macula-da-mascara', nome: 'Mácula da Máscara', nivel: 1, nota: 'Risco frequente de quebra da Máscara' },
    ],
  },
  {
    id: 'tipo-predador-fazendeiro',
    tipo: 'tipo-predador',
    nome: 'Fazendeiro',
    nomeOriginal: 'Farmer',
    descricao: 'Alimenta-se apenas do sangue de animais, recusando-se a caçar humanos.',
    confianca: 'certo',
    fonte: CORE(177),
    opcoesEspecializacao: [
      { habilidade: 'etiqueta-com-animais', sugestoes: ['Cavalos', 'Cães', 'Gado'] },
      { habilidade: 'sobrevivencia', sugestoes: ['Caça', 'Rastreamento'] },
    ],
    opcoesDisciplina: ['animalismo', 'proteanismo'],
    modificadorHumanidade: 1,
    vantagens: [],
    defeitos: [
      { id: 'defeito-dieta-vegana', nome: 'Dieta Vegana', nivel: 2, nota: 'Sangue animal não sacia Fome abaixo de 2' },
    ],
  },
  {
    id: 'tipo-predador-osiris',
    tipo: 'tipo-predador',
    nome: 'Osíris',
    nomeOriginal: 'Osiris',
    descricao: 'Lidera um culto ou possui fãs devotos que reverenciam o vampiro e doam sangue com adoração.',
    confianca: 'certo',
    fonte: CORE(177),
    opcoesEspecializacao: [
      { habilidade: 'ocultismo', sugestoes: ['Cultos', 'Rituais'] },
      { habilidade: 'performance', sugestoes: ['Canto', 'Pregação', 'Atuação'] },
    ],
    opcoesDisciplina: ['feiticaria-de-sangue', 'presenca'],
    vantagens: [
      { id: 'vantagem-rebanho', nome: 'Rebanho', nivel: 3, nota: 'Seguidores do culto' },
    ],
    defeitos: [],
    escolhasTracos: [
      {
        rotulo: 'Defeito (escolha 1)',
        opcoes: [
          { tipo: 'defeito', id: 'defeito-inimigos', nome: 'Inimigos', nivel: 2, nota: 'Autoridades ou cultos rivais' },
          { tipo: 'defeito', id: 'defeito-culpa-mitica', nome: 'Culpa Mítica', nivel: 2, nota: 'Investigação religiosa ou escândalo' },
        ],
      },
    ],
  },
  {
    id: 'tipo-predador-sandman',
    tipo: 'tipo-predador',
    nome: 'Sandman',
    nomeOriginal: 'Sandman',
    descricao: 'Invade residências nas sombras para se alimentar de vítimas adormecidas sem ser percebido.',
    confianca: 'certo',
    fonte: CORE(177),
    opcoesEspecializacao: [
      { habilidade: 'medicina', sugestoes: ['Anestésicos', 'Narcóticos'] },
      { habilidade: 'furtividade', sugestoes: ['Invasão Residencial', 'Passos Silenciosos'] },
    ],
    opcoesDisciplina: ['auspicios', 'ofuscacao'],
    vantagens: [
      { id: 'vantagem-recursos', nome: 'Recursos', nivel: 1, nota: 'Espólios de furtos discretos' },
    ],
    defeitos: [],
  },
  {
    id: 'tipo-predador-scene-queen',
    tipo: 'tipo-predador',
    nome: 'Scene Queen',
    nomeOriginal: 'Scene Queen',
    descricao: 'Caça nos círculos exclusivos de subculturas urbanas, clubes noturnos e cenas artísticas.',
    confianca: 'certo',
    fonte: CORE(178),
    opcoesEspecializacao: [
      { habilidade: 'etiqueta', sugestoes: ['Cena Específica', 'Clubes Noturnos'] },
      { habilidade: 'lideranca', sugestoes: ['Cena Alternativa', 'Círculo Exclusivo'] },
      { habilidade: 'manha', sugestoes: ['Subcultura', 'Vida Noturna'] },
    ],
    opcoesDisciplina: ['dominacao', 'potencia'],
    vantagens: [],
    defeitos: [],
    escolhasTracos: [
      {
        rotulo: 'Vantagem (escolha 1)',
        opcoes: [
          { tipo: 'vantagem', id: 'vantagem-fama', nome: 'Fama', nivel: 1, nota: 'Cena local' },
          { tipo: 'vantagem', id: 'vantagem-contatos', nome: 'Contatos', nivel: 2, nota: 'Promoter ou DJ' },
        ],
      },
      {
        rotulo: 'Defeito (escolha 1)',
        opcoes: [
          { tipo: 'defeito', id: 'defeito-presa-exclusiva', nome: 'Presa Exclusiva', nivel: 1, nota: 'Apenas membros da subcultura' },
          { tipo: 'defeito', id: 'defeito-inimigos', nome: 'Inimigos', nivel: 1, nota: 'Rival da cena' },
        ],
      },
    ],
  },
  {
    id: 'tipo-predador-sereia',
    tipo: 'tipo-predador',
    nome: 'Sereia',
    nomeOriginal: 'Siren',
    descricao: 'Usa charme, beleza física e sedução irresistível para atrair presas e se alimentar durante o êxtase.',
    confianca: 'certo',
    fonte: CORE(178),
    opcoesEspecializacao: [
      { habilidade: 'persuasao', sugestoes: ['Sedução', 'Encantamento'] },
      { habilidade: 'subterfugio', sugestoes: ['Sedução Noturna', 'Manipulação Romântica'] },
    ],
    opcoesDisciplina: ['fortitude', 'presenca'],
    vantagens: [
      { id: 'vantagem-aparencia-marcante', nome: 'Aparência Marcante', nivel: 2, nota: 'Belo' },
    ],
    defeitos: [
      { id: 'defeito-inimigos', nome: 'Inimigos', nivel: 1, nota: 'Amante traído ou perseguidor' },
    ],
  },
  {
    id: 'tipo-predador-ceifador',
    tipo: 'tipo-predador',
    nome: 'Ceifador',
    nomeOriginal: 'Grim Reaper',
    descricao: 'Caça em hospitais, alas de doentes terminais e asilos, alimentando-se dos que já estão à beira da morte.',
    confianca: 'certo',
    fonte: PG(74),
    opcoesEspecializacao: [
      { habilidade: 'medicina', sugestoes: ['Diagnóstico Terminal', 'Paliativos'] },
      { habilidade: 'percepcao', sugestoes: ['Morte Iminente', 'Sinais Vitais'] },
    ],
    opcoesDisciplina: ['auspicios', 'oblivio'],
    vantagens: [
      { id: 'vantagem-aliados', nome: 'Aliados', nivel: 1, nota: 'Enfermeiro ou legista' },
    ],
    defeitos: [
      { id: 'defeito-presa-restrita', nome: 'Presa Restrita', nivel: 1, nota: 'Apenas doentes terminais ou moribundos' },
    ],
  },
  {
    id: 'tipo-predador-montero',
    tipo: 'tipo-predador',
    nome: 'Montero',
    nomeOriginal: 'Montero',
    descricao: 'Utiliza servos ou uma matilha humana para cercar e conduzir presas diretamente até suas presas.',
    confianca: 'certo',
    fonte: PG(75),
    opcoesEspecializacao: [
      { habilidade: 'lideranca', sugestoes: ['Matilha de Caça', 'Comando de Servos'] },
      { habilidade: 'furtividade', sugestoes: ['Emboscada', 'Cerco'] },
    ],
    opcoesDisciplina: ['dominacao', 'ofuscacao'],
    modificadorHumanidade: -1,
    vantagens: [
      { id: 'vantagem-lacaios', nome: 'Lacaios', nivel: 2, nota: 'Batedores de caça' },
    ],
    defeitos: [],
  },
  {
    id: 'tipo-predador-perseguidor',
    tipo: 'tipo-predador',
    nome: 'Perseguidor',
    nomeOriginal: 'Pursuer',
    descricao: 'Estuda metodicamente uma presa específica ao longo de semanas até dar o bote no instante perfeito.',
    confianca: 'certo',
    fonte: PG(75),
    opcoesEspecializacao: [
      { habilidade: 'investigacao', sugestoes: ['Rotina de Vítimas', 'Rastreamento'] },
      { habilidade: 'furtividade', sugestoes: ['Perseguição Urbana', 'Espreita'] },
    ],
    opcoesDisciplina: ['animalismo', 'auspicios'],
    vantagens: [],
    defeitos: [
      { id: 'defeito-presa-restrita', nome: 'Presa Restrita', nivel: 1, nota: 'Apenas alvos investigados previamente' },
    ],
  },
  {
    id: 'tipo-predador-armadilha',
    tipo: 'tipo-predador',
    nome: 'Armadilha',
    nomeOriginal: 'Trapdoor',
    descricao: 'Transforma o próprio refúgio em uma teia mortal para capturar presas sem sair de casa.',
    confianca: 'certo',
    fonte: PG(77),
    opcoesEspecializacao: [
      { habilidade: 'ladroagem', sugestoes: ['Armadilhas', 'Fechaduras'] },
      { habilidade: 'furtividade', sugestoes: ['Tocaia em Refúgio', 'Espreita'] },
    ],
    opcoesDisciplina: ['ofuscacao', 'proteanismo'],
    vantagens: [
      { id: 'vantagem-refugio', nome: 'Refúgio', nivel: 1, nota: 'Equipado com armadilhas' },
    ],
    defeitos: [
      { id: 'defeito-presa-restrita', nome: 'Presa Restrita', nivel: 1, nota: 'Apenas presas no próprio refúgio' },
    ],
  },
  {
    id: 'tipo-predador-extorquista',
    tipo: 'tipo-predador',
    nome: 'Extorquista',
    nomeOriginal: 'Extortionist',
    descricao: 'Força humanos vulneráveis a doar sangue sob chantagem, dívidas ou falsa proteção.',
    confianca: 'certo',
    fonte: CBG(98),
    opcoesEspecializacao: [
      { habilidade: 'intimidacao', sugestoes: ['Chantagem', 'Coerção'] },
      { habilidade: 'ladroagem', sugestoes: ['Sistemas de Segurança', 'Arrombamento'] },
    ],
    opcoesDisciplina: ['dominacao', 'potencia'],
    vantagens: [
      { id: 'vantagem-recursos', nome: 'Recursos', nivel: 2, nota: 'Provenientes de extorsão' },
    ],
    defeitos: [
      { id: 'defeito-inimigos', nome: 'Inimigos', nivel: 2, nota: 'Vítimas ou polícia' },
    ],
  },
  {
    id: 'tipo-predador-ladrao-de-sepulturas',
    tipo: 'tipo-predador',
    nome: 'Ladrão de Sepulturas',
    nomeOriginal: 'Graverobber',
    descricao: 'Caça em cemitérios, funerárias e necrotérios, alimentando-se de sangue preservado ou enlutados vulneráveis.',
    confianca: 'certo',
    fonte: CBG(98),
    opcoesEspecializacao: [
      { habilidade: 'medicina', sugestoes: ['Cadáveres', 'Tanatopraxia'] },
      { habilidade: 'percepcao', sugestoes: ['Luto', 'Fragilidade Emocional'] },
    ],
    opcoesDisciplina: ['fortitude', 'oblivio'],
    vantagens: [
      { id: 'vantagem-refugio', nome: 'Refúgio', nivel: 1, nota: 'Cripta ou cemitério' },
    ],
    defeitos: [
      { id: 'defeito-segredo-sombrio', nome: 'Segredo Sombrio', nivel: 1, nota: 'Profanação de túmulos' },
    ],
  },
  {
    id: 'tipo-predador-assassino-de-estrada',
    tipo: 'tipo-predador',
    nome: 'Assassino de Estrada',
    nomeOriginal: 'Roadside Killer',
    descricao: 'Espreita em postos de combustível, acostamentos e rodovias remotas, atacando caroneiros e viajantes solitários.',
    confianca: 'certo',
    fonte: LSRR(138),
    opcoesEspecializacao: [
      { habilidade: 'conducao', sugestoes: ['Perseguição Noturna', 'Rodovias'] },
      { habilidade: 'sobrevivencia', sugestoes: ['Estradas Ermas', 'Isolamento'] },
    ],
    opcoesDisciplina: ['fortitude', 'proteanismo'],
    vantagens: [
      { id: 'vantagem-recursos', nome: 'Recursos', nivel: 1, nota: 'Veículo customizado para caça' },
    ],
    defeitos: [
      { id: 'defeito-presa-restrita', nome: 'Presa Restrita', nivel: 1, nota: 'Apenas viajantes de passagem' },
    ],
  },
]
