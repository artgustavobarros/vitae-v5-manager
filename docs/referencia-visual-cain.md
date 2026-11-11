# Referência visual: quadro de talismãs de CAIN

Pesquisa em 10/11/2026. Candidato mais próximo do pedido: [CAIN — Talisman Board, de Cora Shallit](https://github.com/corashallit/cain). A identificação ainda é uma hipótese: o usuário não forneceu o endereço original.

## Fontes primárias

- [README e demonstração animada](https://github.com/corashallit/cain/blob/main/README.md).
- [Aplicação indicada pelo próprio README](https://cora.earth/games/cain/talismans/).
- [Implementação HTML/CSS/JS](https://github.com/corashallit/cain/blob/main/talismans.html).
- [Licença do código](https://github.com/corashallit/cain/blob/main/LICENSE).

O README apresenta uma ferramenta específica de talismãs, independente de Foundry. Outro candidato encontrado foi [diabeatz96/cain](https://github.com/diabeatz96/cain), um sistema completo para Foundry com janela de talismãs; a ferramenta de Cora corresponde mais diretamente à descrição de um repositório para exibir e marcar talismãs.

## Linguagem visual e marcação

Conforme o README e o código da ferramenta de Cora:

- A tela é um quadro de posicionamento livre, com fundo escuro e imagens de ambiente; não é uma lista de cartões convencionais.
- Cada talismã é uma tira de papel alta e estreita, com contador de marcas/alvo próximo do topo. Nome e notas ficam ao lado da tira.
- Marcas são cortes vermelhos sobrepostos ao papel. Clicar acrescenta um corte; botão direito remove um. A marca nova recebe resposta visual breve, e completar o alvo destaca o contador.
- Arrastar move a tira; o canto inferior e a combinação de teclado com rolagem mudam seu tamanho. A ferramenta permite trocar arte e fundo.
- O estado é salvo no navegador. Isso não equivale à sincronização Narrador/público do Vitae.

A aplicação hospedada também foi inspecionada em navegador isolado, em 1440 × 900. A tela confirmou o fundo escuro, as tiras claras estreitas, o contador no topo e os nomes laterais. Nenhum arquivo de arte foi incorporado ao Vitae.

## Adaptação proposta para o Vitae

Interpretação de design, não regra de CAIN nem mudança de domínio do Vitae:

- Usar uma rota alternativa, preservando o Combate atual.
- Tratar Relógios como tiras com nome, etapa atual/total e riscos visíveis; manter os valores e limites já definidos no domínio.
- Apresentar a ordem do Combate e o participante agindo com a mesma linguagem de tiras, sem trocar a semântica de dano superficial `/` e agravado `X` do V5.
- Conservar tokens, tipografia e controles do design system do Vitae. O papel pode ser construído em CSS/SVG próprio, sem importar ilustrações.
- Na visão pública, marcas são somente exibição. Controles do Narrador, dados ocultos e sincronização continuam nas fronteiras atuais do servidor.

## Direitos de uso

O código é MIT, com atribuição a Cora Shallit. O README exclui explicitamente dessa licença as imagens em `reference/`, a arte da Ficha e o GIF: são obras de Tom Bloom disponibilizadas àquela ferramenta com autorização. Não copiar esses arquivos para o Vitae. A referência pode orientar composição e interação, usando implementação e elementos gráficos próprios.

## Estudo implementado

- Rota: `/experimentos/talismas`. Dados fictícios definidos na própria rota, independentes da Crônica; sem salvamento ou sincronização entre janelas.
- Relógios: cerco, ritual e amanhecer. Clique no papel ou `+` avança; botão direito ou `−` desfaz, respeitando zero e o total pelo domínio existente.
- Combate: Helena, Guarda da Torre e Acorrentado; posições do papel alternam o dano com a mesma regra V5 já usada na Ficha. A alternância para visão pública retira os controles e oculta a Vitalidade do Acorrentado.
- Direção da skill visual: `true-black-flat`, seed `1057512909`, mantendo paleta e tipografia do Vitae. O quadro de tiras substitui o grafo sugerido pela direção porque a referência explícita do usuário é um quadro de talismãs, não um editor de fluxos.
- Pergunta principal: quanto cada Relógio avançou ou cada trilha foi preenchida? A tira é o elemento dominante; os números e riscos usam o mesmo estado. Papel e selo são SVGs próprios, sem imagens externas.
- Não inclui arrastar, redimensionar, fundos importados ou integração com os links públicos reais. O layout é organizado responsivamente para comparação visual.

## Conferência visual e funcional

1. A tira é a forma dominante e responde à pergunta principal; o contador no papel e a quantidade de riscos derivam do mesmo estado.
2. O quadro compartilha as margens do cabeçalho. Em tablet, as tiras ficam mais estreitas para manter três colunas e os nomes laterais legíveis; no celular, ficam em uma coluna.
3. O vinho aparece nas marcações e nos estados do Combate. Navegação e controles permanecem neutros; paleta e fontes do Vitae foram preservadas.
4. Contagens verificadas ao avançar e desfazer um Relógio; ao completar, o botão de avanço é desabilitado. Dano superficial e agravado foram verificados com a regra existente da Ficha.
5. A visão pública do exemplo preserva as contagens, remove as ações e não renderiza marcas ou capacidade da Vitalidade oculta.
6. A legenda de `/` e `X` corresponde aos desenhos no papel. Não há gráfico duplicado nem total independente.
7. Inspeção em navegador de 1440, 768 e 390 px; sem rolagem horizontal. Celular físico não foi testado. A composição não tenta reproduzir as colagens licenciadas da referência.

O inspetor visual permite `icon-chips` exclusivamente por classificar os botões reais `+` e `−` como ícones decorativos. São controles de marcação com nomes acessíveis, não cartões de métricas. Lint visual sem achados; inspeção sem falhas com essa exceção justificada.

Verificações automatizadas: 571 testes passaram, incluindo três testes do componente; typecheck e build concluídos. React Doctor nos dois arquivos novos: 100/100, sem diagnósticos. As rotas existentes não foram substituídas.

## Comparação Cortejo e Altar

Implementada após o pedido de visualizar as propostas, em 10/11/2026:

- [Cortejo local](http://localhost:3005/experimentos/talismas?layout=cortejo&modo=combate): ordem numerada de participantes, com Helena maior e mais baixa. O mesmo arranjo também pode mostrar Relógios.
- [Altar local](http://localhost:3005/experimentos/talismas?layout=altar&modo=relogios): talismã principal no centro, maior, com dois secundários nas laterais. No celular, o principal vem primeiro.
- A navegação no topo permite alternar Cortejo, Altar e Original. As marcas são mantidas durante a navegação interna; recarregar a página restaura os exemplos. Cada layout funciona com Relógios e Combate.
- Máscaras SVG próprias abrem fendas transparentes no papel. Superficial conserva `/`; agravado acrescenta o corte oposto, formando `X`. No limite, uma fenda transversal rompe a parte inferior sem retirar nome ou contagem. Desfazer recompõe o papel. Não há animação de queda, flashes ou tremores.
- Dados ocultos não geram marcas, fendas, capacidade nem integridade no DOM. A simulação pública é somente leitura, não um novo link compartilhado.

Direção visual mantida: `true-black-flat`, seed `1057512909`, paleta e fontes existentes. A composição usa os dois arranjos solicitados, em lugar do painel analítico e da barra lateral sugeridos pela biblioteca. Ideia: a trilha de Vitalidade ou de etapas torna-se o próprio papel que se rompe. A interação é marcar/desfazer; nenhum asset externo foi adicionado.

### Crítica visual da comparação

ROUND 1

Seen in one second: tiras claras cortadas sobre o fundo escuro.
Idea (one sentence): a trilha é um papel progressivamente rasgado.
Live thing: clique abre uma fenda; desfazer recompõe.
Layout words by section: navegação=comparação / Cortejo=sequência / Altar=centro e laterais.
Scores: design 7 · usability 6 · creativity 7 · content 8 → overall 6.8.
Caps applied: nenhum teto específico de landing page; trata-se de uma tela de aplicativo.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Nomes do Cortejo ficavam depois do papel, abaixo da dobra inicial; mover informações para antes da tira.
2. A corda cruzava a posição dos participantes; reduzir a curvatura para separar desenho e texto.
3. A ordem visual dos controles não correspondia à ordem do DOM; renderizar os detalhes antes do papel nas duas composições suspensas.

ROUND 2

Seen in one second: Cortejo ordena participantes; Altar concentra a atenção em um Relógio maior.
Idea (one sentence): o dano visível permanece no próprio papel sem apagar a identidade do objeto.
Live thing: marcar, desfazer, alternar composições e simular a leitura pública com o mesmo estado.
Layout words by section: navegação=comparação / Cortejo=sequência / Altar=centro e laterais / celular=lista.
Scores: design 8 · usability 7 · creativity 7 · content 8 → overall 7.5.
Caps applied: não se aplicam pisos de fotografias ou animações de páginas promocionais.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. No celular, as tiras verticais exigem bastante rolagem (`mobile-page-01.jpg` de ambos os layouts). Limite aceito neste estudo comparativo; não é uma apresentação compacta de muitos participantes.
2. As descrições laterais do Altar quebram em mais linhas no tablet (`tablet-fold.jpg`). Sem colisões ou truncamento; o principal continua dominante.
3. As fendas são estilizadas e estáticas, não uma simulação física de fibras ou fragmentos. Preservar a distinção entre protótipo visual e animação realista.

Conferência: 574 testes passaram; typecheck e build passaram. React Doctor nos dois arquivos de implementação: 100/100; escopo geral alterado manteve 78/100, sem novos diagnósticos. Build conserva avisos do empacotador sobre diretivas `use client` de dependências Radix. Inspeção visual de produção em 1440, 768 e 390 px: 0 FAIL/0 WARN para ambos, permitindo apenas os botões reais `+` e `−` classificados como `icon-chips`. Capturas em `/var/tmp/vitae-cortejo-final/` e `/var/tmp/vitae-altar-final/`.

No navegador, foram conferidos avanço até o limite, ruptura e desfazer, alteração de dano, preservação das marcas entre composições e ocultação na visão pública. Console sem erros ou avisos. Celular físico não foi testado. Sem integração com os dados reais, sem salvamento, sem novas dependências e sem alterações nas rotas de Combate ou nos links públicos existentes.

Smoke do build final também passou: CSP/nonce, cabeçalhos, bloqueio anônimo do tempo real, limite de payload, CSS inline, fontes e assets comprimidos/cacheados. O preview temporário na porta 3105 foi encerrado; o desenvolvimento continua na porta 3005.
