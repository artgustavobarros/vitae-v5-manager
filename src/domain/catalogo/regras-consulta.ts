import { DISCIPLINAS } from '../ficha'
import { itemCatalogo, nomeComOriginal } from './index'
import { CONSULTA_TERMOS } from './termos'
import type { ItemCatalogo, ItemConsultaRegra } from './tipos'

export type { ItemConsultaRegra }

export const CONSULTA_ATRIBUTOS: Record<string, ItemConsultaRegra> = {
  "forca": {
    "id": "forca",
    "titulo": "Força",
    "subtitulo": "Atributo Físico",
    "descricao": "A Força determina o tamanho de um mortal que você pode levantar, o quão forte você pode atingi-lo e o quanto de força você pode obrigar seu corpo morto a exercer.",
    "niveis": [
      {
        "nivel": 1,
        "rotulo": "• Fraco",
        "descricao": "Você pode esmagar facilmente uma latinha de cerveja."
      },
      {
        "nivel": 2,
        "rotulo": "•• Médio",
        "descricao": "Você é fisicamente mediano."
      },
      {
        "nivel": 3,
        "rotulo": "••• Notável",
        "descricao": "Você pode ser capaz de arrombar uma porta de madeira."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Excepcional",
        "descricao": "Você é um espécime de físico privilegiado, provavelmente com uma musculatura vistosa."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Ápice humano",
        "descricao": "Você é um verdadeiro pináculo de força e provavelmente é capaz de arrombar uma porta corta-fogo de metal, rasgar uma cerca de arame ou estourar um portão trancado por correntes."
      }
    ]
  },
  "destreza": {
    "id": "destreza",
    "titulo": "Destreza",
    "subtitulo": "Atributo Físico",
    "descricao": "A Destreza governa sua agilidade e elegância, a rapidez com que você se esquiva de uma estaca que mira seu coração e quanto controle motor fino você possui quando está contra o relógio.",
    "niveis": [
      {
        "nivel": 1,
        "rotulo": "• Fraco",
        "descricao": "Você pode correr, mas se equilibrar e se esquivar são um desafio."
      },
      {
        "nivel": 2,
        "rotulo": "•• Médio",
        "descricao": "Sua arrancada é sólida e, às vezes, você parece gracioso em seus movimentos."
      },
      {
        "nivel": 3,
        "rotulo": "••• Notável",
        "descricao": "Sua agilidade é impressionante e sua coordenação é tão boa quanto a de qualquer amador treinado."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Excepcional",
        "descricao": "Você pode se destacar em acrobacias e se mover de uma maneira que poucos humanos conseguem."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Ápice humano",
        "descricao": "Seus movimentos são fluidos e hipnóticos — quase sobre-humanos."
      }
    ]
  },
  "vigor": {
    "id": "vigor",
    "titulo": "Vigor",
    "subtitulo": "Atributo Físico",
    "descricao": "Sua resistência física. Vigor absorve danos físicos, como uma bala em alta velocidade ou a lâmina de um caçador, além de permitir que você não ceda a esforço árduo. \n\nSeu Vigor + 3 resulta no seu valor de Vitalidade.",
    "niveis": [
      {
        "nivel": 1,
        "rotulo": "• Fraco",
        "descricao": "Mesmo esforços menores o deixam sem fôlego."
      },
      {
        "nivel": 2,
        "rotulo": "•• Médio",
        "descricao": "Você pode levar uma surra, mas considera fazer as pazes."
      },
      {
        "nivel": 3,
        "rotulo": "••• Notável",
        "descricao": "Alguns dias de caminhada difícil com uma mochila pesada não são problema para você."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Excepcional",
        "descricao": "Você pode vencer uma maratona ou aguentar grandes quantidades de dor, ao menos fisicamente."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Ápice humano",
        "descricao": "Mesmo se fosse um mortal, você nunca derramaria uma gota de suor."
      }
    ]
  },
  "carisma": {
    "id": "carisma",
    "titulo": "Carisma",
    "subtitulo": "Atributo Social",
    "descricao": "O Carisma mede seu charme natural, graça e sex appeal. Quando você tem este Atributo, ele atrai as pessoas para você, facilitando muito sua alimentação. \n\nO Carisma não depende de boa aparência, que é a sua própria Qualidade.",
    "niveis": [
      {
        "nivel": 1,
        "rotulo": "• Fraco",
        "descricao": "Você pode falar claramente, embora poucas pessoas tendam a ouvir."
      },
      {
        "nivel": 2,
        "rotulo": "•• Médio",
        "descricao": "Geralmente agradável, apesar de sua natureza não viva, você pode até fazer amigos."
      },
      {
        "nivel": 3,
        "rotulo": "••• Notável",
        "descricao": "As pessoas confiam em você implicitamente, por isso você faz amigos com facilidade."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Excepcional",
        "descricao": "Você possui magnetismo pessoal significativo e atrai seguidores como moscas."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Ápice humano",
        "descricao": "Você pode liderar uma cidade em rebelião, se assim quiser."
      }
    ]
  },
  "manipulacao": {
    "id": "manipulacao",
    "titulo": "Manipulação",
    "subtitulo": "Atributo Social",
    "descricao": "Manipulação é a sua capacidade de convencer os outros do seu ponto de vista, mentir de forma convincente e partir após enganar alguém sem que ninguém tenha notado.",
    "niveis": [
      {
        "nivel": 1,
        "rotulo": "• Fraco",
        "descricao": "Desde que seja honesto, você pode convencer as pessoas a fazer o que você quer."
      },
      {
        "nivel": 2,
        "rotulo": "•• Médio",
        "descricao": "Sua capacidade de enganar supera a vontade dos simplórios e fracos de mente."
      },
      {
        "nivel": 3,
        "rotulo": "••• Notável",
        "descricao": "Você nunca precisa pagar o preço total de nada."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Excepcional",
        "descricao": "Você poderia ser um líder de um culto — ou um político."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Ápice humano",
        "descricao": "Você poderia convencer o Príncipe a investir em propriedades no deserto, ou talvez até a cancelar uma Caçada de Sangue por sua cabeça."
      }
    ]
  },
  "autocontrole": {
    "id": "autocontrole",
    "titulo": "Autocontrole",
    "subtitulo": "Atributo Social",
    "descricao": "O Autocontrole permite que você permaneça calmo, controle suas emoções e tranquilize os outros. Também representa sua capacidade de manter a calma em tudo, de tiroteios a encontros íntimos. \n\nAutocontrole + Determinação resultam na sua Força de Vontade.",
    "niveis": [
      {
        "nivel": 1,
        "rotulo": "• Fraco",
        "descricao": "O menor insulto ou confronto pode levá-lo ao frenesi."
      },
      {
        "nivel": 2,
        "rotulo": "•• Médio",
        "descricao": "Você pode subjugar seus instintos predatórios na maioria das situações não hostis."
      },
      {
        "nivel": 3,
        "rotulo": "••• Notável",
        "descricao": "Outros procuram sua orientação quando o sangue atinge o ventilador."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Excepcional",
        "descricao": "Você pode blefar sem esforço nas cartas e administrar sua Besta até certo ponto."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Ápice humano",
        "descricao": "A Besta é seu animal de estimação."
      }
    ]
  },
  "inteligencia": {
    "id": "inteligencia",
    "titulo": "Inteligência",
    "subtitulo": "Atributo Mental",
    "descricao": "A Inteligência mede sua capacidade de pensar, pesquisar e aplicar a lógica. Você pode lembrar e analisar informações de livros ou de seus sentidos. Nenhum enigma ou mistério pode iludir os verdadeiramente inteligentes.",
    "niveis": [
      {
        "nivel": 1,
        "rotulo": "• Fraco",
        "descricao": "Você pode ler e escrever com competência, embora alguns termos o confundam."
      },
      {
        "nivel": 2,
        "rotulo": "•• Médio",
        "descricao": "Você é inteligente o suficiente para perceber suas limitações."
      },
      {
        "nivel": 3,
        "rotulo": "••• Notável",
        "descricao": "Você é brilhante, capaz de juntar pistas sem dificuldade."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Excepcional",
        "descricao": "Você provavelmente é consultado por membros do Clã Tremere por sua sabedoria."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Ápice humano",
        "descricao": "O termo \"gênio\" não abarca as profundezas e o alcance de seu intelecto."
      }
    ]
  },
  "raciocinio": {
    "id": "raciocinio",
    "titulo": "Raciocínio",
    "subtitulo": "Atributo Mental",
    "descricao": "O Raciocínio é usado para pensar com rapidez e reagir corretamente com base em pouca informação. \"Você ouve um som\" é Raciocínio; \"Você ouve dois guardas chegando\" é Inteligência. O Raciocínio permite que você perceba uma emboscada ou responda de bate-pronto à Harpia no tribunal, em vez de pensar na melhor resposta apenas na noite seguinte.",
    "niveis": [
      {
        "nivel": 1,
        "rotulo": "• Fraco",
        "descricao": "Você acaba entendendo, mas precisa de explicação."
      },
      {
        "nivel": 2,
        "rotulo": "•• Médio",
        "descricao": "Você pode apostar a sorte no pôquer ou pisar nos freios a tempo. Quase sempre."
      },
      {
        "nivel": 3,
        "rotulo": "••• Notável",
        "descricao": "Você pode analisar uma situação e descobrir rapidamente a melhor rota de fuga."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Excepcional",
        "descricao": "Você nunca é pego desprevenido e sempre tem uma resposta inteligente na ponta da língua."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Ápice humano",
        "descricao": "Você pensa e responde mais rapidamente do que a maioria das pessoas pode compreender."
      }
    ]
  },
  "determinacao": {
    "id": "determinacao",
    "titulo": "Determinação",
    "subtitulo": "Atributo Mental",
    "descricao": "A Determinação fornece foco e propósito. Ela mede sua concentração e fortitude mental. A Determinação impele vigílias que varam a noite e bloqueiam distrações. \n\nSua Força de Vontade é igual ao seu Autocontrole + Determinação.",
    "niveis": [
      {
        "nivel": 1,
        "rotulo": "• Fraco",
        "descricao": "Você só presta atenção nas coisas mais urgentes."
      },
      {
        "nivel": 2,
        "rotulo": "•• Médio",
        "descricao": "Você consegue se concentrar por um longo período, contanto que não seja muito longo."
      },
      {
        "nivel": 3,
        "rotulo": "••• Notável",
        "descricao": "Distraí-lo exige mais esforço do que a maioria das pessoas está disposta a fazer."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Excepcional",
        "descricao": "Você pode superar obstáculos e chegar a uma dedução empregando nada mais do que força-bruta mental."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Ápice humano",
        "descricao": "Você consegue pensar em meio a um tiroteio ou vigiar a porta de uma orgia de sangue e depois limpar cada gota ou projétil derramado."
      }
    ]
  }
}

export const CONSULTA_HABILIDADES: Record<string, ItemConsultaRegra> = {
  "armas-brancas": {
    "id": "armas-brancas",
    "titulo": "Armas Brancas",
    "subtitulo": "Habilidade Física",
    "descricao": "Use Armas Brancas para manejar armas portáteis como facas, correntes e tacos de beisebol com destreza. Uma estaca é uma arma branca, frequentemente encontrada nas mãos de supostos caçadores.",
    "exemplosEspecializacoes": [
      "Armas Improvisadas",
      "Correntes",
      "Desarme",
      "Esgrima",
      "Espadas",
      "Estacas",
      "Facas",
      "Garrotes",
      "Machados",
      "Porretes"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você consegue brandir um bastão ou uma arma de lâmina e, na maior parte do tempo, atingir os alvos pretendidos."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Sua clara competência com uma arma em mãos deveria fazer com que seus atacantes hesitassem."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Sua habilidade com uma arma branca é reconhecida em todo o domínio."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Os idiotas trouxeram uma arma de fogo para a sua briga de faca."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você é o mestre de armas do domínio, procurado por Membros de toda parte por sua habilidade."
      }
    ]
  },
  "armas-de-fogo": {
    "id": "armas-de-fogo",
    "titulo": "Armas de Fogo",
    "subtitulo": "Habilidade Física",
    "descricao": "Deixar uma vítima com buracos na garganta: investigação completa da Segunda Inquisição. Deixar uma vítima com buracos na cabeça: apenas mais um sábado à noite no Rio de Janeiro. Cainitas usam Armas de Fogo não somente pelas razões humanas (eficiência e emoção), mas também para preservar a Máscara.\n\nEsta Perícia compreende familiaridade com armas de pequeno porte, de pistolas de defesa a fuzis de assalto. Ela também inclui outras armas acionadas por gatilho, como bestas e lança-granadas.\n\nFinalmente, engloba a limpeza, destravamento e recarga rápida desse armamento.",
    "exemplosEspecializacoes": [
      "Atirador de Elite",
      "Bestas",
      "Comércio de Armas",
      "Fabricação de Armas de Fogo",
      "Recarga Manual",
      "Saque Rápido",
      "Tiro de Exibição"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você disparou uma arma algumas vezes, no estande de tiro ou em circunstâncias menos formais."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você sabe (e sabe como) manter sua arma limpa, desmontá-la e remontá-la."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você já esteve na merda (ou \"viu o elefante\", se tiver mais de um século) e conseguiu escapar do outro lado."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você domina disparos acrobáticos, tiros localizados, disparos em movimento — basicamente qualquer coisa que termine em um tiro."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você vem praticando desde a estreia da Winchester."
      }
    ]
  },
  "atletismo": {
    "id": "atletismo",
    "titulo": "Atletismo",
    "subtitulo": "Habilidade Física",
    "descricao": "Atletismo permite ultrapassar alguém em uma perseguição, saltar para fora do caminho de um carro em alta velocidade, além de escalar e nadar como uma pessoa viva saudável e vigorosa.\n\nUm personagem pode usar Atletismo no lugar de qualquer Perícia de combate Físico em uma rolagem de conflito, mas, nesse caso, nunca inflige dano ao oponente, não importando a quantidade de sucessos obtidos.",
    "exemplosEspecializacoes": [
      "Acrobacia",
      "Arremesso",
      "Corrida de Longa Distância",
      "Escalada",
      "Natação",
      "Parkour",
      "Salto",
      "Tiro com Arco"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você sempre foi atento nas aulas de educação física e ainda mantém agilidade nos passos."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Apesar de morto, você ainda tem o preparo de um mortal que se exercita regularmente."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você está em excelente forma e poderia competir em esportes profissionais — ao menos em jogos noturnos."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Com suas habilidades de parkour, por que você precisaria se transformar em morcego?"
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Recordes olímpicos esperam por você; pouquíssimos humanos no ápice físico conseguem o que você faz. Outros vampiros confundem sua perícia com Disciplinas Físicas."
      }
    ]
  },
  "briga": {
    "id": "briga",
    "titulo": "Briga",
    "subtitulo": "Habilidade Física",
    "descricao": "Briga permite aos personagens atingirem seus alvos quando desferem golpes com punhos, botas ou garras. Contanto que você não empunhe uma arma, o ataque se qualifica como briga — desde um elegante aikijutsu até uma luta de rua suja e brutal.",
    "exemplosEspecializacoes": [
      "Agarrões",
      "Animais",
      "Briga de Bar",
      "Combate Esportivo",
      "Em Forma de Besta de Protean",
      "Lobisomens",
      "Membros",
      "Mortais Armados",
      "Mortais Desarmados"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você teve uma criação difícil e precisou brigar pelo seu espaço. Ainda tem alguma ginga."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você recebeu treinamento para acertar alguém com força e precisão."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você se garante com sobras em qualquer confronto direto."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Ou você recebeu treinamento de elite no nível Spetsnaz, ou passou décadas da não-vida metido em combates."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você venceria campeonatos de MMA mesmo sem utilizar nenhum poder vampírico."
      }
    ]
  },
  "conducao": {
    "id": "conducao",
    "titulo": "Condução",
    "subtitulo": "Habilidade Física",
    "descricao": "Qualquer um (exceto talvez vampiros de quinhentos anos) pode aprender a dirigir um carro. A Perícia Condução denota a capacidade de pilotar com velocidade e segurança sob condições adversas ou situações de alto estresse: andar fora da estrada, acelerar para escapar de emboscadas, vencer rachas de rua e fugir de perseguições da Segunda Inquisição.",
    "exemplosEspecializacoes": [
      "Acrobacias",
      "Caminhões",
      "Carros Clássicos",
      "Despistar",
      "Manobras de Evasão",
      "Motocicletas",
      "Rachas de Rua",
      "Veículos Todo-Terreno"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você é um motorista prudente, dificilmente cometendo qualquer infração ou deslize."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você pisa fundo sem grande medo de acidentes, desde que a visibilidade seja boa."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você já venceu perseguições de carro, conquistando moral e respeito entre os Anarquistas."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você poderia trabalhar como dublê profissional ou ser o motorista particular de um Príncipe ou Barão."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você conhece veículos por dentro e por fora. Quase ninguém iguala sua perícia e reflexos no volante."
      }
    ]
  },
  "furtividade": {
    "id": "furtividade",
    "titulo": "Furtividade",
    "subtitulo": "Habilidade Física",
    "descricao": "Furtividade permite ao personagem seguir e vigiar alvos nas sombras, tornando vampiros dotados desta perícia caçadores superlativos. Eles tiram proveito da capacidade de espionar, esgueirar-se silenciosamente e misturar-se a multidões quando necessário.",
    "exemplosEspecializacoes": [
      "Camuflagem em Multidões",
      "Deslocamento Silencioso",
      "Disfarce",
      "Emboscadas",
      "Esconder-se",
      "Ocultação Urbana",
      "Perseguição Silenciosa",
      "Vida Selvagem"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Encontrar você sob o manto da escuridão ou camuflado é uma tarefa difícil."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você passa despercebido por observadores casuais e espreita presas desatentas sem levantar qualquer suspeita."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você despista guardas em patrulha, movendo-se com passos suaves e ocultando-se facilmente."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Sua passagem sutil e silenciosa faria inveja a um ninja de elite — ou o tornaria um oponente à altura."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Até os Filhos de Haqim procurariam seus conselhos sobre camuflagem e perseguição nas sombras — se conseguissem te encontrar."
      }
    ]
  },
  "ladroagem": {
    "id": "ladroagem",
    "titulo": "Ladroagem",
    "subtitulo": "Habilidade Física",
    "descricao": "Esta Perícia engloba a familiaridade com ferramentas e técnicas para arrombar fechaduras, plantar escutas, desativar alarmes residenciais e automotivos convencionais, falsificação manual, ligação direta em automóveis e abertura de cofres, além de incontáveis formas de invasão e arrombamento. Personagens também a utilizam para projetar sistemas de segurança sofisticados ou deduzir falhas em invasões passadas. Ventrue costumam chamar esta perícia de \"Segurança\". Hoje em dia, a maioria dos sistemas de ponta conta com controles computadorizados e alarmes eletrônicos, exigindo também a Perícia Tecnologia para serem superados.",
    "exemplosEspecializacoes": [
      "Alarmes",
      "Análise de Segurança",
      "Arrombamento de Casas",
      "Bater Carteira",
      "Falsificação",
      "Furto de Veículos",
      "Gazua e Fechaduras",
      "Violação de Cofres"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você consegue abrir uma fechadura simples ou bater a carteira de alguém distraído."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você faz ligação direta em um carro e furta itens de lojas sem qualquer esforço."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você identifica a posição de câmeras de segurança e sensores de alarme para contorná-los com facilidade."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você burla teclados eletrônicos, clona crachás de identificação e arromba cofres tradicionais."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você consegue entrar — e sair — do cofre blindado de um banco multinacional sem ser pego."
      }
    ]
  },
  "oficios": {
    "id": "oficios",
    "titulo": "Ofícios",
    "subtitulo": "Habilidade Física",
    "descricao": "Ofícios abrange amplamente as artes práticas e manuais, a criação de itens e utilitários que vão do estético ao funcional, desde moldar cerâmica até construir e reforçar seu próprio refúgio. Ao adquirir esta Perícia, você recebe uma especialidade gratuita. Diferente da maioria das perícias, você pode ter mais especialidades em Ofícios do que pontos na Perícia.",
    "exemplosEspecializacoes": [
      "Carpintaria",
      "Costura",
      "Design",
      "Escultura",
      "Forja de Armas",
      "Marcenaria",
      "Pintura",
      "Talha"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você é um amador dedicado e sabe muito bem o que está fazendo."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Seu trabalho artesanal é elogiado e admirado pela sólida funcionalidade."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Suas criações podem ser deslumbrantes ou aterrorizantes, mas sua intenção é sempre nítida."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Sua perícia e arte são reverenciadas tanto pelo gado quanto pelos Membros que conhecem suas obras."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você é a escolha natural para conceber as obras centrais que decoram e fascinam as festas no Elysium."
      }
    ]
  },
  "sobrevivencia": {
    "id": "sobrevivencia",
    "titulo": "Sobrevivência",
    "subtitulo": "Habilidade Física",
    "descricao": "Sobrevivência confere a habilidade de subsistir na natureza selvagem e sob condições climáticas adversas, retornando à civilização em segurança: navegar pelas estrelas, erguer um refúgio improvisado contra a alvorada e notar rastros de lobisomens antes que seja tarde demais. Algumas de suas funções também se aplicam a parques, zonas industriais abandonadas e outros ermos da selva de pedra.",
    "exemplosEspecializacoes": [
      "Abrigos",
      "Armadilhas",
      "Caça",
      "Deserto",
      "Exploração Urbana",
      "Florestas",
      "Rastreamento",
      "Selva Tropical"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você conhece bem as trilhas e os trechos selvagens no entorno do seu domínio."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você passa mais tempo a céu aberto do que sob tetos e rastreia qualquer pessoa sem noções de mateiro."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você sobrevive fora da cidade, armando emboscadas para capturar mortais e garantindo abrigo diurno seguro."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você prospera na natureza longe do asfalto como o verdadeiro predador que é."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Membros do Clã Gangrel correm em alcateias ao seu lado — se conseguirem acompanhar seu ritmo."
      }
    ]
  },
  "etiqueta-com-animais": {
    "id": "etiqueta-com-animais",
    "titulo": "Etiqueta com Animais",
    "subtitulo": "Habilidade Social",
    "descricao": "Empatia com Animais permite subjugar, acalmar e até mesmo criar laços com animais. Esta Perícia possibilita prever a reação de um bicho em determinada situação, adestrar criaturas domésticas ou acalmar e enfurecer espécimes selvagens. Sem esta Perícia, a maioria das criaturas vivas evita instintivamente ou reage com agressividade à presença fria e predatória dos vampiros.",
    "exemplosEspecializacoes": [
      "Acalmar",
      "Adestramento de Ataque",
      "Cavalos",
      "Cães",
      "Cobras",
      "Falcoaria",
      "Gatos",
      "Lobos",
      "Ratos",
      "Truques e Acrobacias"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Os animais ficam cautelosos perto de você, mas não entram em pânico nem tentam morder."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Os animais permanecem dóceis ao seu redor, agindo como se você não estivesse ali, a menos que você crie um vínculo."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Os animais te tratam como um dono amigável e acolhedor, a menos que sejam provocados."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você atrai feras para a sua órbita; pouquíssimos animais mantêm a agressividade ao se aproximarem."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você pressente os sentimentos e impulsos de um animal, e ele consegue compreender e agir conforme a sua vontade."
      }
    ]
  },
  "etiqueta": {
    "id": "etiqueta",
    "titulo": "Etiqueta",
    "subtitulo": "Habilidade Social",
    "descricao": "Etiqueta é a capacidade de identificar e corresponder às convenções sociais da cena atual, ditar novos protocolos e agradar a todos ao redor com graça e desenvoltura. Aplique esta Perícia tanto na alta sociedade mortal quanto nas cortes refinadas dos Membros.",
    "exemplosEspecializacoes": [
      "Alta Sociedade e Celebridades",
      "Anarquistas",
      "Camarilla",
      "Corporativo",
      "Elysium",
      "Feudal",
      "Sociedades Secretas"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você sabe como se dirigir ao governante local sem cometer nenhuma gafe humilhante."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você domina os códigos de conduta de cada um dos clubes e pontos noturnos influentes do domínio."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você impressiona até os mais exigentes com seu domínio de polidez, cortesia e elegância."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Seu comportamento lança tendências, especialmente quando decide romper com normas tradicionais."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "O Guardião do Elysium e as Harpias consultam você para estabelecer o protocolo cerimonial do domínio."
      }
    ]
  },
  "intimidacao": {
    "id": "intimidacao",
    "titulo": "Intimidação",
    "subtitulo": "Habilidade Social",
    "descricao": "Intimidação é o poder de coagir, pressionar, ameaçar e impor sua vontade pela força para conquistar uma vitória social. Vampiros que dependem de Intimidação não hesitam em quebrar o moral — e, ocasionalmente, os ossos dos dedos — de seus adversários.",
    "exemplosEspecializacoes": [
      "Ameaças Veladas",
      "Coerção Física",
      "Encaradas",
      "Extorsão",
      "Insultos Mordazes",
      "Interrogatório"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você consegue desferir insultos cortantes com precisão e frieza cirúrgica."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você impõe respeito e intimida a maioria dos humanos sem encontrar resistência."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Sua postura predatória e atitudes implacáveis construíram uma reputação temida por todos."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você já superou em muito a necessidade de ameaças meramente físicas para se fazer obedecer."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Mesmo outros Membros dão um passo atrás quando você dá um passo à frente."
      }
    ]
  },
  "lideranca": {
    "id": "lideranca",
    "titulo": "Liderança",
    "subtitulo": "Habilidade Social",
    "descricao": "Liderança concede a aptidão para conduzir multidões, comandar destacamentos, elevar o moral de aliados e conter motins inflamados. Um Príncipe ou Barão firme deve possuir Liderança, sob o risco inevitável de perder o trono.",
    "exemplosEspecializacoes": [
      "Comando",
      "Dinâmica de Equipe",
      "Inspiração",
      "Matilha de Guerra",
      "Oratória",
      "Práxis"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você já liderou grupos informais e sabe organizar Membros que compartilham dos seus interesses."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Sua voz se faz ouvir no conselho, e até seus superiores param para escutar suas ponderações."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você sabe comandar no campo de batalha e guiar seus subordinados mesmo diante da morte."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você inspira combatentes feridos e desesperados a lutar enquanto você estiver à frente liderando-os."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Suas palavras enchem o peito morto de um vampiro de tanto vigor que seu coração parece voltar a pulsar."
      }
    ]
  },
  "manha": {
    "id": "manha",
    "titulo": "Manha",
    "subtitulo": "Habilidade Social",
    "descricao": "Manha capacita os personagens a falar a língua e navegar pelas dinâmicas sociais das ruas e do submundo do crime. Você compreende gírias, códigos de conduta ilegais, lê símbolos e pichações e reproduz sinais de gangues com perfeição.",
    "exemplosEspecializacoes": [
      "Comércio de Armas",
      "Drogas",
      "Gangues e Facções",
      "Mercado Negro",
      "Pichação e Códigos",
      "Prostituição",
      "Receptação de Cargas",
      "Reputação nas Ruas",
      "Sobrevivência Urbana",
      "Suborno"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você sabe exatamente onde encontrar drogas e prazer proibido no seu domínio."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você sabe quais gangues atuam em cada bairro, suas cores e rivalidades. Talvez tenha sua própria tag de picho."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você distingue produto de qualidade do refugo, arranja armas quentes e se camufla entre criminosos e moradores de rua."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Quando criminosos da cidade dizem \"eu conheço um cara\", esse cara é você."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você contrata, comanda ou arquiteta quase qualquer atividade ilícita em qualquer ponto da sua cidade."
      }
    ]
  },
  "performance": {
    "id": "performance",
    "titulo": "Performance",
    "subtitulo": "Habilidade Social",
    "descricao": "Performance engloba diversas formas de artes cênicas e expressivas, da dança e poesia até o humor e a contação de histórias. Você pode ser um artista brilhante por mérito próprio ou um estudante apaixonado dos palcos. Ao adquirir esta Perícia, você recebe uma especialidade gratuita.",
    "exemplosEspecializacoes": [
      "Bateria e Percussão",
      "Canto",
      "Comédia",
      "Dança",
      "Discurso Público",
      "Instrumentos de Sopro",
      "Oratória",
      "Poesia",
      "Rap",
      "Teclados e Piano",
      "Teatro",
      "Violão e Guitarra",
      "Violino"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você é a alma de qualquer festa, embora ainda não levasse sua apresentação aos palcos."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você já se apresentou em público com recepção mista: alguns adoram, outros torcem o nariz."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você é um profundo conhecedor técnico e praticante experiente da sua arte performática."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você executa sua arte de forma deslumbrante, cativando até os Toreador mais céticos e refinados."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "O improviso não traz receio algum: a cada noite um público diferente, a cada noite um espetáculo triunfal."
      }
    ]
  },
  "persuasao": {
    "id": "persuasao",
    "titulo": "Persuasão",
    "subtitulo": "Habilidade Social",
    "descricao": "Use Persuasão ao tentar convencer os outros de que você sabe o que é melhor para eles — e de que uma mordidinha não vai doer nada. Negociadores habilidosos manipulam as emoções das presas e apelam à lógica dos seus iguais. Persuasão se aplica em tribunais mortais e cortes principescas, salas de reunião, mesas de bar e quartos fechados.",
    "exemplosEspecializacoes": [
      "Argumentação Jurídica",
      "Barganha",
      "Conversa Fiada",
      "Interrogatório",
      "Lábia Rápida",
      "Negociação",
      "Retórica"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você consegue fechar um bom negócio com compradores que já estejam motivados."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você sempre consegue um desconto camarada ou descobre em primeira mão a fofoca mais recente."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você sempre encontra uma proposta de acordo viável no meio de qualquer disputa ou impasse."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "A parte contrária começa a buscar um acordo amigável assim que te vê no tribunal, seja mortal ou vampírico."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você muito provavelmente é o próprio diabo da língua de prata original."
      }
    ]
  },
  "sagacidade": {
    "id": "sagacidade",
    "titulo": "Sagacidade",
    "subtitulo": "Habilidade Social",
    "descricao": "Sagacidade concede a habilidade de interpretar linguagem corporal, notar pistas sutis no tom de voz ou na expressão facial e discernir a verdade de mentiras. Também possibilita compreender as motivações e impulsos ocultos por trás das ações alheias.",
    "exemplosEspecializacoes": [
      "Ambições",
      "Desejos",
      "Detectar Mentiras",
      "Emoções",
      "Empatia",
      "Fobias",
      "Interrogatório",
      "Motivações",
      "Vícios"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você enxerga com clareza através de bravatas vazias e fingimentos simples."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você capta a corrente de emoções veladas entre humanos e, por vezes, até mesmo entre Membros."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você presta apoio psicológico com mais perspicácia do que analistas mortais que não desejam devorar seus pacientes."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você é um polígrafo morto-vivo: somente os golpistas mais brilhantes conseguem esconder algo de você."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "As pessoas podem até ser livros de sangue, mas estão impressas em letras garrafais para o seu olhar."
      }
    ]
  },
  "subterfugio": {
    "id": "subterfugio",
    "titulo": "Subterfúgio",
    "subtitulo": "Habilidade Social",
    "descricao": "Subterfúgio é a arte refinada de mentir convincentemente, tecer intrigas e criar justificativas perfeitas para atos condenáveis. Esta Perícia define seu talento para segredos, traições e jogos duplos. Subterfúgio também é utilizado em jogos de sedução e para emular o comportamento orgânico dos mortais.",
    "exemplosEspecializacoes": [
      "Blefe",
      "Fingir Mortalidade",
      "Golpe Longo",
      "Inocência Aparente",
      "Mentiras Impecáveis",
      "Sedução"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você conta mentiras simples e diretas com total naturalidade e credibilidade."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você engana facilmente pessoas ingênuas, jovens ou velhas, fazendo com que entreguem seus bens."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você opera em múltiplos níveis, contando mentiras calculadas para serem descobertas só para sustentar fraudes maiores."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você mantém disfarces profundos indefinidamente como o agente duplo ideal. Talvez você realmente seja!"
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Absolutamente ninguém no domínio acredita que você tenha sequer um único ponto em Subterfúgio."
      }
    ]
  },
  "ciencia": {
    "id": "ciencia",
    "titulo": "Ciência",
    "subtitulo": "Habilidade Mental",
    "descricao": "Ciência é um vasto horizonte de conhecimento, englobando desde os princípios biológicos básicos até a compreensão da entropia universal. As leis científicas regem o mundo material, e os vampiros que almejam dominá-lo se dedicam ao seu estudo. Assim como em Erudição, personagens que adquirem pontos em Ciência recebem uma especialidade gratuita.",
    "exemplosEspecializacoes": [
      "Astronomia",
      "Biologia",
      "Demolições e Explosivos",
      "Engenharia",
      "Física",
      "Genética",
      "Geologia",
      "Matemática",
      "Química"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você tem noções científicas sólidas e compreende os princípios por trás dos blocos fundamentais da vida."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você consegue explicar com precisão a outro vampiro as teorias científicas concorrentes sobre a biologia do Abraço."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você é um excelente gestor científico: coordena laboratórios, interpreta relatórios complexos e conserta instrumentos de pesquisa."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você é um especialista renomado na sua área científica de atuação e em disciplinas correlatas."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Pouquíssimos colegas no mundo se igualam ao seu intelecto, e cientistas ilustres buscam sua orientação e mentoria."
      }
    ]
  },
  "erudicao": {
    "id": "erudicao",
    "titulo": "Erudição",
    "subtitulo": "Habilidade Mental",
    "descricao": "Erudição reflete a erudição formal, ensino superior e capacidade de pesquisar áreas das ciências humanas e artes liberais. Estudos históricos, por exemplo, estão longe de ser \"apenas acadêmicos\" quando seus rivais imortais viveram — e deixaram vestígios — naquelas épocas. Ao adquirir esta Perícia, você recebe uma especialidade gratuita. (Para idiomas estrangeiros, utilize a Vantagem Linguística).",
    "exemplosEspecializacoes": [
      "Arquitetura",
      "Ensino e Tutoria",
      "Filosofia",
      "História (campo ou período específico)",
      "História da Arte",
      "Jornalismo",
      "Literatura",
      "Pesquisa Documental",
      "Teologia"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Educação básica e secundária sólida; cursos noturnos em faculdades comunitárias."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Graduação universitária básica ou instrução por um tutor razoável; bacharelado padrão."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Formação acadêmica avançada ou tutoria dedicada de alto nível; mestrado ou doutorado de renome."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Pesquisa altamente especializada além da academia, mergulhando em temas que poucos humanos compreendem."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Saber erudito refinado e enciclopédico, sendo referência e procurado por sábios vivos e mortos para aconselhamento."
      }
    ]
  },
  "financas": {
    "id": "financas",
    "titulo": "Finanças",
    "subtitulo": "Habilidade Mental",
    "descricao": "Finanças possibilita identificar tendências de mercado, realizar bons investimentos, manipular ações na bolsa e antecipar colapsos econômicos. Também permite estimar — e rastrear — o patrimônio alheio e intermediar grandes fusões financeiras. Em termos gerais, permite avaliar obras de arte, imóveis e bens comerciais. Os Ventrue chegam a valorizar esta Perícia mais do que algumas Disciplinas.",
    "exemplosEspecializacoes": [
      "Artes Plásticas e Avaliação de Bens",
      "Auditoria Forense",
      "Bancos",
      "Bolsa de Valores",
      "Contabilidade Empresarial",
      "Finanças Corporativas",
      "Lavagem de Dinheiro",
      "Manipulação Cambial",
      "Mercado Negro"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você sabe administrar um negócio próprio e manter a escrituração contábil em dia."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você gerencia divisões corporativas ou agências bancárias; suas declarações fiscais são perfeitamente plausíveis."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Graças ao comércio internacional, você atua com destaque como corretor nas principais bolsas do mundo."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Bancos de investimento seguem suas recomendações de mercado. Você oculta fraudes financeiras com maestria."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você faz o dinheiro realizar qualquer prodígio — desde colar nos seus bolsos até quebrar economias de nações inteiras."
      }
    ]
  },
  "investigacao": {
    "id": "investigacao",
    "titulo": "Investigação",
    "subtitulo": "Habilidade Mental",
    "descricao": "Investigação permite desvendar mistérios e casos mundanos ou sobrenaturais, encontrar pistas, interpretá-las e localizar pessoas desaparecidas. Os vampiros consideram esta Perícia especialmente útil quando uma presa valiosa escapa.",
    "exemplosEspecializacoes": [
      "Análise de Tráfego e Dados",
      "Criminologia",
      "Dedução Lógica",
      "Homicídios",
      "Mistérios Paranormais",
      "Perícia Forense",
      "Pessoas Desaparecidas"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você adora romances policiais e se enxerga como um detetive amador perspicaz."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você possui sólido conhecimento em criminologia e reconhece o modus operandi de criminosos locais."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você é, ou poderia ser, um detetive profissional de renome. Nada em uma cena de crime escapa aos seus olhos."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "O Xerife do domínio recorre aos seus serviços quando indivíduos desconhecidos sabotam a segurança da cidade."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você cria enigmas insolúveis para os outros e conduz uma existência indecifrável que raríssimos seres conseguem penetrar."
      }
    ]
  },
  "medicina": {
    "id": "medicina",
    "titulo": "Medicina",
    "subtitulo": "Habilidade Mental",
    "descricao": "Medicina permite remendar corpos feridos e diagnosticar causas de morte ou doenças em uma vítima. Também habilita o uso de equipamentos hospitalares, prescrição de remédios e estancamento (ou aceleração proposital) de hemorragias. Personagens usam Medicina para curar dano Agravado à Vitalidade em mortais.",
    "exemplosEspecializacoes": [
      "Cirurgia",
      "Farmácia e Farmacologia",
      "Flebotomia",
      "Hematologia",
      "Patologia",
      "Primeiros Socorros",
      "Tratamento de Traumas Graves",
      "Veterinária"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você conhece a anatomia básica e a dinâmica do fluxo arterial e venoso. Sabe primeiros socorros e RCP. Pode ter sido estudante de medicina em vida."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você trata traumas e patologias menores com facilidade e refina diagnósticos. Pode ter sido enfermeiro ou socorrista em vida."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Seu preparo permite conduzir grandes cirurgias e tratar traumas severos. Pode ter sido clínico geral ou intensivista em vida."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você diagnostica e trata quase todas as doenças existentes, exceto as mais raras do planeta. Pode ter sido um cirurgião ou especialista de ponta."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você é uma sumidade médica renomada internacionalmente, procurada com desespero tanto por mortais quanto por imortais."
      }
    ]
  },
  "ocultismo": {
    "id": "ocultismo",
    "titulo": "Ocultismo",
    "subtitulo": "Habilidade Mental",
    "descricao": "Ocultismo representa o conhecimento do universo místico e sobrenatural, estendendo-se desde os ritos de maçons e rosa-cruzes até estudiosos nodistas e magos autênticos. Você reconhece selos ocultos, grimórios e práticas de magia popular, sejam elas genuínas ou crendices inofensivas.",
    "exemplosEspecializacoes": [
      "Alquimia",
      "Bruxaria e Vodu",
      "Fadas",
      "Fantasmas e Aparições",
      "Feitiçaria de Sangue",
      "Grimórios Ocultos",
      "Infernalismo",
      "Lobisomens",
      "Magos Mortais",
      "Necromancia",
      "Nodismo",
      "Parapsicologia"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você conhece as lendas primordiais de Caim e dos Antediluvianos, e talvez tenha folheado cópias do Livro de Nod."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você separa fatos herméticos reais das tolices populares e modismos da cultura pop."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você tem experiência direta com fenômenos inexplicáveis até mesmo para os padrões dos Membros."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você é capaz de citar a maioria dos Antediluvianos pelo nome e até compreender a estrutura de rituais Tremere."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Mestres Tremere e Filhos de Haqim procuram sua consulta sobre saberes herméticos arcanos e profecias perdidas."
      }
    ]
  },
  "percepcao": {
    "id": "percepcao",
    "titulo": "Percepção",
    "subtitulo": "Habilidade Mental",
    "descricao": "Percepção governa a acuidade dos seus sentidos físicos e instintivos. Ela permite notar um assassino oculto nas sombras antes do bote, avistar uma chave descartada no lixo ou farejar o aroma quase imperceptível de um perfume no ar.",
    "exemplosEspecializacoes": [
      "Audição",
      "Camuflagem",
      "Emboscadas",
      "Faro",
      "Instintos",
      "Objetos Ocultos",
      "Perigos Naturais",
      "Trapaças e Armadilhas",
      "Visão"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você tem um histórico natural de notar quando qualquer coisa mínima está fora do lugar."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você percebe comportamentos erráticos ou padrões incomuns de linguagem corporal em um indivíduo."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você enxerga através da maioria dos disfarces e pressente perigos ocultos ou pistas encobertas."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Mesmo quando está absorto ou distraído, pouquíssimas coisas escapam à sua atenção."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Seus sentidos atingiram o nível de prontidão e agudeza de um predador selvagem no ápice."
      }
    ]
  },
  "politica": {
    "id": "politica",
    "titulo": "Política",
    "subtitulo": "Habilidade Mental",
    "descricao": "Política abrange a diplomacia e os labirintos burocráticos: tanto no governo mortal quanto nas intrigas dos Membros. Você sabe como circular nas esferas de poder e exercer pressão sobre prefeituras, órgãos estaduais e além. Entre os vampiros, você tem informações privilegiadas sobre qual seita domina cada território, quem está em guerra com quem e onde os corpos estão enterrados. Literalmente.",
    "exemplosEspecializacoes": [
      "Anarquistas",
      "Camarilla",
      "Clã específico",
      "Diplomacia",
      "Governo Municipal",
      "Mídia e Imprensa",
      "Política Estadual",
      "Política Nacional"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você acompanha o cenário político mortal da sua região e sabe o básico do que os anciãos revelam sobre a política dos Membros."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você exerce influência efetiva em âmbito local ou sabe exatamente a quem recorrer para conseguir o que precisa."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você seria capaz de comandar campanhas eleitorais ou causar grande impacto na sua seita como uma promessa em ascensão."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "Você conhece a verdadeira personalidade e ambições das figuras que movem os pauzinhos na cidade, vivas ou mortas."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Você seria capaz de deduzir a identidade dos membros secretos do Círculo Interno da Camarilla."
      }
    ]
  },
  "tecnologia": {
    "id": "tecnologia",
    "titulo": "Tecnologia",
    "subtitulo": "Habilidade Mental",
    "descricao": "A Perícia Tecnologia é um alvo em constante transformação: ela governa a operação e a compreensão dos avanços técnicos modernos que a maioria dos vampiros anciãos considera misteriosos. Em 1870, cobria motores a vapor e eletricidade; hoje, rege redes de computadores, telecomunicações e inteligência artificial — os quais, por sua vez, controlam desde turbinas de usinas elétricas até a segurança de edifícios inteiros.",
    "exemplosEspecializacoes": [
      "Artilharia Eletrônica",
      "Construção de Computadores",
      "Criptografia e Segurança",
      "Hacking e Invasão",
      "Mineração de Dados",
      "Programação e Código",
      "Redes",
      "Sistemas de Vigilância",
      "Telefonia Móvel"
    ],
    "niveis": [
      {
        "nivel": 0,
        "rotulo": "Sem treino",
        "descricao": "Nenhum conhecimento ou prática; depende puramente do Atributo."
      },
      {
        "nivel": 1,
        "rotulo": "• Novato",
        "descricao": "Você sabe montar computadores domésticos, atualizar hardware e manter sistemas protegidos de vírus comuns."
      },
      {
        "nivel": 2,
        "rotulo": "•• Praticante",
        "descricao": "Você mascara endereços IP, opera drones com destreza e cria montagens digitais e adulterações fotográficas imperceptíveis."
      },
      {
        "nivel": 3,
        "rotulo": "••• Especialista",
        "descricao": "Você programa e dissemina seus próprios vírus e malwares sofisticados sem deixar rastros."
      },
      {
        "nivel": 4,
        "rotulo": "•••• Mestre",
        "descricao": "O próprio Príncipe do domínio pode te procurar pessoalmente para estruturar e auditar a segurança cibernética do domínio."
      },
      {
        "nivel": 5,
        "rotulo": "••••• Fenômeno",
        "descricao": "Na internet, ninguém sabe que você é um vampiro — ou sequer desconfia que você está lá."
      }
    ]
  }
}

export const CONSULTA_CLAS: Record<string, ItemConsultaRegra> = {
  'banu-haqim': {
    id: 'banu-haqim',
    titulo: 'Banu Haqim',
    subtitulo: 'Juízes e Assassinos',
    descricao: 'Eruditos e carrascos devotados a julgamentos morais e justiça severa, guiados pela busca de purificação através do Sangue.',
    disciplinas: ['Feitiçaria de Sangue', 'Celeridade', 'Ofuscação'],
    perdicao: 'O Sangue de outros vampiros tem apelo irresistível; alimentar-se de um Membro desperta fúria predatória.',
    compulsao: 'Julgamento: o vampiro é impelido a punir qualquer um que viole seu código moral pessoal.',
  },
  brujah: {
    id: 'brujah',
    titulo: 'Brujah',
    subtitulo: 'Rebeldes e Filósofos',
    descricao: 'Guerreiros de paixão inflamada que lideram revoltas e desafiam hierarquias estagnadas em nome de ideais apaixonados.',
    disciplinas: ['Celeridade', 'Potência', 'Presença'],
    perdicao: 'O sangue dos Brujah ferve com facilidade: sofrem penalidade para resistir ao Frenesi de fúria.',
    compulsao: 'Rebelião: revolta cega contra qualquer figura de autoridade ou imposição externa.',
  },
  gangrel: {
    id: 'gangrel',
    titulo: 'Gangrel',
    subtitulo: 'Feras e Andarilhos',
    descricao: 'Sobreviventes rústicos com afinidade íntima com os ermos selvagens e com a própria Besta animal.',
    disciplinas: ['Animalismo', 'Fortitude', 'Proteanismo'],
    perdicao: 'A cada Frenesi, manifestam temporariamente traços físicos ou comportamentais de animais da Besta.',
    compulsao: 'Impulso Animal: o pensamento racional recua, cedendo lugar a instintos de sobrevivência animal.',
  },
  hecata: {
    id: 'hecata',
    titulo: 'Hecata',
    subtitulo: 'Necromantes e Clã da Morte',
    descricao: 'Uma dinastia unificada de estudiosos da fronteira entre a vida e a morte, mestres das artes do pós-vida.',
    disciplinas: ['Auspícios', 'Fortitude', 'Oblívio'],
    perdicao: 'O Beijo Doloroso: a mordida do Hecata não causa prazer extático, mas dor atroz na vítima humana.',
    compulsao: 'Morbidez: obsessão por desvendar e contemplar a morte, cadáveres ou o sofrimento mortal.',
  },
  lasombra: {
    id: 'lasombra',
    titulo: 'Lasombra',
    subtitulo: 'Mestres das Sombras e Darwinistas',
    descricao: 'Predadores cruéis e implacáveis que moldam a escuridão literal e acreditam que apenas os mais aptos merecem comandar.',
    disciplinas: ['Dominação', 'Oblívio', 'Potência'],
    perdicao: 'Reflexos em espelhos e sensores tecnológicos distorcem ou falham na presença de sua aura sombria.',
    compulsao: 'Crueldade: a necessidade implacável de demonstrar superioridade e submeter os fracos.',
  },
  malkaviano: {
    id: 'malkaviano',
    titulo: 'Malkaviano',
    subtitulo: 'Visionários e Oráculos',
    descricao: 'Vampiros dotados de percepções clarividentes e perturbadoras, conectados pela misteriosa Teia de sua mente coletiva.',
    disciplinas: ['Auspícios', 'Dominação', 'Ofuscação'],
    perdicao: 'Perturbação mental incurável ligada à sua psique após o Abraço.',
    compulsao: 'Delírio: suas percepções se descolam da realidade física, obscurecendo a razão.',
  },
  ministerio: {
    id: 'ministerio',
    titulo: 'Ministério',
    subtitulo: 'Tentadores e Libertadores',
    descricao: 'Cultistas da serpente que quebram as correntes morais e sociais dos outros por meio do vício e da tentação.',
    disciplinas: ['Ofuscação', 'Presença', 'Proteanismo'],
    perdicao: 'Hipersensibilidade à luz e ao fogo; a luz intensa queima o dobro em sua carne.',
    compulsao: 'Transgressão: o desejo irresistível de seduzir ou corromper outros a quebrarem suas convicções.',
  },
  nosferatu: {
    id: 'nosferatu',
    titulo: 'Nosferatu',
    subtitulo: 'Senhores dos Segredos e da Escuridão',
    descricao: 'Monstros deformados que habitam os subterrâneos e dominam o comércio de informações e a vigilância invisível.',
    disciplinas: ['Animalismo', 'Ofuscação', 'Potência'],
    perdicao: 'Aparência grotesca e inumana; impossível passar por mortal sem truques sobrenaturais.',
    compulsao: 'Criptofilia: a fixação em desenterrar segredos alheios que possam servir de moeda de troca.',
  },
  ravnos: {
    id: 'ravnos',
    titulo: 'Ravnos',
    subtitulo: 'Ilusionistas e Renegados',
    descricao: 'Viajantes nômades, enganadores audaciosos que dobram a percepção dos outros com miragens hipnóticas.',
    disciplinas: ['Animalismo', 'Ofuscação', 'Presença'],
    perdicao: 'O Fogo da Perdição: se dormirem no mesmo refúgio repetidas vezes, seu sangue arde de dentro para fora.',
    compulsao: 'Tentação da Sorte: necessidade irresistível de aceitar riscos audaciosos e apostas perigosas.',
  },
  salubri: {
    id: 'salubri',
    titulo: 'Salubri',
    subtitulo: 'Curandeiros e Buscadores da Golconda',
    descricao: 'Raros Membros marcados por um terceiro olho místico, curandeiros de almas que buscam redenção e transcendência.',
    disciplinas: ['Auspícios', 'Dominação', 'Fortitude'],
    perdicao: 'O Sangue do Salubri emana um perfume irresistível que atrai a fome de outros predadores.',
    compulsao: 'Altruísmo Empático: incapacidade de ignorar o sofrimento de outros, assumindo a dor alheia.',
  },
  toreador: {
    id: 'toreador',
    titulo: 'Toreador',
    subtitulo: 'Artistas e Ditadores da Estética',
    descricao: 'Apaixonados pela beleza, arte humana e paixão carnal, regentes da vida noturna e dos salões elegantes.',
    disciplinas: ['Auspícios', 'Celeridade', 'Presença'],
    perdicao: 'Ambientes feios, rudes ou sem harmonia visual perturbam e enfraquecem seus sentidos.',
    compulsao: 'Obsessão Estética: transe absoluto diante de uma obra de arte sublime ou pessoa cativante.',
  },
  tremere: {
    id: 'tremere',
    titulo: 'Tremere',
    subtitulo: 'Feiticeiros de Sangue e Eruditos',
    descricao: 'Herméticos ambiciosos que arrancaram a imortalidade vampírica através de rituais proibidos de taumaturgia.',
    disciplinas: ['Auspícios', 'Dominação', 'Feitiçaria de Sangue'],
    perdicao: 'Seu sangue fragmentado tem imensa dificuldade em criar Laços de Sangue plenos sobre outros vampiros.',
    compulsao: 'Perfeccionismo Arcano: obsessão por controle meticuloso e rigor metodológico sobre cada detalhe.',
  },
  tzimisce: {
    id: 'tzimisce',
    titulo: 'Tzimisce',
    subtitulo: 'Dragões e Senhores Territoriais',
    descricao: 'Monarcas góticos e moldadores de carne possessivos com seu domínio, com seus servos e com a sua terra natal.',
    disciplinas: ['Animalismo', 'Dominação', 'Proteanismo'],
    perdicao: 'Precisam repousar cercados de punhados de terra ou objetos fundamentais de seu território.',
    compulsao: 'Possessão Territorial: defesa implacável e possessiva de suas propriedades, servos e território.',
  },
  ventrue: {
    id: 'ventrue',
    titulo: 'Ventrue',
    subtitulo: 'Aristocratas e Governantes da Camarilla',
    descricao: 'Líderes natos da sociedade vampírica que sustentam as tradições da Máscara com mãos de ferro e disciplina régia.',
    disciplinas: ['Dominação', 'Fortitude', 'Presença'],
    perdicao: 'Paladar restrito: só conseguem se nutrir de um tipo muito específico de sangue humano.',
    compulsao: 'Comando Régio: necessidade inabalável de dar ordens e fazer todos cumprirem sua vontade.',
  },
  caitiff: {
    id: 'caitiff',
    titulo: 'Caitiff',
    subtitulo: 'Sem Clã e Párias',
    descricao: 'Vampiros que não manifestam as marcas nem a linhagem de nenhum clã conhecido, desprezados pela aristocracia Membro.',
    disciplinas: ['Qualquer disciplina escolhida na criação'],
    perdicao: 'Não herdam a perdição de um clã, mas são vistos como escória pária e não recebem proteção política.',
    compulsao: 'Não possuem compulsão de clã própria.',
  },
  'sangue-ralo': {
    id: 'sangue-ralo',
    titulo: 'Sangue-Ralo',
    subtitulo: '14ª a 16ª Geração',
    descricao: 'Mestiços na fronteira entre a vida e a morte; quase humanos, capazes de caminhar sob o sol fraco e inventores da Alquimia.',
    disciplinas: ['Alquimia de Sangue-Ralo'],
    perdicao: 'Sangue fraco incapaz de criar Laços plenos ou sustentar disciplinas convencionais sem alquimia.',
    compulsao: 'Não possuem compulsão de clã própria.',
  },
}

export const CONSULTA_DISCIPLINAS: Record<string, ItemConsultaRegra> = {
  'alquimia-de-sangue-ralo': {
    id: 'alquimia-de-sangue-ralo',
    titulo: 'Alquimia de Sangue-Ralo',
    subtitulo: 'Disciplina Exclusiva de Sangue-Ralo',
    descricao: 'A arte clandestina de destilar sangue fraco com reagentes químicos e ingredientes urbanos para simular poderes de outras Disciplinas.',
  },
  animalismo: {
    id: 'animalismo',
    titulo: 'Animalismo',
    subtitulo: 'Disciplina Sobrenatural',
    descricao: 'Comunhão mística e comando sobre feras da natureza, além da capacidade de projetar a Besta vampírica em outros alvos.',
  },
  auspicios: {
    id: 'auspicios',
    titulo: 'Auspícios',
    subtitulo: 'Disciplina Sobrenatural',
    descricao: 'Sensibilidade sensorial aumentada ao extremo, leitura de auras emocionais, telepatia e visões premonitórias do futuro.',
  },
  celeridade: {
    id: 'celeridade',
    titulo: 'Celeridade',
    subtitulo: 'Disciplina Sobrenatural',
    descricao: 'Velocidade e reflexos sobrenaturais que permitem esquivar de disparos, correr em velocidades assombrosas e atacar num piscar de olhos.',
  },
  dominacao: {
    id: 'dominacao',
    titulo: 'Dominação',
    subtitulo: 'Disciplina Sobrenatural',
    descricao: 'Hipnose e controle mental pelo olhar, subjugando a mente de mortais e outros vampiros com ordens irrefutáveis.',
  },
  'feiticaria-de-sangue': {
    id: 'feiticaria-de-sangue',
    titulo: 'Feitiçaria de Sangue',
    subtitulo: 'Disciplina Sobrenatural',
    descricao: 'Poder arcano e rituais mágicos que usam o Sangue como combustível para manipular elementos, ferver veias e desvendar mistérios.',
  },
  fortitude: {
    id: 'fortitude',
    titulo: 'Fortitude',
    subtitulo: 'Disciplina Sobrenatural',
    descricao: 'Resistência mística à prova de balas, cortes e até às chamas e à luz solar, tornando o corpo rígido como rocha.',
  },
  oblivio: {
    id: 'oblivio',
    titulo: 'Oblívio',
    subtitulo: 'Disciplina Sobrenatural',
    descricao: 'Comunhão com o abismo das trevas e o reino dos mortos, conjurando sombras vivas ou invocando aparições do submundo.',
  },
  ofuscacao: {
    id: 'ofuscacao',
    titulo: 'Ofuscação',
    subtitulo: 'Disciplina Sobrenatural',
    descricao: 'Capacidade de desaparecer da percepção das mentes ao redor, tornando-se invisível mesmo à luz do dia ou disfarçando sua fisionomia.',
  },
  potencia: {
    id: 'potencia',
    titulo: 'Potência',
    subtitulo: 'Disciplina Sobrenatural',
    descricao: 'Força bruta devastadora e sobrenatural capaz de quebrar ossos com facilidade, derrubar paredes e arremessar veículos.',
  },
  presenca: {
    id: 'presenca',
    titulo: 'Presença',
    subtitulo: 'Disciplina Sobrenatural',
    descricao: 'Aura irresistível de fascínio, terror aterrador ou sedução hipnótica que arrebata os corações e vontades ao redor.',
  },
  proteanismo: {
    id: 'proteanismo',
    titulo: 'Proteanismo',
    subtitulo: 'Disciplina Sobrenatural',
    descricao: 'Metamorfose do próprio corpo: estender garras afiadas, fundir-se à terra para repouso, assumir a forma de lobo ou névoa densa.',
  },
}

export const CONSULTA_DOMINIO: Record<string, ItemConsultaRegra> = {
  caca: {
    id: 'caca',
    titulo: 'Caça (Chasse)',
    subtitulo: 'Domínio da Coterie',
    descricao: 'A fartura, riqueza e segurança alimentar do território da Coterie para obter sangue humano sem atrair atenção da Máscara.',
    niveis: [
      { nivel: 0, rotulo: 'Sem território seguro', descricao: 'A Coterie precisa caçar em terreno neutro ou disputado com outros predadores.' },
      { nivel: 1, rotulo: 'Quarteirão humilde', descricao: 'Uma rua ou praça modesta; caçadas fáceis para um ou dois membros da Coterie.' },
      { nivel: 2, rotulo: 'Bairro animado', descricao: 'Várias ruas movimentadas, vida noturna razoável e menor risco de incidentes.' },
      { nivel: 3, rotulo: 'Área rica e abundante', descricao: 'Grande fluxo de pessoas, boates ou hospitais; caçadas fartas e seguras.' },
      { nivel: 4, rotulo: 'Distrito privilegiado', descricao: 'Território invejado em toda a cidade, com presas abundantes e de qualidade.' },
      { nivel: 5, rotulo: 'Domínio lendário', descricao: 'O melhor território da metrópole; sangue farto, variado e de fácil acesso.' },
    ],
  },
  abrigo: {
    id: 'abrigo',
    titulo: 'Abrigo (Lien)',
    subtitulo: 'Domínio da Coterie',
    descricao: 'O quão bem a população local e os mortais do bairro estão conectados e leais à Coterie, facilitando investigações e abrigo.',
    niveis: [
      { nivel: 0, rotulo: 'Desconectados', descricao: 'Mera presença física no local sem nenhuma simpatia ou conexão com a vizinhança.' },
      { nivel: 1, rotulo: 'Reconhecidos', descricao: 'Alguns comerciantes e moradores acham os membros familiares e simpáticos.' },
      { nivel: 2, rotulo: 'Integrados', descricao: 'A comunidade acolhe e protege informalmente os membros de perguntas indesejadas.' },
      { nivel: 3, rotulo: 'Influentes', descricao: 'Líderes de bairro e autoridades locais acatam conselhos e ajudam a manter segredo.' },
      { nivel: 4, rotulo: 'Pilares locais', descricao: 'A Coterie é reverenciada ou protegida fervorosamente pelos residentes da área.' },
      { nivel: 5, rotulo: 'Senhores da vizinhança', descricao: 'A comunidade fecha os olhos e ajuda ativamente a ocultar qualquer incidente.' },
    ],
  },
  porte: {
    id: 'porte',
    titulo: 'Porte (Portillon)',
    subtitulo: 'Domínio da Coterie',
    descricao: 'As defesas físicas, místicas ou de vigilância do território contra invasores indesejados, outros Membros ou a Segunda Inquisição.',
    niveis: [
      { nivel: 0, rotulo: 'Sem defesas', descricao: 'Território aberto e acessível a qualquer intruso sem barreiras adicionais.' },
      { nivel: 1, rotulo: 'Fechaduras e trancas', descricao: 'Portões trancados, grades e cães de guarda em pontos estratégicos.' },
      { nivel: 2, rotulo: 'Circuito fechado e alarmes', descricao: 'Câmeras de vigilância, sensores de movimento e guardas particulares.' },
      { nivel: 3, rotulo: 'Fortificação urbana', descricao: 'Postos de controle, alarmes interligados e rotas de fuga preparadas.' },
      { nivel: 4, rotulo: 'Quartel blindado', descricao: 'Segurança quase impenetrável; resposta armada imediata a invasores.' },
      { nivel: 5, rotulo: 'Fortaleza inexpugnável', descricao: 'Blindagem máxima, defesas automáticas ou armadilhas letais prontas.' },
    ],
  },
}

export type TipoConsulta = 'atributo' | 'habilidade' | 'cla' | 'disciplina' | 'dominio' | 'termo'

const nomeDisciplina = (id: string) => DISCIPLINAS.find((d) => d.id === id)?.nome ?? id

const ROTULO_TIPO: Record<ItemCatalogo['tipo'], string> = {
  poder: 'Poder',
  ritual: 'Ritual',
  cerimonia: 'Cerimônia',
  formula: 'Fórmula',
  vantagem: 'Vantagem',
  defeito: 'Defeito',
  'tipo-coterie': 'Tipo de Coterie',
}

function subtitulo(item: ItemCatalogo): string {
  switch (item.tipo) {
    case 'poder':
      return `${nomeDisciplina(item.disciplina)} · Nível ${item.nivel}`
    case 'ritual':
    case 'cerimonia':
    case 'formula':
      return `${ROTULO_TIPO[item.tipo]} · Nível ${item.nivel}`
    case 'vantagem':
    case 'defeito':
      return `${ROTULO_TIPO[item.tipo]}${item.escopo === 'coterie' ? ' da Coterie' : ''} · ${item.grupo}`
    case 'tipo-coterie':
      return ROTULO_TIPO[item.tipo]
  }
}

function campos(item: ItemCatalogo): { rotulo: string; valor: string }[] {
  const lista: { rotulo: string; valor: string | undefined }[] = []
  if ('custo' in item) {
    lista.push(
      { rotulo: 'Custo', valor: item.custo },
      { rotulo: 'Parada', valor: item.parada },
      { rotulo: 'Resistência', valor: item.resistencia },
      { rotulo: 'Duração', valor: item.duracao },
    )
  }
  if (item.tipo === 'poder' && item.amalgama) {
    lista.push({ rotulo: 'Amálgama', valor: `${nomeDisciplina(item.amalgama.disciplina)} ${item.amalgama.nivel}` })
  }
  if (item.tipo === 'vantagem' || item.tipo === 'defeito') {
    lista.push({ rotulo: 'Níveis', valor: item.niveis.join(', ') })
  }
  if (item.tipo === 'tipo-coterie') {
    lista.push(
      { rotulo: 'Domínio', valor: item.dominio },
      { rotulo: 'Vantagens sugeridas', valor: item.vantagensSugeridas },
      { rotulo: 'Defeitos sugeridos', valor: item.defeitosSugeridos },
    )
  }
  lista.push(
    { rotulo: 'Pré-requisito', valor: item.preRequisito },
    {
      rotulo: 'Fonte',
      valor: `${item.fonte.livro}${item.fonte.pagina ? `, p. ${item.fonte.pagina}` : ''}${item.errata ? ' (com errata)' : ''}`,
    },
  )
  return lista.filter((c): c is { rotulo: string; valor: string } => !!c.valor)
}

/** O cartão da consulta rápida para um item do Catálogo. */
export function consultaDoCatalogo(item: ItemCatalogo): ItemConsultaRegra {
  return {
    id: item.id,
    titulo: nomeComOriginal(item),
    subtitulo: subtitulo(item),
    descricao: item.descricao,
    campos: campos(item),
  }
}

export function buscarConsultaRegra(tipo: TipoConsulta | 'catalogo', id: string): ItemConsultaRegra | null {
  switch (tipo) {
    case 'catalogo': {
      const item = itemCatalogo(id)
      return item ? consultaDoCatalogo(item) : null
    }
    case 'atributo':
      return CONSULTA_ATRIBUTOS[id] ?? null
    case 'habilidade':
      return CONSULTA_HABILIDADES[id] ?? null
    case 'cla':
      return CONSULTA_CLAS[id] ?? null
    case 'disciplina':
      return CONSULTA_DISCIPLINAS[id] ?? null
    case 'dominio':
      return CONSULTA_DOMINIO[id] ?? null
    case 'termo':
      return CONSULTA_TERMOS[id] ?? null
  }
}
