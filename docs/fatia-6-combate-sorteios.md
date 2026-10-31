# Fatia 6: Combate & Rolagens

Decisões de implementação para a **Fatia 6**, seguindo rigorosamente o `GLOSSARY.md` e o escopo de `docs/escopo-v1.md`.

## 1. Escopo Desta Fatia

### Antagonistas do Narrador (`/narrador/antagonistas`)
- Antagonistas e Antagonistas privados do Narrador.
- Modelos de antagonistas com Ficha Simplificada ou Ficha Completa de Antagonista:
  - Categoria / Arquétipo (ex: Carniçal, Mortal, Segunda Inquisição, Lupino) com filtro por abas e busca textual rápida.
  - Botão **Duplicar Modelo** para clonar modelos existentes e criar variantes rapidamente.
  - Paradas: Físico, Social e Mental (mínimo 0; valores negativos não são permitidos).
  - Paradas excepcionais (lista dinâmica de pares `{ nome: string, valor: number }`).
  - Vitalidade e Força de Vontade máximas.
  - Especiais (regras/poderes com nome e descrição com texto rico / Markdown via `EditorRichText`, exibidos na tela como badges clicáveis com `VisualizadorMarkdown`).
  - Notas livres com suporte a texto rico / Markdown via `EditorRichText` (equipamento, táticas, etc.).
- CRUD completo com persistência em PostgreSQL (`modelo_antagonista`).
- Carga inicial opcional: `pnpm antagonistas:povoar` inclui 40 Modelos (21 do Craft, 18 do Sabá e o Lobisomem do livro básico), após a revisão inicial, sem migration. Os nomes originais e as fontes ficam nos documentos de pesquisa. Identificadores fixos e a comparação de nomes evitam duplicatas ao repetir a carga; Modelos existentes e edições do Narrador são preservados. As regras caseiras de alimentação do PDF não são importadas.

- A Ficha Completa usa Atributos (inclusive valores sobrenaturais acima de 5), Habilidades e Disciplinas individuais; Humanidade, Potência do Sangue e Fome ficam vazias quando não informadas. Não há conversão automática para paradas gerais.
- A migration `0019_ficha_completa_antagonista` adiciona os dados completos e permite paradas gerais nulas nesse formato. Os Modelos existentes continuam simplificados. Os Inimigos mantêm a ficha completa no Combate, com edição da cópia e sem expor características privadas aos Jogadores.

### Revisão inicial de Antagonistas encerrada

- Em 31/10/2026, foram mantidos os 41 Modelos aprovados no banco, incluindo os dois Carniçais preexistentes. Os 16 pendentes (15 Victim SPC Cards e Criatura, do Craft) foram recusados e retirados das listas de Antagonistas e do Combate. Seus registros e decisões são preservados no banco; as cópias já usadas em Combates mantêm as fichas.
- Os 16 candidatos recusados foram removidos da carga inicial. Os 40 Modelos restantes incluem um Carniçal genérico; a carga preserva variantes existentes e edições do Narrador.
- O acesso à aprovação foi encerrado. O botão de revisão saiu da lista e as URLs antigas redirecionam para `/narrador/antagonistas`.
- A migration `0018_aprovacao_bestiario` e os campos de decisão, nota e inclusão continuam preservando o histórico da revisão. Não há nova migration para encerrar a revisão.

### Gerenciador de Combate (`/combate`)
- Apenas 1 Combate ativo por vez na Crônica (descartável ao encerrar).
- Participantes:
  - Personagens dos Jogadores e PdNs da Crônica.
  - Inimigos instanciados a partir dos Modelos da lista de Antagonistas com Vitalidade e Força de Vontade próprias e controle de dano superficial/agravado.
  - **Edição / Customização de Instâncias de Inimigos**: botão de edição no card do inimigo permite que o Narrador altere nome, paradas, vitalidade/vontade máximas, adicione/remova Especiais e Notas temporárias diretamente na cena sem afetar o modelo original da lista de Antagonistas.
- Ordem de turnos manual:
  - Reordenação manual com botões subir/descer (mantendo o participante ativo no índice correto).
  - Destaque marcante no participante que está agindo agora.
  - Contador de Rodadas (inicia em 1; avançar após o último participante incrementa a Rodada e reseta para o primeiro).
  - Voltar turno e voltar rodada.
- Visibilidade:
  - Jogadores enxergam a ordem e os Inimigos.
  - Vitalidade do Inimigo só é visível aos Jogadores se o Narrador liberar (`revelarVitalidade`).
  - Os valores da Condição dos Personagens seguem as regras de Coterie (visíveis apenas para o dono ou para quem compartilha Condição e divide Coterie).
  - Por decisão do Narrador, as tags de saúde e de condições/debuffs ficam visíveis aos Jogadores mesmo quando os valores das trilhas estão ocultos. Isso não libera valores, paradas ou notas privadas nas respostas das ações.
  - Layout aprovado: cards minimizados mostram identificação e dot de saúde na primeira linha, números de Vitalidade/Força de Vontade/Fome na segunda e condições na terceira. Os números de dano são superficial/agravado, com amarelo/vermelho, em carrossel drag-free quando necessário. Nos inimigos incapacitados, identificação, dano e ações ficam na primeira linha; saúde e condições, na segunda.
- Sincronização em tempo real via Server-Sent Events (SSE) sem polling, com revalidação automática das rotas no barramento (`escopo: 'combate'`).
- Notificação imediata para o Jogador quando o Narrador inicia um combate contendo um Personagem dele na ordem de turnos.

### Rolagens do Narrador (`/narrador/rolagens`)
- Rolagens para o Narrador:
  - **Ressonância**: o Narrador escolhe o Tipo (Colérico, Melancólico, Fleumático, Sanguíneo) ou mantém Aleatório. Rola Intensidade com d10 canônico (1-5 Desprezível, 6-8 Fugaz, 9 Intensa, 10 Aguda). Se resultar em Aguda (10), rola automaticamente a Discrasia associada ao tipo.
  - **Manifestação de Sangue-Fraco**:
    - Se a vítima for Sangue-Fraco (regras V5 p. 114/229), seleciona aleatoriamente 1 das 2 disciplinas associadas ao tipo de ressonância.
    - Se Intensidade Desprezível ou Fugaz (d10 <= 8): manifesta Disciplina Nível 1 com 1 poder Nível 1 sorteado (sem amálgama).
    - Se Intensidade Intensa ou Aguda (d10 = 9 ou 10): manifesta Disciplina Nível 2 com 2 poderes sorteados (1 Nível 1 + 1 Nível 2, sem amálgama).
  - **Discrasia Avulsa**: rola por tipo de Ressonância específico ou entre qualquer tipo.
  - **Compulsão**: rola Compulsão Geral (Fome, Dominância, Dano, Paranoia) ou de Clã (específico ou aleatório).
- Aplicação no Personagem:
  - Narrador pode aplicar o resultado diretamente a um Personagem Ativo da Crônica.
  - Vira **Ressonância Atual** (incluindo manifestação de Sangue-Fraco se houver) ou **Compulsão Ativa** do Personagem até o Narrador encerrar.
  - O Jogador recebe notificação instantânea e visualiza a condição ativa no topo de sua Ficha (com a disciplina e poderes temporários de Sangue-Fraco).
  - O Narrador acompanha todas as condições ativas na Crônica na tela de Rolagens e pode encerrá-las a qualquer momento.

---

## 2. Modelagem do Domínio (`src/domain/`)

- `src/domain/sorteios.ts`: definições completas de regras do V5 (ressonâncias, intensidades com d10, discrasias canônicas, compulsões e manifestações de sangue-fraco) e funções puras com RNG injetável para testes determinísticos (`sortearRessonancia`, `sortearDiscrasia`, `sortearCompulsao`, `sortearManifestacaoSangueFraco`).
- `src/domain/bestiario.ts`: schemas Zod e tipos para `ModeloAntagonista`, `ParadaExcepcional` e `EspecialAntagonista`.
- `src/domain/combate.ts`: ciclo de turnos e rodadas (`iniciarCombate`, `avancarTurno`, `voltarTurno`, `reordenarParticipantes`, `adicionarParticipante`, `removerParticipante`, `aplicarDanoInimigo`, `alternarRevelarVitalidade`, `filtrarCombateParaJogador`).
- `src/domain/notificacoes.ts`: eventos para `combateIniciado`, `ressonanciaAplicada` e `compulsaoAplicada`.
- `src/domain/eventos.ts`: inclusão do escopo `'combate'` nos eventos em tempo real.

---

## 3. Armazenamento e Migrações (`drizzle/`)

- Tabela `modelo_antagonista`: id, nome, parada_fisico, parada_social, parada_mental, vitalidade, vontade, paradas_excepcionais (jsonb), especiais (jsonb), notas, criado_em, atualizado_em.
- Tabela `combate`: id, rodada, turno_atual, participantes (jsonb), ativo (boolean), criado_em, atualizado_em.
- Tabela `personagem`: colunas adicionadas `ressonancia_atual` (jsonb) e `compulsao_ativa` (jsonb).
- Migration `0012_fatia-6-combate-sorteios.sql`.
