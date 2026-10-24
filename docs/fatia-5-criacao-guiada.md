# Fatia 5: Criação guiada de Personagem

Decisões confirmadas no grill de 2026-10-24. Os termos seguem o `GLOSSARY.md`, e o escopo geral está em `docs/escopo-v1.md`.

## Escopo desta fatia

- **Criação guiada completa do V5** no `WizardCriacao` para Jogador e Narrador (PdN).
- **Opções da Crônica**: tela do Narrador para configurar restrições de criação (idades/gerações permitidas, Sangue-Ralo/Caitiff habilitados, clãs permitidos). O padrão é Neófito, todos os clãs permitidos e sem Sangue-Ralo.
- **Catálogo de Tipos de Predador**: dados canônicos em TypeScript puro (`src/domain/catalogo/predadores.ts`) cobrindo Livro Básico e *Players Guide*.
- **Perdição e Compulsão do Clã**: card explicativo imediato ao selecionar o Clã, exibindo descrição, perdição e compulsão (dados de `CONSULTA_CLAS`).
- **Validação estrita de criação para Jogador**:
  - Atributos com contadores de slots: 1 em 4, 3 em 3, 4 em 2, 1 em 1 (base 1 em tudo).
  - Habilidades por perfil selecionável: *Especialista* (1×4, 3×3, 3×2, 3×1), *Equilibrado* (3×3, 5×2, 7×1) ou *Generalista* (1×3, 8×2, 10×1) + especializações iniciais.
  - Disciplinas de Clã: 2 pontos em uma, 1 ponto em outra (Caitiff escolhe livremente; Sangue-Ralo começa sem disciplinas de clã), com escolha obrigatória imediata de poderes do Catálogo.
  - Resolução inline de bifurcações do Tipo de Predador (disciplina opcional, especialização, bônus de vantagens e defeitos).
  - Vantagens e Defeitos travados estritamente em 7 pontos de Vantagens e 2 de Defeitos (fora os bônus do Predador), ou 1 a 3 méritos/defeitos equilibrados para Sangue-Ralo.
  - Convicções e Pedras de Toque (1 a 3 pares obrigatórios), Ambição e Desejo.
- **Narrador cria PdN** pelo mesmo fluxo, mas com bypass visual (avisos informativos sem bloquear conclusão).

---

## Estrutura do Wizard (8 Etapas)

1. **Identidade e Clã**:
   - Nome, Conceito, Clã, Geração, Seita e Senhor.
   - Filtro pelos clãs e gerações liberados nas Opções da Crônica.
   - Selecionar o Clã abre card em destaque com: Resumo, **Perdição do Clã** e **Compulsão do Clã**.
2. **Atributos**:
   - Distribuição padrão V5: 1×(4), 3×(3), 4×(2), 1×(1).
   - Painel de contadores de slots no topo. Avançar só é liberado com todos os slots preenchidos corretamente.
3. **Habilidades**:
   - Seletor de perfil inicial: *Especialista*, *Equilibrado* ou *Generalista*.
   - Contadores de slots correspondentes ao perfil escolhido.
   - Especializações: 1 grátis em Acadêmicos, Ofícios, Performance ou Ciência (se a perícia tiver ≥ 1 ponto) + 1 livre em qualquer perícia com ≥ 1 ponto. Campo de texto com combobox de sugestões canônicas.
4. **Disciplinas**:
   - 2 pontos em uma Disciplina de clã, 1 ponto em outra (ou livre para Caitiff; desativado para Sangue-Ralo).
   - Para cada ponto alocado, seleção obrigatória imediata de 1 poder do Catálogo daquele nível ou inferior, respeitando amálgamas.
5. **Tipo de Predador**:
   - Seleção do Tipo de Predador (Corebook e *Players Guide*).
   - Sub-seletores inline imediatos para resolver escolhas (ex.: escolher entre duas disciplinas, escolher perícia da especialização, etc.).
   - Aplicação automática de bônus na Ficha, identificados pela origem `[Predador]`.
6. **Vantagens e Defeitos**:
   - Contadores dedicados separando pontos pessoais de bônus do Predador: `Vantagens: x/7`, `Defeitos: x/2`.
   - Para Sangue-Ralo: contador espelhado de Méritos de Sangue-Ralo (1 a 3) e Defeitos de Sangue-Ralo (igual quantidade).
   - Conclusão travada para o Jogador se os requisitos não forem atingidos.
7. **Convicções e Pilares**:
   - 1 a 3 Convicções humanas, cada uma obrigatoriamente atrelada a uma Pedra de Toque mortal (nome e relação).
   - Ambição, Desejo, Aparência e História.
8. **Revisão e Conclusão**:
   - Resumo consolidado com detalhamento da origem dos valores (distribuição, clã, Predador).
   - Botão "Concluir Criação": converte o Rascunho em Personagem Ativo e bloqueia edição livre da Ficha.
   - Para o Narrador: ações extras de atribuição a Jogador ou criação como PdN.

---

## Armazenamento

- **Tabela `cronica`**:
  - `opcoes_criacao` (JSONB):
    - `idadePadrao`: `'neofito'` (default), `'neonato'`, `'ancillae'`
    - `sangueRaloPermitido`: boolean (default `false`)
    - `caitiffPermitido`: boolean (default `true`)
    - `clasPermitidos`: string[] (default: todos os 14 clãs padrão)
- **JSONB da Ficha (`dados`)**:
  - Campo `criacao` (durante o estado de Rascunho): guarda perfil de habilidades escolhido, especializações com origem, escolhas resolvidas do predador e rastreio de bônus.
  - Ao virar Ativo: consolida atributos, habilidades, disciplinas, poderes, vantagens/defeitos, convicções e pedras de toque no formato final canônico da Ficha.

---

## Regras e Validações

- **Origem dos pontos**: durante a criação, o Jogador vê claramente o que veio de cada fonte (ex.: "Rapidez 1 [Clã]", "Rapidez 2 [Predador: Rainha da Noite]").
- **Validação de poderes**: nenhum poder pode ser escolhido se o nível da Disciplina for menor que o do poder ou se o amálgama exigir outra Disciplina em nível não alcançado.
- **Geração e Potência do Sangue**:
  - Neófito: 12ª ou 13ª Geração, Potência do Sangue 1.
  - Sangue-Ralo: 14ª, 15ª ou 16ª Geração, Potência do Sangue 0.
- **Narrador**: pode ignorar quaisquer travas do wizard e concluir PdNs com valores arbitrários, com indicação visual de divergência das regras.

---

## Fica para outras fatias

- **Fatia 6**: Combate (ordem de turnos/iniciativa, Bestiário de antagonistas) e Sorteios (Ressonância, Discrasia e Compulsão aplicáveis em tempo real).
- **Fatia 7**: Ficha Liberada (edição pós-criação no lugar de XP com revisão do Narrador) e Arquivamento/Reativação de Personagens.
