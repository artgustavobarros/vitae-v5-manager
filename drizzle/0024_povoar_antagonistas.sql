INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '9056dd55-0184-5e96-ac6b-ceda58f9ff7d',
  'Morcego grande',
  'Animal',
  '[]'::jsonb,
  3,
  1,
  1,
  2,
  1,
  '[{"nome":"Furtividade","valor":5},{"nome":"Percepção","valor":7}]'::jsonb,
  '[]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '8a873356-63e5-5f5a-8d8c-ce4d9d49a2f7',
  'Urso',
  'Animal',
  '[]'::jsonb,
  7,
  1,
  1,
  8,
  3,
  '[{"nome":"Percepção","valor":3},{"nome":"Intimidação","valor":6}]'::jsonb,
  '[{"nome":"Garras e mordida","descricao":"Os ataques causam +2 de dano."}]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  'd799f5be-181b-5dc6-aea5-01f14d951283',
  'Ave de rapina',
  'Animal',
  '[]'::jsonb,
  4,
  1,
  1,
  3,
  2,
  '[{"nome":"Briga","valor":5},{"nome":"Furtividade","valor":6},{"nome":"Percepção","valor":6}]'::jsonb,
  '[]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  'd0518c29-fd26-541f-a7ff-ee2d85c51b96',
  'Clérigo',
  'Mortal',
  '[]'::jsonb,
  3,
  5,
  4,
  5,
  7,
  '[{"nome":"Ocultismo","valor":5},{"nome":"Sagacidade","valor":7},{"nome":"Erudição","valor":6},{"nome":"Liderança","valor":6}]'::jsonb,
  '[{"nome":"Fé Verdadeira","descricao":"Alguns membros do clero possuem Fé Verdadeira; confirme com o Narrador se este indivíduo a possui."}]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  'd5779ee5-bf5c-5239-9fee-429deabfb086',
  'Caçador da fé',
  'Mortal',
  '[]'::jsonb,
  4,
  4,
  5,
  6,
  8,
  '[{"nome":"Armas Brancas","valor":6},{"nome":"Ocultismo","valor":8},{"nome":"Erudição","valor":7},{"nome":"Percepção","valor":7},{"nome":"Investigação","valor":7}]'::jsonb,
  '[{"nome":"Resistência a Disciplinas","descricao":"A variante com sangue alterado soma 4 dados às paradas para resistir ou se opor a uma Disciplina vampírica."},{"nome":"Sangue perigoso","descricao":"Beber o sangue da variante alterada causa 4 pontos de dano agravado, salvo sucesso em Vigor + Determinação com Dificuldade 5. O Narrador decide se o indivíduo possui essa alteração."}]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '4e35a8fa-4a0d-501c-9a77-28c771526eb0',
  'Criminoso',
  'Mortal',
  '[]'::jsonb,
  4,
  3,
  3,
  6,
  4,
  '[{"nome":"Briga","valor":5},{"nome":"Ladroagem","valor":5},{"nome":"Armas de Fogo","valor":5},{"nome":"Manha","valor":7},{"nome":"Intimidação","valor":5}]'::jsonb,
  '[]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '171ca44d-3cc4-57c0-ad97-a2a07320852c',
  'Carniçal',
  'Carniçal',
  '[]'::jsonb,
  4,
  4,
  4,
  6,
  5,
  '[{"nome":"Ocultismo","valor":6},{"nome":"Furtividade","valor":5},{"nome":"Percepção","valor":6},{"nome":"Intimidação","valor":5}]'::jsonb,
  '[{"nome":"Poder de Disciplina à escolha","descricao":"Um poder de nível 1 de qualquer Disciplina, à escolha do Narrador.","regra":"poder-livre-nivel-1"}]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  'beeb5357-6b68-57c2-a43d-3582ac4f166e',
  'Cão de guarda',
  'Animal',
  '[]'::jsonb,
  5,
  1,
  1,
  5,
  2,
  '[{"nome":"Briga","valor":6},{"nome":"Furtividade","valor":4},{"nome":"Percepção","valor":4},{"nome":"Intimidação","valor":4}]'::jsonb,
  '[{"nome":"Mordida","descricao":"A mordida causa +1 de dano."}]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  'e88d2106-af98-593e-9f91-fd5292706da8',
  'Cavalo',
  'Animal',
  '[]'::jsonb,
  6,
  1,
  1,
  7,
  2,
  '[{"nome":"Percepção","valor":4}]'::jsonb,
  '[{"nome":"Atropelar","descricao":"Causa +2 de dano ao pisotear um oponente caído."}]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '68c8a139-9b0b-5ace-8d8d-0fe07173e6f3',
  'Inquisidor Delta',
  'Mortal',
  '[]'::jsonb,
  6,
  4,
  4,
  8,
  7,
  '[{"nome":"Briga","valor":8},{"nome":"Armas Brancas","valor":8},{"nome":"Armas de Fogo","valor":9},{"nome":"Atletismo","valor":8},{"nome":"Percepção","valor":7},{"nome":"Habilidade especializada à escolha","valor":9}]'::jsonb,
  '[{"nome":"Equipamento de missão","descricao":"Pode portar armadura, munição especializada e ferramentas de arrombamento. O Narrador define o equipamento e seus efeitos para a missão."}]'::jsonb,
  'Escolha qual Habilidade usa a Parada Excepcional especializada antes do Combate.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  'bb50b2c8-add5-57ee-90b3-1e49ce18fad2',
  'Investigador da Inquisição',
  'Mortal',
  '[]'::jsonb,
  5,
  4,
  5,
  7,
  7,
  '[{"nome":"Armas de Fogo","valor":6},{"nome":"Erudição","valor":6},{"nome":"Percepção","valor":7},{"nome":"Investigação","valor":7}]'::jsonb,
  '[]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  'fdee44d0-bbb4-5743-b3b6-c3d99b49b4bb',
  'Detetive de polícia',
  'Mortal',
  '[]'::jsonb,
  4,
  3,
  4,
  6,
  5,
  '[{"nome":"Armas de Fogo","valor":5},{"nome":"Atletismo","valor":5},{"nome":"Manha","valor":5},{"nome":"Investigação","valor":6}]'::jsonb,
  '[]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '68f85089-45eb-5ea9-8dac-7c087380c834',
  'Rato',
  'Animal',
  '[]'::jsonb,
  3,
  1,
  1,
  1,
  1,
  '[{"nome":"Briga","valor":4},{"nome":"Furtividade","valor":7},{"nome":"Percepção","valor":5}]'::jsonb,
  '[{"nome":"Enxame","descricao":"Ao representar um enxame, some 3 à Vitalidade e a todas as paradas físicas, incluindo as Paradas Excepcionais físicas."}]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '9c84c1e4-293e-5866-b552-961c809605e1',
  'Lobo',
  'Animal',
  '[]'::jsonb,
  6,
  1,
  1,
  6,
  3,
  '[{"nome":"Furtividade","valor":5},{"nome":"Percepção","valor":3},{"nome":"Intimidação","valor":5}]'::jsonb,
  '[{"nome":"Mordida","descricao":"Os ataques causam +1 de dano."}]'::jsonb,
  '',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '19e21a6a-0f97-5b30-ba54-6f48aed6f8b5',
  'Sabujo de Sangue',
  'Carniçal',
  '["Sabá"]'::jsonb,
  5,
  1,
  2,
  6,
  3,
  '[{"nome":"Percepção (Localizar Membros)","valor":6},{"nome":"Sobrevivência (Rastrear Membros)","valor":6},{"nome":"Furtividade","valor":6}]'::jsonb,
  '[{"nome":"Potência 1","descricao":"Um poder de nível 1 de Potência, à escolha do Narrador."},{"nome":"Mordida","descricao":"A mordida causa +2 de dano."}]'::jsonb,
  'Dificuldade geral: 3/2. Cão carniçal que rastreia Membros e protege seu mestre durante o dia.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  'd1d687b5-a40a-5c39-b519-8ce04805786f',
  'Revolucionário Anarquista',
  'Vampiro',
  '[]'::jsonb,
  1,
  1,
  1,
  6,
  6,
  '[]'::jsonb,
  '[]'::jsonb,
  '',
  '{"atributos":{"forca":4,"destreza":3,"vigor":3,"carisma":3,"manipulacao":3,"autocontrole":2,"inteligencia":2,"raciocinio":4,"determinacao":4},"habilidades":{"Briga":4,"Condução":3,"Armas Brancas":3,"Ocultismo":1,"Sagacidade":2,"Ladroagem":4,"Ciência":2,"Furtividade":2,"Armas de Fogo":3,"Política":3,"Sobrevivência":3,"Erudição":1,"Etiqueta com Animais":2,"Atletismo":4,"Percepção":3,"Etiqueta":1,"Liderança":3,"Persuasão":1,"Manha":4,"Subterfúgio":1,"Tecnologia":3,"Intimidação":2,"Investigação":1},"disciplinas":{"Potência":2,"Proteanismo":1,"Celeridade":2,"Animalismo":2,"Fortitude":3},"humanidade":7,"potenciaSangue":2,"fome":null}'::jsonb,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '054026c8-251b-5a3a-9963-145beb612214',
  'Xerife sanguinário',
  'Vampiro',
  '[]'::jsonb,
  1,
  1,
  1,
  7,
  7,
  '[]'::jsonb,
  '[]'::jsonb,
  '',
  '{"atributos":{"forca":4,"destreza":5,"vigor":4,"carisma":2,"manipulacao":1,"autocontrole":3,"inteligencia":3,"raciocinio":4,"determinacao":4},"habilidades":{"Briga":3,"Condução":2,"Armas Brancas":3,"Finanças":1,"Sagacidade":1,"Ladroagem":3,"Furtividade":4,"Armas de Fogo":4,"Política":2,"Sobrevivência":3,"Erudição":1,"Etiqueta com Animais":2,"Atletismo":4,"Percepção":3,"Etiqueta":1,"Liderança":1,"Persuasão":1,"Manha":3,"Tecnologia":2,"Intimidação":5,"Investigação":4},"disciplinas":{"Potência":4,"Celeridade":3,"Animalismo":2,"Ofuscação":3},"humanidade":5,"potenciaSangue":4,"fome":null}'::jsonb,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '5711f271-5658-54bf-8d4f-b5561fe1e5b8',
  'Harpia do Elísio',
  'Vampiro',
  '[]'::jsonb,
  1,
  1,
  1,
  5,
  6,
  '[]'::jsonb,
  '[]'::jsonb,
  '',
  '{"atributos":{"forca":2,"destreza":3,"vigor":2,"carisma":3,"manipulacao":4,"autocontrole":3,"inteligencia":2,"raciocinio":3,"determinacao":3},"habilidades":{"Briga":1,"Ofícios":1,"Condução":2,"Ocultismo":1,"Finanças":2,"Sagacidade":4,"Política":4,"Erudição":2,"Atletismo":1,"Percepção":4,"Etiqueta":5,"Liderança":1,"Persuasão":4,"Manha":3,"Subterfúgio":4,"Performance":3,"Intimidação":3,"Investigação":3},"disciplinas":{"Auspícios":3,"Celeridade":2,"Presença":3,"Fortitude":1},"humanidade":6,"potenciaSangue":3,"fome":null}'::jsonb,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '5897aa61-9526-5b5d-ad4e-83a260d0e006',
  'Fada',
  'Outras criaturas',
  '["Fada"]'::jsonb,
  1,
  1,
  1,
  6,
  7,
  '[]'::jsonb,
  '[{"nome":"Resistência sobrenatural","descricao":"Sofre dano agravado apenas de fogo e ferro frio."},{"nome":"Ilusões","descricao":"Para perceber as ilusões, dispute Raciocínio ou Determinação + Auspícios contra Manipulação + Raciocínio da criatura."}]'::jsonb,
  'A fonte usa Empatia como Habilidade; confira essa nomenclatura na revisão.',
  '{"atributos":{"forca":2,"destreza":4,"vigor":3,"carisma":7,"manipulacao":5,"autocontrole":3,"inteligencia":3,"raciocinio":4,"determinacao":4},"habilidades":{"Armas Brancas":4,"Ocultismo":4,"Empatia":3,"Atletismo":2,"Percepção":2,"Etiqueta":4,"Liderança":4,"Subterfúgio":2,"Performance":4,"Intimidação":3},"disciplinas":{"Celeridade":1,"Dominação":4,"Presença":5,"Ofuscação":4},"humanidade":null,"potenciaSangue":null,"fome":null}'::jsonb,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '54bc13f5-774f-5a0d-a7c9-16af92bdedc3',
  'Mago',
  'Outras criaturas',
  '["Mago"]'::jsonb,
  1,
  1,
  1,
  5,
  10,
  '[]'::jsonb,
  '[{"nome":"Defesas mágicas","descricao":"Pode criar defesas improvisadas gastando 1 ponto de Força de Vontade por encantamento."}]'::jsonb,
  '',
  '{"atributos":{"forca":2,"destreza":3,"vigor":2,"carisma":3,"manipulacao":4,"autocontrole":5,"inteligencia":5,"raciocinio":4,"determinacao":5},"habilidades":{"Ofícios":3,"Condução":1,"Armas Brancas":1,"Ocultismo":5,"Finanças":1,"Sagacidade":4,"Ciência":2,"Armas de Fogo":1,"Medicina":2,"Política":1,"Erudição":5,"Atletismo":1,"Percepção":3,"Etiqueta":3,"Liderança":4,"Persuasão":4,"Manha":1,"Subterfúgio":3,"Tecnologia":1,"Performance":3,"Intimidação":4,"Investigação":2},"disciplinas":{"Auspícios":4,"Dominação":4,"Presença":2,"Ofuscação":3,"Feitiçaria de Sangue":5},"humanidade":null,"potenciaSangue":null,"fome":null}'::jsonb,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '23f6b2b3-20d8-5c1b-b92f-53e046607abe',
  'Bispo nodista',
  'Vampiro',
  '[]'::jsonb,
  1,
  1,
  1,
  8,
  9,
  '[]'::jsonb,
  '[]'::jsonb,
  '',
  '{"atributos":{"forca":2,"destreza":2,"vigor":5,"carisma":5,"manipulacao":3,"autocontrole":4,"inteligencia":5,"raciocinio":3,"determinacao":5},"habilidades":{"Armas Brancas":2,"Ocultismo":5,"Finanças":1,"Sagacidade":3,"Ladroagem":1,"Ciência":1,"Furtividade":2,"Medicina":2,"Política":4,"Erudição":4,"Etiqueta com Animais":1,"Percepção":2,"Etiqueta":4,"Liderança":4,"Persuasão":5,"Subterfúgio":4,"Performance":2,"Intimidação":3,"Investigação":2},"disciplinas":{"Auspícios":2,"Dominação":2,"Presença":4,"Fortitude":3},"humanidade":5,"potenciaSangue":3,"fome":null}'::jsonb,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '4f269a23-af61-5826-9b94-580b749ca282',
  'Espectro',
  'Outras criaturas',
  '["Espectro"]'::jsonb,
  1,
  1,
  1,
  7,
  4,
  '[]'::jsonb,
  '[{"nome":"Incorpóreo","descricao":"Não pode ser atingido enquanto não assumir forma sólida."},{"nome":"Banimento","descricao":"Magia sombria ou exorcismo por sacerdote ou inquisidor pode banir, destruir ou subjugar o Espectro."},{"nome":"Possessão","descricao":"Possui mortais por um efeito equivalente ao poder Possessão. Para forçar a vítima a agir contra a própria vontade, usa Manipulação + Condução."},{"nome":"Telecinese","descricao":"Usa Destreza + Briga para arremessar objetos."}]'::jsonb,
  '',
  '{"atributos":{"forca":4,"destreza":4,"vigor":4,"carisma":1,"manipulacao":3,"autocontrole":2,"inteligencia":3,"raciocinio":3,"determinacao":2},"habilidades":{"Briga":3,"Condução":4,"Ocultismo":4,"Sagacidade":2,"Ladroagem":2,"Furtividade":5,"Medicina":2,"Sobrevivência":2,"Erudição":1,"Atletismo":3,"Percepção":5,"Persuasão":1,"Subterfúgio":2,"Intimidação":3,"Investigação":1},"disciplinas":{"Auspícios":4,"Celeridade":2,"Dominação":2,"Ofuscação":2},"humanidade":null,"potenciaSangue":null,"fome":null}'::jsonb,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '7d29db87-b745-52f1-8ef0-53e52718f6e8',
  'Lobisomem',
  'Outras criaturas',
  '["Lobisomem"]'::jsonb,
  1,
  1,
  1,
  7,
  6,
  '[]'::jsonb,
  '[{"nome":"Resistência lupina","descricao":"Sofre dano agravado apenas de armas de prata e fogo."},{"nome":"Regeneração","descricao":"Recupera 1 ponto de dano superficial de Vitalidade por turno."},{"nome":"Forma de guerra","descricao":"Ao assumir a forma de guerra, soma +3 a Força, Destreza e Vigor. O bônus não está aplicado aos valores desta ficha."},{"nome":"Garras e presas","descricao":"Na forma de guerra, causam dano superficial +3 que vampiros não reduzem à metade."}]'::jsonb,
  'Valores básicos, antes da forma de guerra. As Disciplinas representam efeitos sobrenaturais equivalentes, com poderes à escolha do Narrador.',
  '{"atributos":{"forca":3,"destreza":3,"vigor":4,"carisma":3,"manipulacao":3,"autocontrole":2,"inteligencia":3,"raciocinio":4,"determinacao":4},"habilidades":{"Erudição":2,"Percepção":4,"Investigação":1,"Medicina":1,"Política":1,"Ocultismo":3,"Ciência":2,"Atletismo":4,"Briga":5,"Condução":1,"Armas de Fogo":1,"Armas Brancas":4,"Ladroagem":2,"Furtividade":4,"Sobrevivência":5,"Empatia com Animais":5,"Etiqueta":1,"Sagacidade":2,"Intimidação":5,"Liderança":1,"Manha":3},"disciplinas":{"Animalismo":5,"Auspícios":2,"Celeridade":4,"Fortitude":5,"Ofuscação":1,"Potência":5},"humanidade":null,"potenciaSangue":null,"fome":null}'::jsonb,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '9fa821e0-c10d-56b7-84b3-639cae4afa57',
  'Batedor da Trilha de Caim',
  'Vampiro',
  '["Sabá"]'::jsonb,
  6,
  2,
  4,
  7,
  6,
  '[{"nome":"Armas Brancas (Kukri)","valor":8},{"nome":"Percepção","valor":6},{"nome":"Disciplinas","valor":6}]'::jsonb,
  '[{"nome":"Animalismo 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Ofuscação 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Potência 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Kukri","descricao":"Ataques com a kukri causam +3 de dano."},{"nome":"Frenesi","descricao":"Quando arrisca ser derrotado, entra em frenesi e luta até a Morte Final."}]'::jsonb,
  'Trilha de Caim. Dificuldade geral: 4/3.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '9c2596f1-4a42-508d-920e-41bed06b79e1',
  'Assassino da Trilha de Caim',
  'Vampiro',
  '["Sabá"]'::jsonb,
  8,
  3,
  5,
  8,
  6,
  '[{"nome":"Briga (Agarrar)","valor":10},{"nome":"Armas Brancas (Cimitarra)","valor":10},{"nome":"Furtividade","valor":10},{"nome":"Disciplinas","valor":8}]'::jsonb,
  '[{"nome":"Celeridade 4","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Potência 3","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Feitiçaria de Sangue 3","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Ofuscação 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Cimitarra reforçada","descricao":"Ataques com a cimitarra causam +4 de dano."}]'::jsonb,
  'Trilha de Caim. Dificuldade geral: 6/4.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  'f4a3755b-d112-5f7b-a29c-20526d5b1c7c',
  'Isca Irresistível',
  'Carniçal',
  '["Sabá"]'::jsonb,
  3,
  5,
  2,
  5,
  4,
  '[{"nome":"Subterfúgio (Armadilha)","valor":6},{"nome":"Ladroagem (Bater Carteira)","valor":5}]'::jsonb,
  '[{"nome":"Presença 1","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Sangue intoxicante","descricao":"Saciar ao menos 1 de Fome causa os efeitos de metanfetaminas e alucinógenos e uma Compulsão até o fim da cena. Consulte o livro básico, p. 310."}]'::jsonb,
  'Trilha dos Cátaros. Dificuldade geral: 3/2.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '316b14a6-4c8a-5681-bbef-325350cfffa4',
  'Radicalizador da Trilha dos Cátaros',
  'Vampiro',
  '["Sabá"]'::jsonb,
  3,
  5,
  4,
  6,
  7,
  '[{"nome":"Persuasão","valor":8},{"nome":"Sagacidade (Ponto Fraco)","valor":8},{"nome":"Subterfúgio (Humanidade Fingida)","valor":8},{"nome":"Disciplinas","valor":6}]'::jsonb,
  '[{"nome":"Auspícios 3","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Presença 4","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Proteanismo 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."}]'::jsonb,
  'Trilha dos Cátaros. Dificuldade geral: 4/3.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '3efd81f5-eb49-57a9-95c9-9ca33e68a0f0',
  'O Vampiro da Trilha dos Cátaros',
  'Vampiro',
  '["Sabá"]'::jsonb,
  4,
  7,
  5,
  6,
  8,
  '[{"nome":"Performance (Representar um Vampiro)","valor":8},{"nome":"Ocultismo","valor":8},{"nome":"Disciplinas","valor":7}]'::jsonb,
  '[{"nome":"Dominação 4","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Proteanismo 4","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Animalismo 3","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."}]'::jsonb,
  'Trilha dos Cátaros. Dificuldade geral: 5/3.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '0b004db7-5319-5ce6-9727-f8890911ce94',
  'Adormecido da Trilha da Morte e da Alma',
  'Carniçal',
  '["Sabá"]'::jsonb,
  2,
  3,
  5,
  5,
  6,
  '[{"nome":"Subterfúgio (Devoção pelo Laço)","valor":6},{"nome":"Etiqueta","valor":6}]'::jsonb,
  '[{"nome":"Ofuscação 1","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Identidade condicionada","descricao":"Acredita na identidade de cobertura até receber o gatilho pós-hipnótico."}]'::jsonb,
  'Trilha da Morte e da Alma. Dificuldade geral: 3/2.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '9cc54ee3-2c3a-5853-ad63-19ef1d83faea',
  'Flautista da Trilha da Morte e da Alma',
  'Vampiro',
  '["Sabá"]'::jsonb,
  3,
  3,
  6,
  6,
  7,
  '[{"nome":"Persuasão (Incitar)","valor":7},{"nome":"Percepção (Fenômenos Fantasmagóricos)","valor":8},{"nome":"Ocultismo","valor":8},{"nome":"Disciplinas","valor":6}]'::jsonb,
  '[{"nome":"Auspícios 3","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Fortitude 1","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Oblívio 4","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Cerimônias de Oblívio","descricao":"Conhece ao menos quatro Cerimônias, à escolha do Narrador."},{"nome":"Espectros devedores","descricao":"Três Espectros lhe devem um serviço cada. Use a ficha de Espectro do livro básico, p. 377."}]'::jsonb,
  'Trilha da Morte e da Alma. Dificuldade geral: 4/3.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '08344c7a-16ca-5b55-bf3e-bd2c837983f2',
  'Molda-Vida da Trilha da Morte e da Alma',
  'Vampiro',
  '["Sabá"]'::jsonb,
  3,
  5,
  8,
  6,
  8,
  '[{"nome":"Ofícios (Carne Viva)","valor":9},{"nome":"Ciência (Microbiologia)","valor":9},{"nome":"Medicina","valor":9},{"nome":"Disciplinas","valor":8}]'::jsonb,
  '[{"nome":"Dominação 4","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Proteanismo 4","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Animalismo 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Auspícios 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Criações","descricao":"As criações carniçais usam a ficha de Szlachta. O Narrador define os efeitos dos microrganismos modificados."}]'::jsonb,
  'Trilha da Morte e da Alma. Dificuldade geral: 5/3.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '117056be-99c6-5b96-933f-0644a7d2e68e',
  'Servo Arruinado da Trilha do Poder e da Voz Interior',
  'Carniçal',
  '["Sabá"]'::jsonb,
  3,
  4,
  3,
  5,
  5,
  '[{"nome":"Etiqueta (Elísio)","valor":6},{"nome":"Subterfúgio (Está Tudo Bem)","valor":6}]'::jsonb,
  '[{"nome":"Fortitude 1","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Granada","descricao":"Fragmentação M67: dano básico 12, menos 1 por metro; agravado em mortais. A alternativa incendiária causa dano básico 8 por fogo."}]'::jsonb,
  'Trilha do Poder e da Voz Interior. Dificuldade geral: 2.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  'ab094860-c283-509d-b57d-57da3fe7c515',
  'Cavaleiro da Trilha do Poder e da Voz Interior',
  'Vampiro',
  '["Sabá"]'::jsonb,
  5,
  4,
  3,
  7,
  7,
  '[{"nome":"Armas de Fogo (Submetralhadora)","valor":6},{"nome":"Intimidação","valor":8},{"nome":"Investigação (Bandos do Sabá)","valor":6},{"nome":"Disciplinas","valor":6}]'::jsonb,
  '[{"nome":"Dominação 3","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Fortitude 3","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Auspícios 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Submetralhadora","descricao":"Ataques com a submetralhadora causam +3 de dano."}]'::jsonb,
  'Trilha do Poder e da Voz Interior. Dificuldade geral: 4/3.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '0f9386f1-2ccd-5ded-b9e6-be841715c53d',
  'Bispo da Trilha do Poder e da Voz Interior',
  'Vampiro',
  '["Sabá"]'::jsonb,
  6,
  6,
  6,
  8,
  9,
  '[{"nome":"Armas Brancas (Sabre de Cavalaria)","valor":9},{"nome":"Intimidação","valor":9},{"nome":"Política (Implacável)","valor":8},{"nome":"Disciplinas","valor":8}]'::jsonb,
  '[{"nome":"Dominação 5","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Potência 5","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Presença 3","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Sabre de cavalaria","descricao":"Ataques com o sabre causam +3 de dano."},{"nome":"Bando","descricao":"Seu bando fica por perto; use o Cavaleiro da mesma Trilha para os integrantes."}]'::jsonb,
  'Trilha do Poder e da Voz Interior. Dificuldade geral: 5/4.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '6168f48a-9619-59bc-89c9-9030984196cf',
  'Heliófilo da Trilha do Sol',
  'Vampiro',
  '["Sabá"]'::jsonb,
  4,
  4,
  3,
  5,
  5,
  '[{"nome":"Armas de Fogo","valor":5},{"nome":"Furtividade","valor":5},{"nome":"Disciplinas","valor":4}]'::jsonb,
  '[{"nome":"Fortitude 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Alquimia de Sangue-Ralo 3","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."}]'::jsonb,
  'Trilha do Sol. Dificuldade geral: 3/2.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '549728ee-9cd2-5535-89ae-75748d9273ec',
  'Pretendente do Sabá',
  'Vampiro',
  '["Sabá"]'::jsonb,
  4,
  4,
  2,
  6,
  4,
  '[{"nome":"Briga","valor":6},{"nome":"Manha","valor":6},{"nome":"Disciplinas","valor":5}]'::jsonb,
  '[{"nome":"Celeridade 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Potência 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Presença 1","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."}]'::jsonb,
  'Seguidor marginal do Sabá. Dificuldade geral: 3.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  'baa9fa54-6bbc-5099-aa81-9769e2be9cd7',
  'Não Nascido',
  'Vampiro',
  '["Sabá"]'::jsonb,
  5,
  1,
  2,
  7,
  3,
  '[{"nome":"Briga","valor":6}]'::jsonb,
  '[{"nome":"Potência 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Despertar","descricao":"Pode permanecer dormente por meses ou anos, até as circunstâncias do ritual provocarem o despertar."}]'::jsonb,
  'Criatura do Sabá. Dificuldade geral: 3.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  'f1576dde-bf90-5d30-a723-f963807efaa9',
  'Acorrentado',
  'Carniçal',
  '["Sabá"]'::jsonb,
  2,
  3,
  4,
  6,
  8,
  '[{"nome":"Briga (Golpe Espectral; após liberação)","valor":8},{"nome":"Atletismo (Arremesso Espectral; após liberação)","valor":8},{"nome":"Intimidação (Manifestação Espectral; após liberação)","valor":8}]'::jsonb,
  '[{"nome":"Liberação dos Espectros","descricao":"Após liberar os Espectros, use Físico 6, Social 1 e Mental 2. As Paradas Excepcionais passam a valer e surgem efeitos equivalentes a Potência 3 e Fortitude 3."},{"nome":"Âncora espectral","descricao":"Os Espectros protegem sua âncora. Após a liberação, o carniçal envelhece rapidamente e morre em cerca de uma hora."}]'::jsonb,
  'Servo espectral do Sabá. Dificuldade geral: 4/2.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '326f3ffb-399e-5ea4-a8c1-1ad32cdd4132',
  'Carniçal da Ninhada',
  'Carniçal',
  '["Sabá"]'::jsonb,
  5,
  3,
  4,
  6,
  5,
  '[{"nome":"Briga","valor":6},{"nome":"Furtividade (Ocultar-se à Vista)","valor":7},{"nome":"Subterfúgio","valor":5}]'::jsonb,
  '[{"nome":"Proteanismo 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Fusão","descricao":"A fusão leva três turnos, é irreversível e impede esquivar ou resistir a ataques físicos enquanto ocorre. O dano sofrido passa para a forma fundida."},{"nome":"Armas Ferais","descricao":"Pode manifestar partes da forma fundida como Armas Ferais, pagando o custo com dano agravado, conforme o livro básico, p. 234."}]'::jsonb,
  'Carniçal de carne fundida do Sabá. Dificuldade geral: 3/2.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
--> statement-breakpoint
INSERT INTO "modelo_antagonista" (
  "id", "nome", "categoria", "etiquetas", "parada_fisico", "parada_social", "parada_mental",
  "vitalidade", "vontade", "paradas_excepcionais", "especiais", "notas", "ficha_completa",
  "status_revisao", "nota_revisao", "incluido"
) VALUES (
  '8950ce37-08b5-51f4-bce2-675a9f481479',
  'Forma de Carne Fundida',
  'Carniçal',
  '["Sabá"]'::jsonb,
  9,
  0,
  4,
  12,
  5,
  '[{"nome":"Briga","valor":12},{"nome":"Intimidação","valor":10}]'::jsonb,
  '[{"nome":"Potência 3","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Fortitude 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Proteanismo 2","descricao":"Poderes à escolha do Narrador, respeitando o nível indicado."},{"nome":"Metabolismo","descricao":"Usa os poderes sem custo em dano agravado, mas sofre 1 de dano agravado por turno. Consumir uma vítima de tamanho humano ou 5 níveis de Fome em vitae suspende essa perda por cinco turnos."},{"nome":"Mente coletiva","descricao":"Disciplinas mentais não alteram seu comportamento nem controlam suas ações."},{"nome":"Ninhada incompleta","descricao":"Para cada integrante ausente antes da fusão, reduza a Vitalidade em 3 e as paradas em 1 a 3, conforme o tamanho da ninhada."}]'::jsonb,
  'Carniçal de carne fundida do Sabá. Dificuldade geral: 5/3. Valores para a fusão de quatro a seis integrantes.',
  NULL,
  'aprovado',
  '',
  TRUE
) ON CONFLICT ("id") DO UPDATE SET
  "status_revisao" = 'aprovado',
  "incluido" = TRUE;
