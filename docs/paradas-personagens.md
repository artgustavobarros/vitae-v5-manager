# Paradas dos Personagens

- Página `/paradas`, acessível pela navegação do Jogador e do Narrador e pela Ficha de cada Personagem.
- O catálogo de Paradas Padrão e Personalizadas é compartilhado por toda a mesa. Uma nova definição fica disponível para todos.
- Nome da ação, Atributo e Habilidade são compartilhados. Os valores de cada característica e o total de dados base são calculados a partir da Ficha selecionada, sem modificadores da cena.
- Qualquer usuário autenticado pode adicionar Paradas. O autor pode editar e remover as próprias; o Narrador pode gerenciar todas as Personalizadas. As Padrão permanecem disponíveis.
- Antes de salvar, o formulário avisa quando a combinação de Atributo + Habilidade já aparece em outro card e mostra os títulos encontrados. A verificação inclui padrões e compartilhadas, ignora o próprio card em edição e permite salvar outra ação com a mesma combinação. O servidor também retorna o aviso ao salvar.
- Os Comboboxes de Atributos e Habilidades têm labels internos para os grupos Físico, Social e Mental, mantendo a busca direta.
- A ordem do grid é pessoal, salva por usuário. Trocar de Personagem muda os valores, mas mantém a ordem do usuário. Reordenar nunca altera o grid de outra pessoa.
- O conteúdo usa o container padrão de até 1440px. O grid compacto usa quatro colunas nas telas grandes e se adapta até uma coluna no celular. Título e badge de tipo ficam na primeira linha; composição e total, na segunda.
- Reordenação por mouse, toque e teclado (Espaço, setas, Espaço; Escape cancela). Os filtros preservam as demais Paradas, novas entradas são acrescentadas ao catálogo e ids removidos são ignorados.
- Filtros por Paradas Físicas, Sociais e Mentais seguem o grupo da Habilidade. O filtro de tipo combina com a busca textual.
- As regras de acesso à Ficha continuam valendo para a seleção do Personagem e leitura dos valores. Fichas bloqueadas ou arquivadas não impedem gerenciar o catálogo compartilhado nem a ordem pessoal.
- A página calcula valores e não rola dados, conforme confirmado pelo usuário.

A migração do modelo anterior preserva as definições e seus ids. A ordem antiga do Personagem atualizado mais recentemente vira a ordem pessoal do dono. Se o mesmo id tiver versões diferentes, preserva a versão mais recente.

Referência para o cálculo base: [mecânicas básicas de Vampire: The Masquerade, publicadas pela Paradox](https://www.paradoxinteractive.com/games/world-of-darkness/news/vampire-the-masquerade-basic-mechanics). As ações pré-definidas são sugestões de uso, não combinações obrigatórias para toda situação.
