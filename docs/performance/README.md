# Ciclo de performance

## Metas

- LCP abaixo de 2,5 s em cada tela crítica no perfil móvel de laboratório.
- CLS abaixo de 0,1.
- INP abaixo de 200 ms nas interações principais.
- Preservar comportamento; ganho só conta quando supera a variação entre medições. Redução determinística de bytes transferidos ou de assets pré-carregados também conta como ganho, mesmo com LCP dentro do ruído.

Perfil padrão: Chrome DevTools, 390×844, CPU 4× mais lenta, Slow 4G, build de produção servido pelo Node, cache frio. Repetir cada cenário e comparar a mediana. Guardar também a medição com cache quente. Lab local não substitui dados de usuários reais.

## Ciclo

1. Escolher o maior gargalo medido ainda fora da meta.
2. Fazer uma mudança pequena que ataque esse gargalo.
3. Validar build, tipos e comportamento afetado.
4. Repetir exatamente o perfil de antes e comparar a mediana; reverter ganho dentro da variação ou regressão funcional.
5. Registrar a evidência e passar ao próximo gargalo.

Parar quando as telas críticas estiverem dentro das metas ou quando o próximo gargalo depender de sessão/dados reais, infraestrutura não disponível ou decisão de produto. Limitar cada hipótese a três tentativas sem ganho.

## Evidências e tarefas

- [x] Ativar Brotli/gzip para assets de produção e cache imutável nos assets versionados.
- [x] Verificar cabeçalhos no servidor Node de produção local.
- [x] Medir `/entrar`: LCP caiu de 3,57 s sem compressão para 1,58 s com assets comprimidos; CLS 0. Cache quente: LCP 0,71 s. Medições iniciais únicas, sem CrUX e sem INP; repetir antes de tratar números como referência estável.
- [x] Corrigir CLS de `/combate`: o trace atribuiu 0,27 à troca tardia da fonte Jost. Preload da fonte levou CLS a 0; LCP permaneceu em ~1,58 s no mesmo perfil.
- [x] Perfil autenticado de Narrador: `/personagens/:id` LCP 1,48 s / CLS 0; `/paradas` 1,70 s / CLS 0,02; `/` teve LCP entre 1,41–1,82 s / CLS 0. `/combate` teve INP de 173 ms ao minimizar cards. Amostras locais únicas, sem CrUX.
- [x] Repetir `/` três vezes: TTFB 375 ms na primeira carga e 15–21 ms nas duas seguintes; tratar o primeiro valor como inicialização fria, não como gargalo estável.
- [x] Paralelizar as quatro leituras independentes do Painel do Narrador e medir 11 pares alternados no banco local: mediana caiu de 1,94 ms para 0,73 ms (−62,7%). É tempo das consultas, com a base local pequena; não representa TTFB nem carga de produção.
- [ ] Paralelizar consultas independentes ao abrir Ficha e iniciar a leitura das opções da Crônica junto da Ficha no loader de edição. A rota autenticada ainda precisa de medição de ponta a ponta.
- [x] Repetir `/combate` em build de produção: sem preload de CSS, LCP 1,47 / 1,51 / 1,65 s (mediana 1,51 s), CLS 0. Com preload, mediana 1,50 s. Diferença de 5 ms não supera o ruído; preload extra removido.
- [x] Simular compressão do HTML no proxy local: com CSS separado, LCP frio mediano 1,60 s e quente 0,72 s. Inline + Brotli: frio 0,78 s e quente 0,73 s; inline + gzip: frio 0,80 s e quente 0,74 s. CLS 0 em todos. HTML inline caiu de 100.973 para 17.966 bytes com Brotli.
- [x] Reduzir JS inicial de `/entrar`: `validateSearch` importava `ETAPAS` de `wizard.tsx`, puxando o wizard e catálogos para o chunk global. Separar a constante deixou os preloads do root em 3 assets (eram 9); o chunk principal caiu de 704,26 KB para 372,64 KB, gzip de 188,79 KB para 114,30 KB e Brotli de ~156 KB para ~96 KB.
- [x] Confirmar a divisão de JS em produção: os preloads do root caíram de 9 para 3; `/entrar` transferiu 169.725 bytes de JS contra 280.657 antes (−39,5%). O entry caiu de 159.150 para 97.558 bytes Brotli (−38,7%).
- [x] Repetir perfil frio de `/entrar`: produção antiga LCP 790/795/800 ms, CLS 0; produção nova 1.060/800/804 ms, CLS 0. O primeiro acesso novo teve TTFB 345 ms; os seguintes, 118/116 ms. Medianas 795/804 ms; diferença de 9 ms não supera o ruído. No trace novo, o script principal bloqueou 4/18/25 ms. Três cliques em “Ver senha” levaram 32/16/16 ms. Sem erros de console.
- [x] Confirmar inline CSS do manifesto TanStack e compressão real do HTML no Traefik: `/entrar` respondeu `Content-Encoding: gzip` e `Vary: Accept-Encoding`. O trace CSS separado continua sendo apenas simulação local.
- [x] Investigar LCP de `/combate`: o elemento é texto; 97,6% do LCP ficou em atraso de renderização. CSS bloqueou renderização e o trace estimou 426–515 ms, mas preload não reduziu o LCP. Um forced reflow apareceu sem função identificada e sem economia estimada; sem alvo seguro para correção agora.
- [x] Medir busca de Paradas com 17 itens: interação de digitação teve INP de 85 ms e CLS 0. A amostra não representa listas maiores.
- [x] Tornar não bloqueante a alternância global de cards em `/combate`: em uma cena de teste com 12 inimigos, CPU 4× e Slow 4G, o trace registrou INP de 54 ms e CLS 0. Revertido: o INP anterior (173 ms) já estava na meta, não houve comparação pareada e a transição mudava o botão (desabilitado, sem ícone, rótulo “Atualizando cards...”).
- [x] Adicionar smoke de produção no CI: verificar HTML público, preload da fonte, CSS e JavaScript com Brotli/cache imutável e gzip fallback. O smoke valida contratos de entrega; não garante CLS nem fixa um LCP sintético.
- [x] Repetir baseline de `/entrar` com várias amostras no domínio após deploy.
- [ ] Medir TTFB e interações da Ficha após paralelizar as consultas, com uma sessão autenticada representativa.
- [ ] Medir uma sessão de Jogador além da sessão de Narrador.
- [ ] Confirmar que eventos `text/event-stream` seguem sem compressão no Traefik.
- [x] Investigar assets de Ficha/schemas/popover em `/entrar`; o grafo confirmou que vinham do import eager de `ETAPAS` no wizard.
- [ ] Priorizar alertas de loops do React Doctor apenas nas interações identificadas pelo perfil.
- [ ] Definir budgets de CI depois de criar cenário estável para as telas críticas.
