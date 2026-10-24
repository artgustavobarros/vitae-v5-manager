import type { ItemConsultaRegra } from './tipos'

/**
 * Termos da consulta rápida da fatia 4: Potência do Sangue, Humanidade, Fome, Manchas, Vitalidade e Força de Vontade.
 * Números da Potência do Sangue seguem a tabela corrigida da errata (Companion p. 63).
 */

const SEM_EFEITO = 'Sem efeito'
const ANIMAL_NADA = 'Sangue animal e de bolsa não sacia Fome'

export const CONSULTA_TERMOS: Record<string, ItemConsultaRegra> = {
  'potencia-do-sangue': {
    id: 'potencia-do-sangue',
    titulo: 'Potência do Sangue',
    subtitulo: 'Vantagem do Sangue',
    descricao:
      'A força da vitae do vampiro, de 0 (Sangue-Ralo) a 10. Cresce com a idade e fica limitada pela Geração; quanto maior, mais forte o Sangue e mais difícil se alimentar.',
    tabela: {
      colunas: [
        'Potência',
        'Surto de Sangue',
        'Cura por Teste de Despertar',
        'Bônus de Disciplina',
        'Repetir Teste de Despertar',
        'Gravidade da Perdição',
        'Penalidade de alimentação',
      ],
      linhas: [
        ['0', '+1 dado', '1 superficial', '—', '—', '0', SEM_EFEITO],
        ['1', '+2 dados', '1 superficial', '—', 'Nível 1', '2', SEM_EFEITO],
        ['2', '+2 dados', '2 superficiais', '+1 dado', 'Nível 1', '2', 'Sangue animal e de bolsa sacia metade da Fome'],
        ['3', '+3 dados', '2 superficiais', '+1 dado', 'Nível 2 ou menor', '3', ANIMAL_NADA],
        ['4', '+3 dados', '3 superficiais', '+2 dados', 'Nível 2 ou menor', '3', `${ANIMAL_NADA}; humano sacia 1 a menos`],
        ['5', '+4 dados', '3 superficiais', '+2 dados', 'Nível 3 ou menor', '4', `${ANIMAL_NADA}; humano sacia 1 a menos; só matando a Fome fica abaixo de 2`],
        ['6', '+4 dados', '3 superficiais', '+3 dados', 'Nível 3 ou menor', '4', `${ANIMAL_NADA}; humano sacia 2 a menos; só matando a Fome fica abaixo de 2`],
        ['7', '+5 dados', '3 superficiais', '+3 dados', 'Nível 4 ou menor', '5', `${ANIMAL_NADA}; humano sacia 2 a menos; só matando a Fome fica abaixo de 2`],
        ['8', '+5 dados', '4 superficiais', '+4 dados', 'Nível 4 ou menor', '5', `${ANIMAL_NADA}; humano sacia 2 a menos; só matando a Fome fica abaixo de 3`],
        ['9', '+6 dados', '4 superficiais', '+4 dados', 'Nível 5 ou menor', '6', `${ANIMAL_NADA}; humano sacia 2 a menos; só matando a Fome fica abaixo de 3`],
        ['10', '+6 dados', '5 superficiais', '+5 dados', 'Nível 5 ou menor', '6', `${ANIMAL_NADA}; humano sacia 3 a menos; só matando a Fome fica abaixo de 3`],
      ],
    },
    nomeOriginal: 'Blood Potency',
    fonte: { livro: 'Corebook', pagina: 216 },
    confianca: 'certo',
  },
  humanidade: {
    id: 'humanidade',
    titulo: 'Humanidade',
    subtitulo: 'Moralidade',
    descricao:
      'O quanto o vampiro ainda se parece e age como gente. Personagens novos costumam começar em 7; Manchas acumuladas podem derrubá-la no fim da sessão.',
    niveis: [
      { nivel: 10, rotulo: 'Quase humano', descricao: 'Come, se cura e acorda quase como um mortal; o sol fere menos.' },
      { nivel: 9, rotulo: 'Compassivo', descricao: 'Parece apenas doente; tolera comida leve e fica acordado perto do amanhecer e do pôr do sol.' },
      { nivel: 8, rotulo: 'Consciente', descricao: 'Ainda sente o peso do mal que causa; o Rubor da Vida vem com mais facilidade.' },
      { nivel: 7, rotulo: 'Passável', descricao: 'Padrão: passa por mortal com esforço e ainda vê o assassinato como errado.' },
      { nivel: 6, rotulo: 'Pragmático', descricao: 'Mata se precisar para sobreviver; fingir funções humanas fica mais difícil.' },
      { nivel: 5, rotulo: 'Distante', descricao: 'Só se importa com as Pedras de Toque; começa a perder dados em interações com mortais.' },
      { nivel: 4, rotulo: 'Cadavérico', descricao: 'Aceita matar; a aparência fica mortiça e a comida não para no estômago.' },
      { nivel: 3, rotulo: 'Frio', descricao: 'Só a própria sobrevivência importa; já não consegue fingir intimidade humana.' },
      { nivel: 2, rotulo: 'Perverso', descricao: 'Cultiva prazeres cruéis e não se importa com ninguém; mortais o evitam.' },
      { nivel: 1, rotulo: 'Monstro', descricao: 'Nada além de sobreviver; à beira de perder-se para a Besta.' },
      { nivel: 0, rotulo: 'Perdido para a Besta', descricao: 'A Besta assume de vez; o Personagem sai das mãos do Jogador.' },
    ],
    nomeOriginal: 'Humanity',
    fonte: { livro: 'Corebook', pagina: 236 },
    confianca: 'certo',
  },
  fome: {
    id: 'fome',
    titulo: 'Fome',
    subtitulo: 'Estado do Sangue',
    descricao:
      'O desejo de sangue, de 0 a 5. Cada ponto troca um dado da parada por um dado de Fome, que pode gerar Críticos Bestiais e Falhas Bestiais. Testes de Despertar falhos aumentam a Fome; alimentar-se a reduz.',
    niveis: [
      { nivel: 0, rotulo: 'Saciado', descricao: 'Sem Fome alguma; só se chega aqui matando a presa.' },
      { nivel: 1, rotulo: 'Satisfeito', descricao: 'Fome leve; o vampiro está no controle.' },
      { nivel: 2, rotulo: 'Inquieto', descricao: 'O sangue chama, mas ainda é fácil ignorar.' },
      { nivel: 3, rotulo: 'Faminto', descricao: 'A Fome distrai e a Besta pesa nas decisões.' },
      { nivel: 4, rotulo: 'Voraz', descricao: 'Difícil pensar em outra coisa; os dados de Fome dominam as paradas.' },
      { nivel: 5, rotulo: 'Desesperado', descricao: 'No limite: um Teste de Despertar falho pede teste contra Frenesi.' },
    ],
    nomeOriginal: 'Hunger',
    fonte: { livro: 'Corebook', pagina: 205 },
    confianca: 'certo',
  },
  manchas: {
    id: 'manchas',
    titulo: 'Manchas',
    subtitulo: 'Humanidade',
    descricao:
      'Marcas na trilha de Humanidade por violar Convicções ou os Princípios da Crônica. No fim da sessão, o Teste de Remorso decide se a Humanidade cai; se as Manchas transbordam, o Personagem sofre Degeneração.',
    nomeOriginal: 'Stains',
    fonte: { livro: 'Corebook', pagina: 239 },
    confianca: 'certo',
  },
  vitalidade: {
    id: 'vitalidade',
    titulo: 'Vitalidade',
    subtitulo: 'Trilha de dano',
    descricao:
      'Quanto dano físico o Personagem aguenta: Vigor + 3. Dano superficial (/) se cura com Testes de Despertar; dano agravado (X) é bem mais lento. Trilha cheia deixa o Personagem Debilitado; toda agravada leva ao Torpor.',
    nomeOriginal: 'Health',
    fonte: { livro: 'Corebook', pagina: 126 },
    confianca: 'certo',
  },
  'forca-de-vontade': {
    id: 'forca-de-vontade',
    titulo: 'Força de Vontade',
    subtitulo: 'Trilha de dano',
    descricao:
      'Firmeza mental do Personagem: Autocontrole + Determinação. Gastar um ponto marca dano superficial e permite repetir até três dados que não sejam de Fome; zerada, deixa o Personagem Debilitado em testes Sociais e Mentais.',
    nomeOriginal: 'Willpower',
    fonte: { livro: 'Corebook', pagina: 158 },
    confianca: 'certo',
  },
}
