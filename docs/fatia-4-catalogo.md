# Fatia 4: Catálogo

Decisões confirmadas no grill de 2026-10-24. Os termos seguem o `GLOSSARY.md`, e o escopo geral está em `docs/escopo-v1.md`.

## Escopo desta fatia

- **Fontes**: todo livro que a [VTM Wiki](https://vtm.paradoxwikis.com/VTM_Wiki) cita como fonte (Corebook, Players Guide, Companion, Cults of the Blood Gods, Chicago by Night, Gehenna War, Sabbat: The Black Hand etc.). O que faltar na wiki o Narrador entrega a partir dos PDFs. Loresheets ficam fora da v1.
- **Catálogo e Ficha**: poderes de Disciplina, Rituais, Cerimônias, Fórmulas e Vantagens e Defeitos do Personagem, escolhidos do Catálogo na Ficha.
- **Coterie**: Tipo de Coterie e Vantagens e Defeitos da Coterie na página da Coterie.
- **Consulta rápida**: revisão dos textos atuais e novos termos (ver Regras).
- **Página de revisão de tradução** (`/catalogo/revisao`), só para o Narrador.
- **Combobox**: todo select do app vira combobox com busca, inclusive os que já existem (Clã e Disciplina no formulário e no wizard).

## Armazenamento

- O Catálogo fica em TypeScript em `src/domain/catalogo/`, com ids estáveis em kebab-case (ex.: `dominacao-1-compelir`). Não há tabelas de Catálogo no banco.
- O id nunca muda depois de publicado.
- `regras-consulta.ts` vai para dentro de `src/domain/catalogo/`.
- Cada item tem: id, nome, nome original (inglês), nível, pré-requisitos, custo, parada de dados (opcional), parada de resistência (opcional), duração (opcional), marca de errata, livro e página da edição em inglês, descrição curta escrita pelo projeto e confiança da tradução (`certo`, `duvida`, `ingles`).
- A Ficha (JSONB) guarda:
  - poderes, Rituais, Cerimônias e Fórmulas como ids;
  - Vantagens e Defeitos como `{ id, nivel, nota? }`. A mesma Vantagem pode repetir quando o livro permite (ex.: dois Contatos).
- Tabela `coterie` ganha `tipo` (id do Catálogo, opcional) e `vantagens`/`defeitos` no mesmo formato `{ id, nivel, nota? }`.
- Tabela `revisao_traducao`: id, itemId, status (`aprovado`, `sugerido`), sugestão de nome (opcional), sugestão de descrição (opcional), criadoEm.

## Regras

- **Fonte dos dados**: custo, parada, resistência, duração, pré-requisito, amálgama, livro e página vêm da VTM Wiki. Onde houver errata, vale o texto corrigido. A descrição curta é escrita pelo projeto, sem traduzir o texto de efeito da wiki.
- **Crédito**: a consulta rápida e a página de revisão têm o rodapé "Dados de referência: VTM Wiki (CC BY-SA 3.0)", com link.
- **Nomes e páginas**:
  - a página vem sempre da edição em inglês;
  - o nome segue a edição brasileira quando ela existe;
  - o que só existe em inglês é traduzido livremente, com o nome original entre parênteses.
- **Poderes de Disciplina**, para o Jogador:
  1. o seletor só oferece poderes de nível menor ou igual ao da Disciplina;
  2. o número de poderes vai até o nível da Disciplina;
  3. o amálgama fica bloqueado sem a outra Disciplina no nível exigido.
- **Rituais, Cerimônias e Fórmulas** seguem só a regra do nível (Feitiçaria de Sangue, Oblívio e Alquimia de Sangue-Ralo), sem teto de quantidade.
- **Narrador**: vê todos os itens, com aviso, mas sem bloqueio.
- **Nível baixou**: poderes e Rituais acima do novo nível ficam marcados em vermelho na Ficha, sem apagar.
- **Item removido do Catálogo**: a Ficha mostra "Item removido do Catálogo" em vermelho e não apaga nada.
- **Vantagens e Defeitos do Personagem**:
  - o seletor só oferece os níveis válidos do item;
  - cada linha tem uma nota livre opcional;
  - os contadores "x / 7" e "x / 2" só informam até a criação guiada (fatia 5).
- **Tipo de Coterie**:
  - opcional, um por Coterie, só o Narrador escolhe;
  - é descritivo: mostra o Domínio e as Vantagens sugeridas e abre a consulta rápida, sem aplicar nada.
- **Vantagens e Defeitos da Coterie**: só o Narrador edita, sem conta de pontos e sem registro de quem contribuiu. Os membros veem a lista na página da Coterie.
- **Consulta rápida**:
  - os textos atuais entram na página de revisão;
  - novos termos: poderes, Rituais, Cerimônias, Fórmulas, Vantagens, Defeitos, Tipo de Coterie, Potência do Sangue (tabela de efeitos de 0 a 10), Humanidade, Fome, Manchas, Vitalidade e Força de Vontade;
  - tocar num poder na Ficha abre o cartão com custo, duração, parada, resistência e descrição.
- **Combobox**:
  - shadcn Popover + Command;
  - a busca ignora acento e caixa e casa também o nome original (ex.: "compel" acha "Compelir (Compel)");
  - cada item mostra a descrição curta no próprio seletor.
- **Notificações**: nenhum evento novo nesta fatia. Mudanças no Tipo e nas Vantagens e Defeitos da Coterie não avisam ninguém.

## Revisão de tradução

- A rota `/catalogo/revisao` e o painel do Narrador foram removidos.
- O histórico de sugestões já gravadas continua no banco; o utilitário `pnpm catalogo:aplicar-sugestoes` permanece para aplicá-las ao Catálogo.

## Pesquisa do conteúdo

- Fonte principal: VTM Wiki. Sai em 3 lotes, cada um com um agente em segundo plano:
  1. Disciplinas, poderes, Rituais, Cerimônias e Fórmulas;
  2. Vantagens e Defeitos do Personagem;
  3. Tipos de Coterie, Vantagens e Defeitos da Coterie e os novos termos da consulta rápida.
- Cada lote entrega a lista de nomes em três grupos: com certeza, com dúvida e mantidos em inglês.
- Cada lote também lista o que não achou ou achou incompleto na wiki, com livro e página quando houver, para o Narrador entregar o trecho do PDF.
- As telas são feitas em paralelo, enquanto os lotes chegam.

## Fica para outras fatias

- Tipos de Predador, inclusive os do Players Guide (fatia 5, criação guiada).
- Validação dos 7 e 2 pontos de Vantagens e Defeitos (fatia 5).
- Contribuição dos membros em pontos para as Vantagens da Coterie (avaliar na fatia 5).
- Página `/catalogo` para navegar livremente no Catálogo.
- Ficha Liberada, Combate, Sorteios, arquivar e reativar Personagens.
- Loresheets: fora da v1.
