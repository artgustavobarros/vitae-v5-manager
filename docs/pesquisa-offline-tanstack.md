# Latência percebida e conexão instável: IndexedDB e TanStack Query

Pesquisa em 2026-10-27. O diagnóstico e a proposta abaixo registram a investigação inicial. A implementação autorizada está registrada na [ADR 0002](adr/0002-sincronizacao-das-marcas.md): marcações otimistas na tela da Ficha, fila explícita em IndexedDB e idempotência transacional, com concorrência por campo e revisão monotônica.

## Recomendação inicial para o Vitae

O objetivo confirmado é o Jogador perceber o mínimo possível da latência e das interrupções da rede durante o uso da aplicação. A interface deve refletir a ação imediatamente e sincronizar em segundo plano. Recuperação de rascunhos não é a prioridade desta avaliação.

Recomenda-se TanStack Query para coordenar o estado remoto, as atualizações otimistas e as mutations dos fluxos frequentes. IndexedDB complementa esse mecanismo guardando pendências; não reduz o tempo de resposta do servidor. A atualização visual não deve aguardar rede nem escrita no IndexedDB. Só apresentar uma alteração como salva neste dispositivo depois de confirmar a escrita local.

O ganho principal vem de uma visão consistente dos dados: estado confirmado pelo servidor com as alterações ainda pendentes aplicadas por cima. Respostas antigas, consultas em segundo plano e eventos SSE não podem apagar ações locais mais recentes. A fila persistente exige também tratar concorrência no servidor.

Na investigação inicial, o projeto usava TanStack Start `1.169.3` e Router `1.170.45`, declarados em `package.json`, sem `@tanstack/react-query`, `@tanstack/react-query-persist-client`, Dexie ou `idb-keyval` como dependências diretas. Não havia uma fila de mutations do Query pronta para persistir: os fluxos chamavam server functions e invalidavam loaders. A implementação acrescentou Query e `idb-keyval` com uma fila explícita.

A [Fatia 2](fatia-2-ficha.md) determinava que marcações fossem revertidas com aviso quando a rede falhava. A mudança autorizada preserva a alteração como pendente durante falhas transitórias, enquanto rejeições de permissão ou domínio exigem correção visível. A especificação foi atualizada apenas para as marcações na tela da Ficha.

## Diagnóstico do código antes da implementação

- [`FichaPersonagem`](../src/components/ficha/ficha.tsx) guarda marcações em `useState`, aplica a mudança visual imediatamente e reverte no erro. `ultimoToque` ignora respostas antigas na interface; não ordena gravações no servidor. Cada toque envia todas as marcas, incluindo campos não alterados.
- [`useEdicaoFicha`](../src/components/ficha/formulario.tsx) mantém o formulário em memória. O [wizard](../src/components/ficha/wizard.tsx) salva antes de trocar de etapa; escolhas auxiliares também precisam entrar na recuperação local.
- [`salvarFicha` e `marcar`](../src/server/personagens.ts) gravam no Postgres. A transação com bloqueio não detecta que uma alteração foi calculada sobre uma versão antiga. Existe `atualizadoEm` no [schema](../src/db/schema.ts), mas as chamadas não exigem uma revisão esperada.
- [`useTempoReal`](../src/lib/use-tempo-real.ts) invalida loaders ao receber eventos SSE. Reconecta automaticamente, mas não refaz a consulta no `onopen`. A retomada precisa reconciliar o estado remoto com as pendências locais.
- A [rota da Ficha](../src/routes/personagens/$id/index.tsx) usa uma `key` baseada no JSON inteiro da Ficha. Uma atualização recebida por SSE pode carregar um estado intermediário, remontar o componente e reiniciar marcas locais enquanto existem outros envios pendentes. É um risco identificado por leitura do código, ainda não reproduzido em navegador.

Exemplo do risco: o Jogador fica sem conexão com Fome 3; o Narrador muda para 4; reenviar o estado antigo pode restaurar 3. Enviar todos os campos também pode sobrescrever dano que o Jogador nem alterou.

## Papel de cada camada

1. **Atualização otimista em memória:** aplicar o toque imediatamente e manter os componentes que mostram o mesmo Personagem consistentes. TanStack Query oferece atualização do cache e tratamento de consultas que poderiam substituir esse estado. [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates).
2. **Fila de mutations:** enviar em segundo plano, preservar ordem por Personagem e tentar novamente em falhas transitórias. Um resultado antigo não deve substituir ações locais posteriores. O tratamento dessas ações sobrepostas pertence à aplicação. [Mutations e scopes](https://tanstack.com/query/latest/docs/framework/react/guides/mutations).
3. **Persistência em IndexedDB:** manter as pendências fora da memória do componente. Sua função é durabilidade durante interrupções e descarte da página pelo navegador; não é necessária para o feedback visual imediato. A persistência padrão de mutations pausadas, sozinha, não garante a durabilidade de todo envio.

Exemplo de experiência desejada: o Jogador marca três níveis de Fome com a rede levando dois segundos para responder. A interface acompanha cada toque imediatamente. A confirmação do primeiro envio não faz a Fome voltar ao primeiro nível enquanto os demais continuam pendentes. Mostrar um indicador discreto apenas se houver pendência prolongada; apresentar rejeições definitivas de forma explícita.

## O que TanStack Query v5 fornece

| Recurso | Comportamento confirmado |
|---|---|
| Conectividade | `networkMode: 'online'` é o padrão: queries e mutations aguardam conectividade. `always` ignora esse sinal. `offlineFirst` permite a primeira tentativa e pode pausar retries; é útil quando a consulta pode ser atendida por cache local ou Service Worker. |
| Mutations | Erros não recebem retry por padrão. É preciso definir uma política seletiva para falhas transitórias. |
| Ordem | Mutations executam em paralelo por padrão. `scope.id` compartilhado serializa operações no mesmo QueryClient; isso não coordena dispositivos ou abas independentes. |
| Retomada | Após restaurar, `resumePausedMutations()` retoma mutations pausadas. É necessário registrar `mutationKey` e `setMutationDefaults` com `mutationFn`: funções não são persistidas. |

Fontes: [Network Mode](https://tanstack.com/query/latest/docs/framework/react/guides/network-mode) e [Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations).

O filtro padrão da desidratação inclui apenas mutations pausadas e queries bem-sucedidas. Uma requisição em andamento ou uma mutation já encerrada com erro não se torna automaticamente uma operação durável para reenvio. Isso delimita a garantia oferecida pela persistência padrão. [Código oficial de hydration](https://github.com/TanStack/query/blob/main/packages/query-core/src/hydration.ts).

## Como persistir em IndexedDB

A documentação oferece um persister com `idb-keyval` e três métodos: `persistClient`, `restoreClient` e `removeClient`. Esse adaptador pequeno basta para snapshots; Dexie passa a fazer sentido se surgirem consultas e transações locais mais complexas.

`PersistQueryClientProvider`, de `@tanstack/react-query-persist-client`, coordena a restauração com o ciclo do React. O `onSuccess` permite retomar mutations após a restauração. A aplicação ainda precisa aguardar a identidade do usuário antes de enviar operações.

Ajustar `gcTime` do cache de queries para pelo menos `maxAge`; o padrão de retenção do snapshot é 24 horas. Um snapshot vencido ou com `buster` diferente é descartado. Não usar essa expiração como política silenciosa de descarte de alterações do usuário. Persistir somente queries e mutations explicitamente escolhidas. [Persistência e exemplo IndexedDB](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient).

## Requisitos da aplicação

Os itens seguintes são recomendações de arquitetura para o Vitae, não garantias do TanStack:

1. **Separar por usuário e Personagem.** Restaurar apenas o conjunto da identidade atual. Definir o destino das pendências no logout sem reenviá-las pela conta seguinte. Não persistir credenciais.
2. **Evitar repetição de efeitos.** Uma operação pode chegar ao servidor e perder apenas a resposta. Comandos com efeitos precisam de identificador e deduplicação transacional antes de habilitar reenvio automático.
3. **Detectar conflito.** Enviar somente campos alterados e usar revisão do registro para rejeitar atualização baseada em revisão antiga. Serializar mutations por Personagem não impede alterações simultâneas do Narrador ou de outro dispositivo. Definir como o usuário resolve o conflito.
4. **Mostrar o estado real.** Distinguir alteração local, envio pendente, sincronização concluída e falha permanente. Revalidar sessão, permissões e domínio no servidor; não repetir indefinidamente erros de autorização ou validação.
5. **Definir a durabilidade.** Confirmar a escrita local antes de prometer “salvo neste dispositivo” e testar interrupção durante o envio. O filtro padrão de mutations pausadas não cobre sozinho todos os momentos de fechamento da aba.

IndexedDB continua sujeito a quotas, remoção pelo usuário e descarte pelo navegador. Tratar falha de gravação e não apresentar armazenamento local como backup definitivo. [Quotas e descarte](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

## Entrega incremental proposta

1. Começar pelas marcações da Ficha: cache compartilhado, atualização otimista e envio serial por Personagem. Preservar pendências diante de respostas antigas e atualizações SSE, eliminando a reinicialização do estado por mudanças no JSON. Enviar somente os campos alterados.
2. Acrescentar persistência das pendências em IndexedDB e retries seletivos, com revisão, conflitos e deduplicação no servidor. Não habilitar retry global. A interface deve distinguir pendência de rejeição definitiva sem bloquear cada toque.
3. Aplicar o mesmo padrão aos demais fluxos frequentes conforme a semântica de cada ação. Na criação guiada, avaliar a troca de etapa após validação local, com salvamento em segundo plano; a conclusão continua exigindo confirmação do servidor. Ações que dependem do estado coletivo, como avançar turno, precisam de precondições próprias antes de receber tratamento otimista ou reenvio.

## Validação necessária antes da implementação ser considerada pronta

- Com respostas atrasadas em dois segundos, cada toque deve aparecer imediatamente e respostas intermediárias não podem fazer a interface retroceder.
- Durante vários toques, um evento SSE ou uma consulta em segundo plano deve preservar as alterações pendentes.
- Interromper a rede durante o envio e restaurá-la deve sincronizar sem perder ações nem duplicar efeitos; incluir o caso em que só a resposta foi perdida.
- Uma rejeição definitiva ou um conflito com o Narrador deve ficar visível, preservando ações posteriores que ainda sejam válidas.
- Descartar e restaurar a página deve recuperar as pendências efetivamente gravadas, somente para a conta correta.

Os cenários acima orientam a validação da implementação. A pesquisa inicial foi estática e documental; resultados posteriores devem ser registrados separadamente, sem tratar o atraso artificial da rede como uma medição de produção.

## Validação da primeira entrega

- A suíte completa passou: 371 testes em 36 arquivos, com Postgres isolado em `vitae_sync_test`. Typecheck, build e smoke dos assets de produção também passaram.
- Os testes reais do Postgres cobrem duplicatas simultâneas, resposta perdida seguida de mudança posterior, reutilização indevida do identificador, conflitos, campos independentes, permissão revogada, conta incorreta e rollback da transação inteira.
- Os testes do cliente cobrem persistência antes do envio, confirmação atrasada, recuperação de operação em voo, isolamento por conta, falha de IndexedDB, bloqueios, reinício do React, duas abas, dois Personagens e retry após timeout.
- No Chrome, viewport 390×844 e Slow 3G, três toques em Fome permaneceram visíveis durante os ACKs e atualizações SSE. Queda e retorno da rede sincronizaram a pendência; fechar a aba com uma operação salva e reabrir com conexão restaurou o mesmo identificador, gerando um único recibo. Conflito com mudança remota preservou o servidor e permitiu descarte explícito. A rodada final não apresentou erros de hidratação nem avisos no console.
- A migration `0017_sincronizacao_marcas.sql` foi validada no banco isolado e depois aplicada no banco local `v5_manager`, na porta 5434, a pedido do usuário. A existência da coluna de revisão, da tabela de recibos e do trigger foi confirmada. O React Doctor não apontou erros novos; o aviso de `await` no loop do descarte corresponde à remoção serial dos registros sob lock, mantendo a memória consistente com cada exclusão concluída.

## Correções da revisão — 2026-10-28

Os dois defeitos reproduzidos na revisão ganharam testes de regressão em `src/lib/sincronizacao-marcas.regressao.test.ts`: conflito do novo toque com uma pendência restaurada e reinserção de uma operação confirmada por snapshot atrasado. Os testes falharam antes das correções e passaram depois delas. Há também cobertura para vários toques com campo independente e timestamp futuro na fila antiga, além de encerramento da conta durante a restauração.

A correção guarda intenções iniciais em memória até conhecer a base e a ordem recuperadas. O armazenamento agora devolve operações e confirmações num snapshot atômico, e uma revisão local invalida leituras que ficaram antigas durante a espera. A publicação de notificações persistidas também foi compartilhada entre os dois fluxos, preservando a emissão após commit e a idempotência.

A suíte completa passou com 375 testes em 37 arquivos no banco isolado; typecheck, build e smoke de produção passaram. Uma revisão independente não encontrou novos defeitos confirmados. No Chrome móvel com Slow 3G, três toques permaneceram visíveis até a confirmação, sem retrocesso; uma alteração feita sem conexão sincronizou depois da reconexão e do reload online. A verificação final não apresentou erros ou avisos de console. As condições de corrida exatas são cobertas pelos testes determinísticos, sem depender de reproduzir seu timing manualmente no navegador.
