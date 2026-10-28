# Fatia 2: Ficha básica

Decisões confirmadas no grill de 2026-10-23. Os termos seguem o `GLOSSARY.md`, e o escopo geral está em `docs/escopo-v1.md`.

## O que a Ficha tem nesta fatia

- Identidade: nome, Clã, Geração, Seita, Senhor, Ambição e Desejo.
- 9 Atributos e 27 Habilidades. Cada Habilidade aceita Especializações em texto livre.
- Disciplinas com nome e nível, sem poderes. Os poderes esperam a fatia do Catálogo e entram já escolhidos de lá, sem texto livre provisório.
- Potência do Sangue e Humanidade.
- Vitalidade, Força de Vontade, Fome e Manchas.

Os demais itens da Ficha entram em fatias seguintes da v1: poderes de Disciplina, Rituais, Cerimônias e Fórmulas, Vantagens e Defeitos, Convicções e Pedras de Toque, Aparência, História, Notas e Ficha Liberada.

## Armazenamento

- Tabela `personagem`: dono (Jogador ou Narrador, se PdN), status (Rascunho, Ativo, Arquivado) e nome em colunas.
- O resto da Ficha fica num campo JSONB, tipado e validado em `src/domain/`.

## Regras

- Clã e Disciplinas vêm de listas fixas no código, sem texto livre. A lista tem os 7 clãs do livro básico, os 7 dos suplementos, Caitiff e Sangue-Ralo.
- Enquanto as opções da Crônica não existirem, o formulário oferece todos os clãs.
- Valores Derivados calculados: Vitalidade = Vigor + 3; Força de Vontade = Autocontrole + Determinação. A sobrescrita do Narrador fica para depois.
- Faixas do formulário (limites da ficha, não regras de criação):

  | Campo | Faixa |
  |---|---|
  | Atributo | 1–5 |
  | Habilidade | 0–5 |
  | Disciplina | 1–5 |
  | Humanidade | 0–10 |
  | Potência do Sangue | 0–10 |
  | Geração | 4–16 |

- O Rascunho nasce com os valores do Neófito: Atributos 1, Habilidades 0, Humanidade 7, Potência do Sangue 1, Fome 1.
- Se a Vitalidade ou a Força de Vontade cair abaixo do dano marcado, o dano é cortado ao salvar, começando pelo superficial.

## Ciclo e permissões

- O Jogador cria Rascunhos pelo formulário manual, edita tudo e apaga.
- O botão "Concluir" passa o Rascunho para Ativo. Só exige nome, sem validação do V5.
- Com o Personagem Ativo, a Ficha fica bloqueada: o Jogador marca só dano, Fome e Manchas.
- Cada marca é salva no toque, sem botão "Salvar". Na tela da Ficha, a marca aparece imediatamente e fica pendente durante falhas transitórias, com envio em segundo plano e recuperação das pendências salvas no dispositivo. Conflitos ou rejeições definitivas pedem revisão e permitem descartar explicitamente as pendências. Painéis e Combate mantêm o comportamento anterior: falha de rede reverte a marca e exibe um aviso.
- O Jogador vê só os próprios Personagens.
- O Narrador:
  - vê todas as Fichas;
  - edita as Ativas sem validação;
  - vê os Rascunhos dos Jogadores só para leitura;
  - cria PdNs pelo mesmo formulário.

## Telas

- Jogador: "Meus Personagens" (lista com status, botão "Novo Personagem" e "Apagar" nos Rascunhos) e a tela da Ficha.
- Criação do Rascunho em wizard, sem regras do V5:
  - etapas: Identidade, Atributos, Habilidades, Disciplinas, Sangue (Potência do Sangue, Humanidade, Ambição e Desejo) e Revisão;
  - cada "Próximo" salva o Rascunho; "Concluir" fica na Revisão.
- O Narrador edita uma Ficha Ativa pelo formulário inteiro, numa página só.
- Tela da Ficha, com o layout em `src/components/ficha/ficha.tsx` (validado antes numa demo, já removida):
  - topo: nome e a linha "Clã · Geração · Potência do Sangue";
  - preso no topo: Humanidade com Manchas, Vitalidade, Força de Vontade e Fome;
  - abas: Atributos, Habilidades, Disciplinas e Personagem. A aba Notas entra na fatia das Notas;
  - a aba Personagem mostra Seita, Senhor, Ambição e Desejo, e depois recebe Convicções, Pedras de Toque, Aparência e História;
  - se o Desejo fizer falta na mesa, ele sobe para o topo depois.
- Narrador: lista de todos os Personagens, com o Jogador e o status de cada um.

## Fica para outras fatias

- Tempo real (SSE) e Painéis.
- Arquivar e reativar.
- Sobrescrita de Valores Derivados.
- Opções de criação da Crônica.
