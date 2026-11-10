# Relógios narrativos: Blades in the Dark e Daggerheart

Pesquisa em 10/11/2026. Fontes primárias: regras oficiais de Blades in the Dark e Daggerheart SRD 2.0. Esta nota pesquisa referências para o Vitae; não introduz regras oficiais de Vampiro nem registra decisões de implementação.

## Blades in the Dark

Um relógio é um círculo segmentado que acompanha esforço contra um obstáculo ou a aproximação de um perigo. A referência sugere 4, 6 ou 8 segmentos conforme a complexidade; não apresenta esses tamanhos como limite universal. O nome descreve o obstáculo, não o método escolhido para vencê-lo. O relógio representa a ficção, sem determinar sozinho o que acontece. [Progress Clocks, fonte oficial](https://bladesinthedark.com/progress-clocks).

As variações incluem perigo, corrida entre dois objetivos, relógios vinculados, missão com prazo, disputa reversível, projetos e facções. Perigos se concretizam quando o relógio fica cheio; complicações podem preencher de um a três segmentos. Na disputa reversível (*tug-of-war*), acontecimentos podem preencher ou esvaziar segmentos. Projetos e facções permitem acompanhar mudanças por várias sessões. A finalidade inclui ajudar o grupo a perceber o avanço da situação; a página não estabelece uma política universal de visibilidade para todo relógio. [Progress Clocks](https://bladesinthedark.com/progress-clocks).

## Daggerheart

A [página oficial do SRD](https://www.daggerheart.com/srd/) apresenta a versão 2.0, publicada em 25/08/2026. A seção consultada, “Countdowns”, está na página 91 do arquivo do [PDF oficial](https://www.daggerheart.com/wp-content/uploads/2026/08/DH_SRD_2_2026_08_25.pdf#page=91).

O countdown parte de um valor e dispara um efeito ao chegar a zero. Aqui, avançar significa diminuir. O padrão reduz uma unidade por rolagem de ação. Os dinâmicos distinguem progresso, com resultado favorável, e consequência, com resultado desfavorável; cada rolagem reduz de zero a três unidades. [SRD 2.0, seção Countdowns](https://www.daggerheart.com/wp-content/uploads/2026/08/DH_SRD_2_2026_08_25.pdf#page=91).

Variações: valor inicial aleatório; repetição ao disparar; valor inicial aumentado ou reduzido a cada repetição; progresso e consequência vinculados; longo prazo com avanço após descansos. A seção não fixa um máximo universal nem exige que todo countdown seja público. [SRD 2.0, seção Countdowns](https://www.daggerheart.com/wp-content/uploads/2026/08/DH_SRD_2_2026_08_25.pdf#page=91).

## Recomendações para o Vitae, ainda não aprovadas

1. Uma página de Relógios da Crônica, com cartões criados e controlados pelo Narrador. Jogadores consultam os cartões revelados, sem editar.
2. Separar categoria narrativa de direção da contagem. Categorias possíveis: perigo, objetivo, prazo e disputa. A direção distingue preencher até o total de reduzir até zero; ambos permitem correções manuais com aumentar/diminuir.
3. Cada cartão mostra título, categoria, indicador visual, valor atual e total. Descrição explica o acontecimento acompanhado. Uma consequência ao atingir o limite pode ser texto do Narrador, sem executar alterações automáticas na Ficha ou no Combate.
4. Oferecer ocultar/revelar o cartão inteiro, sem prometer visibilidade parcial. Informação oculta não deve ser enviada ao cliente do Jogador. Título, descrição e consequência visíveis precisam ser escritos sem revelar segredos involuntariamente.
5. Começar com atualização manual e sincronização entre clientes, reutilizando a infraestrutura SSE existente (`src/server/eventos.ts`, `src/routes/api/tempo-real.ts` e `src/lib/use-tempo-real.ts`). Deixar fora da primeira versão rolagens automáticas, vínculo entre relógios, repetição e progressão por descanso.

Exemplos próprios para a ambientação: “Suspeita da Segunda Inquisição”, 3 de 6 segmentos preenchidos; “Nascer do sol”, 2 de 4 etapas restantes; “Descobrir o refúgio”, 1 de 8 segmentos preenchidos. São exemplos de uso, não regras de V5.

O alcance da visibilidade — toda a Crônica ou uma Coterie — ainda precisa ser definido. A criação da página, o nome definitivo do conceito e qualquer mudança no modelo do domínio dependem da definição de escopo.

Esta pesquisa não alterou código, schema, migrations, ADRs, glossário ou dados do banco.
