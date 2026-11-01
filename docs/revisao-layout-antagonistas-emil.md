# Revisão do layout de Antagonistas — Emil Kowalski

Data: 2026-10-31. Escopo: lista de Antagonistas, filtros, cards, detalhes e editor. Esta entrega instala as skills e registra a revisão; não altera o layout.

## Skills instaladas

As quatro skills vieram de `frontend/` do [repositório de skills do projeto](https://github.com/artgustavobarros/skills/tree/main/frontend), cuja origem é Emil Kowalski:

- `mobile-native`: viewport, toque, campos e gestos.
- `break-ui`: testes de componentes com dados extremos.
- `review-animations`: duração, origem, acessibilidade e propósito do movimento.
- `pick-ui-library`: escolha e reaproveitamento de bibliotecas.

Os arquivos completos estão em `.agents/skills/`, com links em `.claude/skills/`. `skills-lock.json` registra o repositório do Narrador como origem para reinstalação com `pnpm skills:install`.

## Verificação

Inspeção por Chrome DevTools MCP, com dados existentes do banco de teste, nas larguras 320, 390, 768 e 1440 px. A preferência por movimento reduzido foi emulada. O editor foi aberto sem salvar alterações. Não houve alteração nas fichas ou no banco de desenvolvimento.

O inspetor separado de `design-taste-frontend` foi tentado, mas não encontrou Chrome instalado no ambiente do terminal. A inspeção visual e as medidas abaixo vieram do navegador disponível pelo MCP. Não há nota automática desse inspetor.

Esta foi uma revisão do layout existente: não foi executado o fluxo completo de `break-ui` com fixtures extremas e seletor de cenários. Não houve teste em telefone físico; teclado do sistema, zoom automático do Safari, notch e sensação dos gestos ainda precisam dessa validação.

## Prioridades

| Prioridade | Evidência | Recomendação | Referência |
| --- | --- | --- | --- |
| Alta | A busca usa fonte de 12 px no celular. Isso está abaixo dos 16 px recomendados para evitar zoom ao focar um campo no Safari. O zoom não foi reproduzido em hardware. | Usar `text-base` no celular e reservar fonte menor ao desktop; manter zoom permitido. | `src/components/antagonistas.tsx:295` |
| Alta | Em 390 px, uma linha de Paradas Excepcionais mede 850 px dentro de um espaço de 308 px. O primeiro item pode estar inteiro, mas os seguintes ficam escondidos. | Mostrar Paradas Excepcionais e Especiais em linhas que quebram; preservar o popover para a descrição. Considerar quebra de linha também nos filtros, que hoje escondem opções no celular e no tablet. | `src/components/antagonistas.tsx:371`, `src/components/ui/carrossel-badges.tsx:32` |
| Média | Os chips clicáveis de Dificuldade e Especiais medem 26 px de altura; filtros medem 32 px. A consulta durante a sessão exige precisão no toque. | Aumentar a área clicável no celular, mirando 44 px, sem precisar aumentar o texto nem o chip visual na mesma proporção. | `src/components/badge-especial.tsx:37`, `src/components/antagonistas.tsx:279` |
| Média | Mesmo com movimento reduzido, o popover mantém a animação de entrada. Dialog e Popover não definem alternativa para remover deslocamento e escala. | Manter feedback de opacidade e retirar deslocamento/escala quando `prefers-reduced-motion: reduce` estiver ativo. | `src/components/ui/popover.tsx:32`, `src/components/ui/dialog.tsx:60` |
| Média | O botão compartilhado usa `transition-all`; controles comuns mantêm `touch-action: auto` e não têm feedback próprio de pressionamento. O carrossel Embla também usa `touch-action: auto`. | Declarar apenas as propriedades necessárias; adicionar feedback discreto ao pressionar e `touch-action: manipulation` nos controles. Nos carrosséis mantidos, avaliar `pan-y pinch-zoom` para preservar rolagem vertical e zoom. | `src/components/ui/button.tsx:7`, `src/components/ui/carrossel-badges.tsx:35` |

## Revisão de movimento

| Antes | Depois recomendado | Motivo |
| --- | --- | --- |
| `transition-all` no Button compartilhado | Lista explícita das propriedades que realmente mudam | Evita animação involuntária de tamanho e posição. |
| Popover e Dialog com deslocamento/escala também sob movimento reduzido | Variante de movimento reduzido com opacidade, sem deslocamento/escala | Respeita a preferência de acessibilidade. |
| Controles sem feedback de pressionamento | Estado `:active` discreto; se houver transição, usar 100–160 ms | A resposta deve aparecer quando o dedo toca, sem depender de hover. |

Parecer: há ajustes de acessibilidade e interação antes de aprovar o movimento pelos critérios da skill. As durações atuais observadas — 150 ms no popover e 200 ms no diálogo — estão dentro dos limites recomendados. A origem do popover já acompanha o gatilho Radix.

## O que manter

- Cards e conteúdo alinhados pelo topo. A diferença de altura entre cards não justifica voltar a distribuir o conteúdo com `justify-between`.
- Nomes longos quebrando linha; valores zero exibidos como zero; números com `tabular-nums`.
- Filtros gerais seguidos das Etiquetas do tipo selecionado.
- Identidade atual do Vitae: cores do tema, Jost e Alegreya; não é necessário trocar a direção visual.
- Componentes shadcn/Radix e as bibliotecas existentes. `cmdk`, Sonner, dnd kit, clsx e cva já correspondem a escolhas da lista do Emil; esta revisão não exige dependência nova.

Não foi observado transbordamento horizontal da página nas quatro larguras. O menu principal recolhe no celular. Os campos do editor inspecionados usam 16 px no celular, e o diálogo cabe no viewport emulado com rolagem interna. O navegador emitiu um aviso de preload de fonte no servidor de desenvolvimento; não foram observados erros de execução.

Próxima alteração recomendada: corrigir busca, quebra de linha das informações e área de toque, preservando o alinhamento pelo topo já pedido.

## Cabeçalho com retorno ao subir — revisão da implementação

Implementado no componente compartilhado `BarraApp`, após a escolha do mosaico. A barra fica visível nos primeiros 56 px e ignora oscilações menores que 8 px na direção da rolagem. O espaço original da barra permanece reservado.

| Antes | Depois | Motivo |
| --- | --- | --- |
| A navegação saía da tela junto do conteúdo | Cabeçalho fixo que recolhe ao descer e retorna ao subir | Disponibiliza a navegação sem exigir voltar ao início da página. |
| Sem transição de visibilidade | `transform` em 160 ms, com `cubic-bezier(0.23, 1, 0.32, 1)` | Resposta curta, reversível durante a animação e sem animar propriedades de layout. |
| Sem tratamento específico para essa interação | Movimento reduzido usa opacidade em 100 ms; foco visível de teclado remove a transição; menus abertos mantêm a barra acessível | Evita deslocamento animado quando não é desejado e protege o uso dos controles. |

Parecer: **aprovado** para os critérios de movimento revisados, sem achados novos. Conferidos no navegador: esconder e revelar longe do topo, menu mobile, foco de teclado e movimento reduzido. Os cinco testes do controle incluem mudança de direção, pequenas oscilações, posição restaurada e rebote nas extremidades. A suíte completa passou com 471 testes. A sensação do gesto em telefone físico ainda não foi verificada.
