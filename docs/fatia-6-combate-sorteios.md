# Fatia 6: Combate & Rolagens

Decisões de implementação para a **Fatia 6**, seguindo rigorosamente o `GLOSSARY.md` e o escopo de `docs/escopo-v1.md`.

## 1. Escopo Desta Fatia

### Bestiário do Narrador (`/narrador/bestiario`)
- Antagonistas e Bestiário privados do Narrador.
- Modelos de antagonistas com ficha simplificada do V5:
  - Categoria / Arquétipo (ex: Carniçal, Mortal, Segunda Inquisição, Lupino) com filtro por abas e busca textual rápida.
  - Botão **Duplicar Modelo** para clonar modelos existentes e criar variantes rapidamente.
  - Paradas: Físico, Social e Mental (mínimo 1).
  - Paradas excepcionais (lista dinâmica de pares `{ nome: string, valor: number }`).
  - Vitalidade e Força de Vontade máximas.
  - Especiais (regras/poderes com nome e descrição com texto rico / Markdown via `EditorRichText`, exibidos na tela como badges clicáveis com `VisualizadorMarkdown`).
  - Notas livres com suporte a texto rico / Markdown via `EditorRichText` (equipamento, táticas, etc.).
- CRUD completo com persistência em PostgreSQL (`modelo_antagonista`).

### Gerenciador de Combate (`/combate`)
- Apenas 1 Combate ativo por vez na Crônica (descartável ao encerrar).
- Participantes:
  - Personagens dos Jogadores e PdNs da Crônica.
  - Inimigos instanciados a partir dos Modelos do Bestiário com Vitalidade e Força de Vontade próprias e controle de dano superficial/agravado.
  - **Edição / Customização de Instâncias de Inimigos**: botão de edição no card do inimigo permite que o Narrador altere nome, paradas, vitalidade/vontade máximas, adicione/remova Especiais e Notas temporárias diretamente na cena sem afetar o modelo original do Bestiário.
- Ordem de turnos manual:
  - Reordenação manual com botões subir/descer (mantendo o participante ativo no índice correto).
  - Destaque marcante no participante que está agindo agora.
  - Contador de Rodadas (inicia em 1; avançar após o último participante incrementa a Rodada e reseta para o primeiro).
  - Voltar turno e voltar rodada.
- Visibilidade:
  - Jogadores enxergam a ordem e os Inimigos.
  - Vitalidade do Inimigo só é visível aos Jogadores se o Narrador liberar (`revelarVitalidade`).
  - Condição dos Personagens no Combate segue estritamente as regras de Coterie (visível apenas para o dono ou para quem compartilha Condição e divide Coterie).
- Sincronização em tempo real via Server-Sent Events (SSE) sem polling, com revalidação automática das rotas no barramento (`escopo: 'combate'`).
- Notificação imediata para o Jogador quando o Narrador inicia um combate contendo um Personagem dele na ordem de turnos.

### Rolagens do Narrador (`/narrador/rolagens`)
- Rolagens para o Narrador:
  - **Ressonância**: rola Tipo (Colérico, Melancólico, Fleumático, Sanguíneo) e Intensidade com d10 canônico (1-5 Desprezível, 6-8 Fugaz, 9 Intensa, 10 Aguda). Se resultar em Aguda (10), rola automaticamente a Discrasia associada.
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
