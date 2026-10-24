# Fatia 3: Tempo real, Painéis e Coteries

Decisões confirmadas no grill de 2026-10-23. Os termos seguem o `GLOSSARY.md`, e o escopo geral está em `docs/escopo-v1.md`.

## Escopo desta fatia

- **Tempo real (SSE)**: barramento em memória no servidor; reconexão automática e recarregamento de dados no cliente sem polling.
- **Painel do Narrador**: rota `/` para Narrador, lista única de Personagens Ativos dos Jogadores com Coteries ao lado, além de PdNs fixados. Mostra Condição, Humanidade e Manchas.
- **Tela Coteries do Jogador (`/coteries`)**: lista única com membros das Coteries do Jogador; Condição compartilhada ou "oculto". O próprio Personagem sempre mostra a Condição (com aviso "não compartilhada" se desligado).
- **Filtro por Coterie**: chips de seleção única quando o usuário enxerga 3 ou mais Coteries.
- **Coteries**:
  - Coterie Padrão criada via migration (não pode ser apagada);
  - Narrador cria, renomeia, apaga Coteries e gerencia membros e convites;
  - Domínio da Coterie: Caça, Abrigo e Porte (0 a 5 cada);
  - Página da Coterie (`/coteries/$id`): Jogador e Narrador visualizam membros, conceito e domínio; Narrador tem ações administrativas;
  - Convite de Coterie: proposta para Personagem Ativo, aceita/recusada pelo Jogador na home em "Esperando você";
  - Membro sai da Coterie pela Ficha ou pela página da Coterie.
- **Compartilhamento de Condição**: botão/switch na aba Personagem da Ficha (tudo ou nada, desligado por padrão).
- **Fixar PdN**: Narrador fixa/desafixa PdN no Painel via ação na Ficha do PdN (coluna `fixado` no banco).
- **Notificações**: tabela `notificacao` no banco, histórico no sino (até 50) e toast ao vivo via SSE.
  - Eventos cobertos agora:
    - Jogador: Personagem atribuído, Convite de Coterie recebido, Removido de Coterie, Coterie apagada, Narrador editou a Ficha.
    - Narrador: Jogador entrou na Crônica (novo cadastro), Personagem concluído, Atribuição respondida, Convite de Coterie respondido, Personagem saiu de Coterie, Condição crítica.
- **Consulta rápida de termos de regras**: toque em Atributos, Habilidades, Clãs, Disciplinas e Domínio abre Sheet no celular / Dialog no computador com descrições e escalas.

## Armazenamento

- Tabela `coterie`: id, nome, conceito (texto opcional), caca (0-5), abrigo (0-5), porte (0-5), ehPadrao (boolean), criadoEm, atualizadoEm.
- Tabela `membro_coterie`: coterieId, personagemId, criadoEm.
- Tabela `convite_coterie`: id, coterieId, personagemId, criadoEm.
- Coluna `compartilha_condicao` (boolean, default false) e `fixado` (boolean, default false) na tabela `personagem`.
- Tabela `notificacao`: id, usuarioId, texto, linkJson (destino), lida (boolean, default false), criadoEm.

## Regras e Comportamento

- **SSE**: envia apenas tipo de evento + ids alterados; cliente invalida rotas pelo TanStack Router.
- **Condição crítica**: dispara notificação para o Narrador apenas na transição para o estado crítico provocada por ação de Jogador.
- **Filtro de Coteries**: ativado a partir de 3 Coteries visíveis.
- **Termos de regras**: texto descritivo e escala de 1 a 5 (ou resumo de clã com disciplinas, perdição e compulsão) em folha/diálogo.

## Fica para outras fatias

- Ficha Liberada (e suas notificações).
- Catálogo (fatia 4): Tipo de Coterie, Vantagens e Defeitos da Coterie, poderes de Disciplina, revisão e ampliação de regras.
- Criação guiada de Personagem (fatia 5).
- Combate e Sorteios.
- Arquivar e reativar Personagens.
