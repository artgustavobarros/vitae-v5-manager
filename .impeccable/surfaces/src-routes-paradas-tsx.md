---
version: 1
slug: "src-routes-paradas-tsx"
primary_target: "src/routes/paradas.tsx"
related_targets: ["src/components/grid-paradas.tsx"]
---

# Paradas do Personagem

Modo Operate. O Jogador consulta combinações durante a sessão pelo celular. Herda o mundo visual do Vitae e seus componentes oficiais; o Narrador mantém o acesso permitido à Ficha. Sem rolagem de dados.

## Direction contract

THESIS: Um grid compacto de ações escolhido pelo usuário. Cada cartão mostra nome e tipo no topo, composição e total logo abaixo, com quatro colunas nas telas grandes.

OWN-WORLD: Grafite ameixa, tinta clara e vinho do tema; Jost nos dados, Alegreya SC nos títulos. Régua de 4px, fontes fechadas, controles shadcn e Combobox com busca direta.

STORY: O Jogador escolhe um Personagem, encontra Intimidar e entende de onde vêm seus dados. Pode compartilhar outra abordagem sem alterar a Ficha. Cada usuário mantém sua própria ordem.

FIRST VIEWPORT: Barra do app, título Paradas e ação Nova Parada; seletor de Personagem e busca; grid responsivo de uma a quatro colunas, com alça para reordenar. Atributo + Habilidade em texto legível e total à direita da segunda linha. Formulário inline ao criar ou editar.

FORM: Extensão da Ficha literária existente, com grid compacto e formulário inline; referência visual herdada da Ficha, seed: 0df87a213a050621.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Revisão final

Veredito: aprovado para revisão do usuário. Capturas do navegador conferidas em 390, 768 e 1440px: grid compacto com quatro colunas no desktop, duas no tablet e uma no celular, composição e total na mesma linha quando cabem e sem transbordamento horizontal. Mouse, toque e teclado reordenam as Paradas; Escape cancela. Ordem pessoal persistida por usuário, filtros preservados e restauração após recusa do servidor conferidos com dados temporários. O cabeçalho foi compactado para antecipar as primeiras ações. Formulário, busca, criação, edição, remoção, estado vazio e Arquivado foram exercitados no navegador com dados temporários removidos ao final. Permissões cruzadas e gravações simultâneas também passaram. Herda os tokens e a tipografia de `DESIGN.md`; não acrescenta cores, fontes ou imagens.

Refinamento compartilhado conferido: catálogo atualizado em tempo real entre dois Jogadores; valores calculados por Ficha; ordem pessoal preservada ao trocar de Personagem e recarregar, sem alterar a de outro usuário. Avisos de combinação repetida mostram títulos de padrões e compartilhadas; labels internos dos Comboboxes separam Físico, Social e Mental. Permissões de autor e Narrador e remoção compartilhada passaram. Capturas em 390, 768, 1440 e 1600px sem transbordamento horizontal.
