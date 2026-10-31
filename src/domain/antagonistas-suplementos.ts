import type { ModeloAntagonista } from './bestiario'
import type { FonteModeloBestiario } from './bestiario-fontes'

export const MODELOS_SUPLEMENTARES_ANTAGONISTAS = [
  {
    "id": "7d29db87-b745-52f1-8ef0-53e52718f6e8",
    "nome": "Lobisomem",
    "categoria": "Lobisomem",
    "paradaFisico": null,
    "paradaSocial": null,
    "paradaMental": null,
    "vitalidade": 7,
    "vontade": 6,
    "paradasExcepcionais": [],
    "especiais": [
      {
        "nome": "Resistência lupina",
        "descricao": "Sofre dano agravado apenas de armas de prata e fogo."
      },
      {
        "nome": "Regeneração",
        "descricao": "Recupera 1 ponto de dano superficial de Vitalidade por turno."
      },
      {
        "nome": "Forma de guerra",
        "descricao": "Ao assumir a forma de guerra, soma +3 a Força, Destreza e Vigor. O bônus não está aplicado aos valores desta ficha."
      },
      {
        "nome": "Garras e presas",
        "descricao": "Na forma de guerra, causam dano superficial +3 que vampiros não reduzem à metade."
      }
    ],
    "notas": "Valores básicos, antes da forma de guerra. As Disciplinas representam efeitos sobrenaturais equivalentes, com poderes à escolha do Narrador.",
    "fichaCompleta": {
      "atributos": {
        "forca": 3,
        "destreza": 3,
        "vigor": 4,
        "carisma": 3,
        "manipulacao": 3,
        "autocontrole": 2,
        "inteligencia": 3,
        "raciocinio": 4,
        "determinacao": 4
      },
      "habilidades": {
        "Erudição": 2,
        "Percepção": 4,
        "Investigação": 1,
        "Medicina": 1,
        "Política": 1,
        "Ocultismo": 3,
        "Ciência": 2,
        "Atletismo": 4,
        "Briga": 5,
        "Condução": 1,
        "Armas de Fogo": 1,
        "Armas Brancas": 4,
        "Ladroagem": 2,
        "Furtividade": 4,
        "Sobrevivência": 5,
        "Empatia com Animais": 5,
        "Etiqueta": 1,
        "Sagacidade": 2,
        "Intimidação": 5,
        "Liderança": 1,
        "Manha": 3
      },
      "disciplinas": {
        "Animalismo": 5,
        "Auspícios": 2,
        "Celeridade": 4,
        "Fortitude": 5,
        "Ofuscação": 1,
        "Potência": 5
      },
      "humanidade": null,
      "potenciaSangue": null,
      "fome": null
    }
  },
  {
    "id": "9fa821e0-c10d-56b7-84b3-639cae4afa57",
    "nome": "Batedor da Trilha de Caim",
    "categoria": "Vampiro",
    "etiquetas": ["Sabá"],
    "paradaFisico": 6,
    "paradaSocial": 2,
    "paradaMental": 4,
    "vitalidade": 7,
    "vontade": 6,
    "paradasExcepcionais": [
      {
        "nome": "Armas Brancas (Kukri)",
        "valor": 8
      },
      {
        "nome": "Percepção",
        "valor": 6
      },
      {
        "nome": "Disciplinas",
        "valor": 6
      }
    ],
    "especiais": [
      {
        "nome": "Animalismo 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Ofuscação 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Potência 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Kukri",
        "descricao": "Ataques com a kukri causam +3 de dano."
      },
      {
        "nome": "Frenesi",
        "descricao": "Quando arrisca ser derrotado, entra em frenesi e luta até a Morte Final."
      }
    ],
    "notas": "Trilha de Caim. Dificuldade geral: 4/3."
  },
  {
    "id": "9c2596f1-4a42-508d-920e-41bed06b79e1",
    "nome": "Assassino da Trilha de Caim",
    "categoria": "Vampiro",
    "etiquetas": ["Sabá"],
    "paradaFisico": 8,
    "paradaSocial": 3,
    "paradaMental": 5,
    "vitalidade": 8,
    "vontade": 6,
    "paradasExcepcionais": [
      {
        "nome": "Briga (Agarrar)",
        "valor": 10
      },
      {
        "nome": "Armas Brancas (Cimitarra)",
        "valor": 10
      },
      {
        "nome": "Furtividade",
        "valor": 10
      },
      {
        "nome": "Disciplinas",
        "valor": 8
      }
    ],
    "especiais": [
      {
        "nome": "Celeridade 4",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Potência 3",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Feitiçaria de Sangue 3",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Ofuscação 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Cimitarra reforçada",
        "descricao": "Ataques com a cimitarra causam +4 de dano."
      }
    ],
    "notas": "Trilha de Caim. Dificuldade geral: 6/4."
  },
  {
    "id": "f4a3755b-d112-5f7b-a29c-20526d5b1c7c",
    "nome": "Isca Irresistível",
    "categoria": "Carniçal",
    "etiquetas": ["Sabá"],
    "paradaFisico": 3,
    "paradaSocial": 5,
    "paradaMental": 2,
    "vitalidade": 5,
    "vontade": 4,
    "paradasExcepcionais": [
      {
        "nome": "Subterfúgio (Armadilha)",
        "valor": 6
      },
      {
        "nome": "Ladroagem (Bater Carteira)",
        "valor": 5
      }
    ],
    "especiais": [
      {
        "nome": "Presença 1",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Sangue intoxicante",
        "descricao": "Saciar ao menos 1 de Fome causa os efeitos de metanfetaminas e alucinógenos e uma Compulsão até o fim da cena. Consulte o livro básico, p. 310."
      }
    ],
    "notas": "Trilha dos Cátaros. Dificuldade geral: 3/2."
  },
  {
    "id": "316b14a6-4c8a-5681-bbef-325350cfffa4",
    "nome": "Radicalizador da Trilha dos Cátaros",
    "categoria": "Vampiro",
    "etiquetas": ["Sabá"],
    "paradaFisico": 3,
    "paradaSocial": 5,
    "paradaMental": 4,
    "vitalidade": 6,
    "vontade": 7,
    "paradasExcepcionais": [
      {
        "nome": "Persuasão",
        "valor": 8
      },
      {
        "nome": "Sagacidade (Ponto Fraco)",
        "valor": 8
      },
      {
        "nome": "Subterfúgio (Humanidade Fingida)",
        "valor": 8
      },
      {
        "nome": "Disciplinas",
        "valor": 6
      }
    ],
    "especiais": [
      {
        "nome": "Auspícios 3",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Presença 4",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Proteanismo 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      }
    ],
    "notas": "Trilha dos Cátaros. Dificuldade geral: 4/3."
  },
  {
    "id": "3efd81f5-eb49-57a9-95c9-9ca33e68a0f0",
    "nome": "O Vampiro da Trilha dos Cátaros",
    "categoria": "Vampiro",
    "etiquetas": ["Sabá"],
    "paradaFisico": 4,
    "paradaSocial": 7,
    "paradaMental": 5,
    "vitalidade": 6,
    "vontade": 8,
    "paradasExcepcionais": [
      {
        "nome": "Performance (Representar um Vampiro)",
        "valor": 8
      },
      {
        "nome": "Ocultismo",
        "valor": 8
      },
      {
        "nome": "Disciplinas",
        "valor": 7
      }
    ],
    "especiais": [
      {
        "nome": "Dominação 4",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Proteanismo 4",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Animalismo 3",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      }
    ],
    "notas": "Trilha dos Cátaros. Dificuldade geral: 5/3."
  },
  {
    "id": "0b004db7-5319-5ce6-9727-f8890911ce94",
    "nome": "Adormecido da Trilha da Morte e da Alma",
    "categoria": "Carniçal",
    "etiquetas": ["Sabá"],
    "paradaFisico": 2,
    "paradaSocial": 3,
    "paradaMental": 5,
    "vitalidade": 5,
    "vontade": 6,
    "paradasExcepcionais": [
      {
        "nome": "Subterfúgio (Devoção pelo Laço)",
        "valor": 6
      },
      {
        "nome": "Etiqueta",
        "valor": 6
      }
    ],
    "especiais": [
      {
        "nome": "Ofuscação 1",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Identidade condicionada",
        "descricao": "Acredita na identidade de cobertura até receber o gatilho pós-hipnótico."
      }
    ],
    "notas": "Trilha da Morte e da Alma. Dificuldade geral: 3/2."
  },
  {
    "id": "9cc54ee3-2c3a-5853-ad63-19ef1d83faea",
    "nome": "Flautista da Trilha da Morte e da Alma",
    "categoria": "Vampiro",
    "etiquetas": ["Sabá"],
    "paradaFisico": 3,
    "paradaSocial": 3,
    "paradaMental": 6,
    "vitalidade": 6,
    "vontade": 7,
    "paradasExcepcionais": [
      {
        "nome": "Persuasão (Incitar)",
        "valor": 7
      },
      {
        "nome": "Percepção (Fenômenos Fantasmagóricos)",
        "valor": 8
      },
      {
        "nome": "Ocultismo",
        "valor": 8
      },
      {
        "nome": "Disciplinas",
        "valor": 6
      }
    ],
    "especiais": [
      {
        "nome": "Auspícios 3",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Fortitude 1",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Oblívio 4",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Cerimônias de Oblívio",
        "descricao": "Conhece ao menos quatro Cerimônias, à escolha do Narrador."
      },
      {
        "nome": "Espectros devedores",
        "descricao": "Três Espectros lhe devem um serviço cada. Use a ficha de Espectro do livro básico, p. 377."
      }
    ],
    "notas": "Trilha da Morte e da Alma. Dificuldade geral: 4/3."
  },
  {
    "id": "08344c7a-16ca-5b55-bf3e-bd2c837983f2",
    "nome": "Molda-Vida da Trilha da Morte e da Alma",
    "categoria": "Vampiro",
    "etiquetas": ["Sabá"],
    "paradaFisico": 3,
    "paradaSocial": 5,
    "paradaMental": 8,
    "vitalidade": 6,
    "vontade": 8,
    "paradasExcepcionais": [
      {
        "nome": "Ofícios (Carne Viva)",
        "valor": 9
      },
      {
        "nome": "Ciência (Microbiologia)",
        "valor": 9
      },
      {
        "nome": "Medicina",
        "valor": 9
      },
      {
        "nome": "Disciplinas",
        "valor": 8
      }
    ],
    "especiais": [
      {
        "nome": "Dominação 4",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Proteanismo 4",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Animalismo 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Auspícios 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Criações",
        "descricao": "As criações carniçais usam a ficha de Szlachta. O Narrador define os efeitos dos microrganismos modificados."
      }
    ],
    "notas": "Trilha da Morte e da Alma. Dificuldade geral: 5/3."
  },
  {
    "id": "117056be-99c6-5b96-933f-0644a7d2e68e",
    "nome": "Servo Arruinado da Trilha do Poder e da Voz Interior",
    "categoria": "Carniçal",
    "etiquetas": ["Sabá"],
    "paradaFisico": 3,
    "paradaSocial": 4,
    "paradaMental": 3,
    "vitalidade": 5,
    "vontade": 5,
    "paradasExcepcionais": [
      {
        "nome": "Etiqueta (Elísio)",
        "valor": 6
      },
      {
        "nome": "Subterfúgio (Está Tudo Bem)",
        "valor": 6
      }
    ],
    "especiais": [
      {
        "nome": "Fortitude 1",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Granada",
        "descricao": "Fragmentação M67: dano básico 12, menos 1 por metro; agravado em mortais. A alternativa incendiária causa dano básico 8 por fogo."
      }
    ],
    "notas": "Trilha do Poder e da Voz Interior. Dificuldade geral: 2."
  },
  {
    "id": "ab094860-c283-509d-b57d-57da3fe7c515",
    "nome": "Cavaleiro da Trilha do Poder e da Voz Interior",
    "categoria": "Vampiro",
    "etiquetas": ["Sabá"],
    "paradaFisico": 5,
    "paradaSocial": 4,
    "paradaMental": 3,
    "vitalidade": 7,
    "vontade": 7,
    "paradasExcepcionais": [
      {
        "nome": "Armas de Fogo (Submetralhadora)",
        "valor": 6
      },
      {
        "nome": "Intimidação",
        "valor": 8
      },
      {
        "nome": "Investigação (Bandos do Sabá)",
        "valor": 6
      },
      {
        "nome": "Disciplinas",
        "valor": 6
      }
    ],
    "especiais": [
      {
        "nome": "Dominação 3",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Fortitude 3",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Auspícios 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Submetralhadora",
        "descricao": "Ataques com a submetralhadora causam +3 de dano."
      }
    ],
    "notas": "Trilha do Poder e da Voz Interior. Dificuldade geral: 4/3."
  },
  {
    "id": "0f9386f1-2ccd-5ded-b9e6-be841715c53d",
    "nome": "Bispo da Trilha do Poder e da Voz Interior",
    "categoria": "Vampiro",
    "etiquetas": ["Sabá"],
    "paradaFisico": 6,
    "paradaSocial": 6,
    "paradaMental": 6,
    "vitalidade": 8,
    "vontade": 9,
    "paradasExcepcionais": [
      {
        "nome": "Armas Brancas (Sabre de Cavalaria)",
        "valor": 9
      },
      {
        "nome": "Intimidação",
        "valor": 9
      },
      {
        "nome": "Política (Implacável)",
        "valor": 8
      },
      {
        "nome": "Disciplinas",
        "valor": 8
      }
    ],
    "especiais": [
      {
        "nome": "Dominação 5",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Potência 5",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Presença 3",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Sabre de cavalaria",
        "descricao": "Ataques com o sabre causam +3 de dano."
      },
      {
        "nome": "Bando",
        "descricao": "Seu bando fica por perto; use o Cavaleiro da mesma Trilha para os integrantes."
      }
    ],
    "notas": "Trilha do Poder e da Voz Interior. Dificuldade geral: 5/4."
  },
  {
    "id": "6168f48a-9619-59bc-89c9-9030984196cf",
    "nome": "Heliófilo da Trilha do Sol",
    "categoria": "Vampiro",
    "etiquetas": ["Sabá"],
    "paradaFisico": 4,
    "paradaSocial": 4,
    "paradaMental": 3,
    "vitalidade": 5,
    "vontade": 5,
    "paradasExcepcionais": [
      {
        "nome": "Armas de Fogo",
        "valor": 5
      },
      {
        "nome": "Furtividade",
        "valor": 5
      },
      {
        "nome": "Disciplinas",
        "valor": 4
      }
    ],
    "especiais": [
      {
        "nome": "Fortitude 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Alquimia de Sangue-Ralo 3",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      }
    ],
    "notas": "Trilha do Sol. Dificuldade geral: 3/2."
  },
  {
    "id": "549728ee-9cd2-5535-89ae-75748d9273ec",
    "nome": "Pretendente do Sabá",
    "categoria": "Vampiro",
    "etiquetas": ["Sabá"],
    "paradaFisico": 4,
    "paradaSocial": 4,
    "paradaMental": 2,
    "vitalidade": 6,
    "vontade": 4,
    "paradasExcepcionais": [
      {
        "nome": "Briga",
        "valor": 6
      },
      {
        "nome": "Manha",
        "valor": 6
      },
      {
        "nome": "Disciplinas",
        "valor": 5
      }
    ],
    "especiais": [
      {
        "nome": "Celeridade 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Potência 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Presença 1",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      }
    ],
    "notas": "Seguidor marginal do Sabá. Dificuldade geral: 3."
  },
  {
    "id": "baa9fa54-6bbc-5099-aa81-9769e2be9cd7",
    "nome": "Não Nascido",
    "categoria": "Vampiro",
    "etiquetas": ["Sabá"],
    "paradaFisico": 5,
    "paradaSocial": 1,
    "paradaMental": 2,
    "vitalidade": 7,
    "vontade": 3,
    "paradasExcepcionais": [
      {
        "nome": "Briga",
        "valor": 6
      }
    ],
    "especiais": [
      {
        "nome": "Potência 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Despertar",
        "descricao": "Pode permanecer dormente por meses ou anos, até as circunstâncias do ritual provocarem o despertar."
      }
    ],
    "notas": "Criatura do Sabá. Dificuldade geral: 3."
  },
  {
    "id": "f1576dde-bf90-5d30-a723-f963807efaa9",
    "nome": "Acorrentado",
    "categoria": "Carniçal",
    "etiquetas": ["Sabá"],
    "paradaFisico": 2,
    "paradaSocial": 3,
    "paradaMental": 4,
    "vitalidade": 6,
    "vontade": 8,
    "paradasExcepcionais": [
      {
        "nome": "Briga (Golpe Espectral; após liberação)",
        "valor": 8
      },
      {
        "nome": "Atletismo (Arremesso Espectral; após liberação)",
        "valor": 8
      },
      {
        "nome": "Intimidação (Manifestação Espectral; após liberação)",
        "valor": 8
      }
    ],
    "especiais": [
      {
        "nome": "Liberação dos Espectros",
        "descricao": "Após liberar os Espectros, use Físico 6, Social 1 e Mental 2. As Paradas Excepcionais passam a valer e surgem efeitos equivalentes a Potência 3 e Fortitude 3."
      },
      {
        "nome": "Âncora espectral",
        "descricao": "Os Espectros protegem sua âncora. Após a liberação, o carniçal envelhece rapidamente e morre em cerca de uma hora."
      }
    ],
    "notas": "Servo espectral do Sabá. Dificuldade geral: 4/2."
  },
  {
    "id": "326f3ffb-399e-5ea4-a8c1-1ad32cdd4132",
    "nome": "Carniçal da Ninhada",
    "categoria": "Carniçal",
    "etiquetas": ["Sabá"],
    "paradaFisico": 5,
    "paradaSocial": 3,
    "paradaMental": 4,
    "vitalidade": 6,
    "vontade": 5,
    "paradasExcepcionais": [
      {
        "nome": "Briga",
        "valor": 6
      },
      {
        "nome": "Furtividade (Ocultar-se à Vista)",
        "valor": 7
      },
      {
        "nome": "Subterfúgio",
        "valor": 5
      }
    ],
    "especiais": [
      {
        "nome": "Proteanismo 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Fusão",
        "descricao": "A fusão leva três turnos, é irreversível e impede esquivar ou resistir a ataques físicos enquanto ocorre. O dano sofrido passa para a forma fundida."
      },
      {
        "nome": "Armas Ferais",
        "descricao": "Pode manifestar partes da forma fundida como Armas Ferais, pagando o custo com dano agravado, conforme o livro básico, p. 234."
      }
    ],
    "notas": "Carniçal de carne fundida do Sabá. Dificuldade geral: 3/2."
  },
  {
    "id": "8950ce37-08b5-51f4-bce2-675a9f481479",
    "nome": "Forma de Carne Fundida",
    "categoria": "Carniçal",
    "etiquetas": ["Sabá"],
    "paradaFisico": 9,
    "paradaSocial": 0,
    "paradaMental": 4,
    "vitalidade": 12,
    "vontade": 5,
    "paradasExcepcionais": [
      {
        "nome": "Briga",
        "valor": 12
      },
      {
        "nome": "Intimidação",
        "valor": 10
      }
    ],
    "especiais": [
      {
        "nome": "Potência 3",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Fortitude 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Proteanismo 2",
        "descricao": "Poderes à escolha do Narrador, respeitando o nível indicado."
      },
      {
        "nome": "Metabolismo",
        "descricao": "Usa os poderes sem custo em dano agravado, mas sofre 1 de dano agravado por turno. Consumir uma vítima de tamanho humano ou 5 níveis de Fome em vitae suspende essa perda por cinco turnos."
      },
      {
        "nome": "Mente coletiva",
        "descricao": "Disciplinas mentais não alteram seu comportamento nem controlam suas ações."
      },
      {
        "nome": "Ninhada incompleta",
        "descricao": "Para cada integrante ausente antes da fusão, reduza a Vitalidade em 3 e as paradas em 1 a 3, conforme o tamanho da ninhada."
      }
    ],
    "notas": "Carniçal de carne fundida do Sabá. Dificuldade geral: 5/3. Valores para a fusão de quatro a seis integrantes."
  }
] satisfies ModeloAntagonista[]

export const FONTES_SUPLEMENTARES_ANTAGONISTAS: Record<string, FonteModeloBestiario> = {
  "9fa821e0-c10d-56b7-84b3-639cae4afa57": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 35 (edição inglesa)."
  },
  "9c2596f1-4a42-508d-920e-41bed06b79e1": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 35 (edição inglesa)."
  },
  "f4a3755b-d112-5f7b-a29c-20526d5b1c7c": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 36 (edição inglesa)."
  },
  "316b14a6-4c8a-5681-bbef-325350cfffa4": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 37 (edição inglesa)."
  },
  "3efd81f5-eb49-57a9-95c9-9ca33e68a0f0": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 37 (edição inglesa)."
  },
  "0b004db7-5319-5ce6-9727-f8890911ce94": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 38 (edição inglesa)."
  },
  "9cc54ee3-2c3a-5853-ad63-19ef1d83faea": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, pp. 38–40 (edição inglesa)."
  },
  "08344c7a-16ca-5b55-bf3e-bd2c837983f2": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 40 (edição inglesa)."
  },
  "117056be-99c6-5b96-933f-0644a7d2e68e": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 41 (edição inglesa)."
  },
  "ab094860-c283-509d-b57d-57da3fe7c515": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, pp. 41–42 (edição inglesa)."
  },
  "0f9386f1-2ccd-5ded-b9e6-be841715c53d": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 42 (edição inglesa)."
  },
  "6168f48a-9619-59bc-89c9-9030984196cf": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, pp. 42–43 (edição inglesa)."
  },
  "549728ee-9cd2-5535-89ae-75748d9273ec": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 42 (edição inglesa)."
  },
  "baa9fa54-6bbc-5099-aa81-9769e2be9cd7": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 43 (edição inglesa)."
  },
  "f1576dde-bf90-5d30-a723-f963807efaa9": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, pp. 43–44 (edição inglesa)."
  },
  "326f3ffb-399e-5ea4-a8c1-1ad32cdd4132": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 45 (edição inglesa)."
  },
  "8950ce37-08b5-51f4-bce2-675a9f481479": {
    "titulo": "Sabá: A Mão Negra",
    "url": "https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/",
    "referencia": "Sabbat: The Black Hand, p. 45 (edição inglesa)."
  },
  "7d29db87-b745-52f1-8ef0-53e52718f6e8": {
    "titulo": "Livro básico V5 — Lobisomem",
    "url": "https://www.reddit.com/r/vtm/comments/1km2kwr/",
    "referencia": "Vampire: The Masquerade V5 Corebook, pp. 376–377 (inglês). Transcrição da ficha consultada em referência comunitária."
  }
}
