---
name: Umbra
description: A Ficha oficial do V5 em uma página escura e literária, cujo topo aquece em vinho com a Fome.
colors:
  background: "#141215"
  card: "#1c191d"
  secondary: "#242026"
  border: "#2e2930"
  input: "#3a333d"
  marcador: "#857887"
  muted-foreground: "#a69ea6"
  foreground: "#f1edf0"
  primary: "#c0304e"
  primary-foreground: "#fff7f9"
  vinho: "#c0304e"
  vinho-escuro: "#5a1a29"
  fome: "#ff7d95"
typography:
  display:
    fontFamily: "Alegreya SC, ui-serif, Georgia, serif"
    fontSize: "40px"
    fontWeight: 500
    lineHeight: "44px"
  headline:
    fontFamily: "Alegreya SC, ui-serif, Georgia, serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: "32px"
  numeral:
    fontFamily: "Jost Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
    fontFeature: "tnum"
  body:
    fontFamily: "Jost Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  body-sm:
    fontFamily: "Jost Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Jost Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
rounded:
  sm: "4px"
  md: "8px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "11": "44px"
  "12": "48px"
  "14": "56px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 16px"
  button-primary-lg:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "0 24px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 16px"
  button-ghost-hover:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
  input:
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "4px 12px"
  barra-app:
    typography: "{typography.headline}"
    height: "56px"
    padding: "0 16px"
  linha-estado:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.body-sm}"
    height: "48px"
  celula-marcador:
    rounded: "{rounded.md}"
    width: "40px"
    height: "48px"
  caixa-dano:
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    size: "24px"
  caixa-dano-agravado:
    textColor: "{colors.vinho}"
    rounded: "{rounded.sm}"
    size: "24px"
  bolinha-ponto:
    backgroundColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    size: "12px"
  bolinha-fome:
    backgroundColor: "{colors.vinho}"
    rounded: "{rounded.full}"
    size: "20px"
  numeral-fome:
    textColor: "{colors.fome}"
    typography: "{typography.numeral}"
  linha-traco:
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    height: "44px"
  aba-linha:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.body-sm}"
    height: "36px"
  aba-linha-ativa:
    textColor: "{colors.foreground}"
  alerta-compulsao:
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
---

# Design System: Umbra

Exceção aprovada para o Combate: dano superficial usa amarelo e dano agravado usa vermelho/vinho, tanto nos cards minimizados quanto nos abertos. As tags mantêm a gradação de saúde. Essas cores usam tokens semânticos do tema; a estrutura e a densidade dos cards seguem o layout aprovado em `docs/fatia-6-combate-sorteios.md`.

## Overview

**Creative North Star: "A Ficha à Meia-Luz"**

Umbra é a ficha oficial de Vampiro: A Máscara 5ª Edição passada a limpo para uma mesa presencial com luz baixa. A página é escura, grafite tingido de ameixa, com tinta clara e uma única cor de estado, o vinho. A estrutura é literária: o nome do Personagem e os títulos de seção em serifa, todo o resto em uma sans neutra, e linhas finas no lugar de cartões. Os marcadores são os da ficha de papel (caixas, "/", X, bolinhas, trilha de Humanidade), para que ninguém reaprenda a ler.

O movimento-assinatura é o calor: o topo da Ficha aquece em vinho conforme a Fome sobe de 0 a 5, e a faixa de estado (horizonte de Humanidade, Vitalidade, Força de Vontade, Fome) fica presa no topo ao rolar. A profundidade vem desse calor e da tonalidade, não de sombras.

A densidade é de ferramenta de mesa: linhas de 48px tocáveis com o polegar, rótulo à esquerda e marcadores à direita, uma coluna central de no máximo 768px. A voz visual carrega o clima; os textos ficam neutros, em PT-BR, com os termos oficiais do V5.

**Key Characteristics:**
- Escuro de propósito: grafite ameixa, nunca superfícies claras.
- Vinho é a única cor de estado; o rosa-fome aparece só no numeral da Fome.
- Serifa contada: logotipo, nome do Personagem e títulos de seção.
- Glifos da ficha oficial, com o mesmo traço de 2px.
- Topo que aquece com a Fome; faixa de estado presa.
- Régua de 4px e escala tipográfica fechada.

## Colors

Grafite tingido de ameixa em quatro degraus, tinta clara em dois, e vinho como a única voz de estado.

### Primary
- **Vinho** (`vinho`, igual a `primary`, `destructive` e `ring`): botão principal, dano agravado, bolinhas de Fome cheias, sublinhado da aba ativa, anel de foco, cursor de texto, seleção (a 45%) e borda/fundo do alerta de Compulsão (45% e 15%). Erro também é vinho: não existe um vermelho separado.
- **Vinho Escuro** (`vinho-escuro`): só como pigmento misturado ao fundo no topo e na faixa de estado, na proporção da Fome. Nunca como cor sólida de superfície ou texto.
- **Rosa-Fome** (`fome`): exclusivamente o numeral da Fome na faixa de estado.

### Neutral
- **Grafite Ameixa** (`background`): fundo da página.
- **Grafite Elevado** (`card`): fundo de alerta e popover.
- **Grafite de Apoio** (`secondary`, também `muted` e `accent`): botão secundário e hover de botão fantasma.
- **Linha** (`border`): todas as linhas finas, divisórias de traço e de estado.
- **Linha de Campo** (`input`): borda dos campos de texto.
- **Marcador Vazio** (`marcador`): caixas e bolinhas vazias, segmentos de Humanidade perdidos, polegar da barra de rolagem. Contraste para gráficos acima de 3:1 sobre o fundo.
- **Tinta Secundária** (`muted-foreground`): rótulos das trilhas, descrições, contexto da barra do topo.
- **Tinta** (`foreground`): texto principal, marcadores cheios, segmentos de Humanidade, "/" das Manchas e do dano superficial.

### Named Rules
**The Voz Única Rule.** O vinho é a única cor de estado. Primary, destructive e ring são o mesmo vinho; não introduza verde, âmbar ou outro vermelho para sucesso, aviso ou erro.

**The Rosa-Fome Rule.** O rosa-fome existe para um único elemento: o numeral da Fome. Em qualquer outro lugar ele é um defeito.

**The Token Rule.** Cores e fontes só por token do tema (`bg-background`, `text-vinho`, `border-marcador`, `font-serif`). Nunca hex em classe, nunca cores fixas da paleta do Tailwind. Transparência é por modificador de opacidade sobre um token (`vinho/15`, `vinho/25`, `vinho/45`).

## Typography

**Display Font:** Alegreya SC (com ui-serif, Georgia)
**Body Font:** Jost Variable (com ui-sans-serif, system-ui)

**Character:** Uma serifa condensada e literária usada com parcimônia, como o título de um capítulo, sobre uma sans técnica e neutra que carrega todos os dados e rótulos.

### Hierarchy
- **Display** (Alegreya SC 500, 40px/44px, token `text-display`): nome do Personagem, título de página ("Olá, …", "Convites para a Crônica") e o logotipo na tela de entrada. Com `text-balance`.
- **Headline** (Alegreya SC 500, 24/32, `text-2xl`): títulos de seção e de grupo (Físicos, Sociais, nome da Disciplina) e o logotipo "Umbra" na barra do topo.
- **Numeral** (Jost 600, 24/32, `text-2xl`, algarismos tabulares): o número da Fome.
- **Body** (Jost 400, 16/24, `text-base`): nomes de traços e poderes, itens de navegação.
- **Body-sm** (Jost 400–500, 14/20, `text-sm`): rótulos das trilhas, descrições, botões, abas, alertas. Contadores com `tabular-nums`.
- **Label** (Jost 400, 12/16, `text-xs`): legenda do horizonte de Humanidade, separadores.

A escala completa permitida é `text-xs` 12/16, `text-sm` 14/20, `text-base` 16/24, `text-xl` 20/28, `text-2xl` 24/32, `text-4xl` 36/40 e `text-display` 40/44. `text-xl` e `text-4xl` estão liberados mas ainda sem uso no build. Pesos em uso: 400, 500 (botões e abas, vindo do shadcn) e 600 (numeral da Fome, ênfase no alerta).

### Named Rules
**The Serifa Contada Rule.** Alegreya SC só no logotipo, no nome do Personagem e em títulos de seção. Rótulos, números, botões, abas e corpo são sempre Jost.

**The Escala Fechada Rule.** Só os sete tamanhos acima. Sem `text-lg`, sem `text-3xl`, sem tamanhos arbitrários.

## Layout

Coluna central única de no máximo 768px (`max-w-3xl`), com 16px de margem lateral; a tela de entrada usa uma coluna de 384px (`max-w-sm`) centralizada na vertical. O degradê do topo ocupa a largura toda; o conteúdo fica na coluna.

A Ficha se organiza de cima para baixo: barra do topo (56px), nome e descrição (rolam), faixa de estado presa (`sticky top-0`) com horizonte de Humanidade e três linhas de 48px, alerta de Compulsão quando houver, abas sublinhadas e listas de traços. A partir de 768px (`md`) os grupos de Atributos e Habilidades viram três colunas com 32px de calha; no celular empilham.

Alvos de toque: cada caixa de dano e bolinha de Fome fica numa célula de 40×48px; cada segmento de Humanidade é um botão de 48px de altura que divide a largura; linhas de traço têm 44px; itens de lista e navegação, 48px.

### Named Rules
**The Régua de 4 Rule.** Espaçamento e tamanhos só em passos inteiros do Tailwind (múltiplos de 4px). Sem meios passos (`p-1.5`, `gap-2.5`) e sem valores arbitrários `[...]` no código do projeto.

**The Faixa Presa Rule.** O estado do Personagem (Humanidade, Vitalidade, Força de Vontade, Fome) fica sempre visível no topo da Ficha ao rolar; nome e descrição rolam embora.

## Elevation & Depth

Sistema plano. Não há sombras no código do projeto; a profundidade vem da tonalidade e do calor. O topo da Ficha (`topo-fome`) é um degradê vertical que mistura o vinho escuro ao fundo em 20% por nível de Fome no alto e 6% por nível embaixo; a faixa presa (`faixa-fome`) usa o tom sólido de 6% por nível, para emendar sem costura com o pé do degradê. A mudança de Fome anima a variável `--fome-nivel` em 600ms com `cubic-bezier(0.16, 1, 0.3, 1)`. A tela de entrada reaproveita o topo com nível fixo 2, como atmosfera.

### Named Rules
**The Calor no Lugar da Sombra Rule.** Superfícies não flutuam. Separação é por linha de 1px, por um degrau de grafite ou pelo calor do vinho, nunca por `box-shadow`.

**The Topo que Aquece Rule.** A intensidade do vinho no topo da Ficha segue a Fome de 0 a 5 e mais nada. Com Fome 0 o topo é o próprio grafite.

## Shapes

Cantos suaves e pequenos: 4px nas caixas de dano e nos segmentos de Humanidade, 8px em botões, campos, células tocáveis e alertas; círculo pleno nas bolinhas e na barra de Humanidade (4px de altura). Bordas só de 1px (`border`) ou 2px (`border-2`). Os glifos da ficha usam traço de 2px com ponta arredondada.

### Named Rules
**The Traço Único Rule.** Toda borda é 1px ou 2px; todo traço de glifo é 2px. Bolinhas de leitura usam 1px; caixas de dano e bolinhas tocáveis de Fome usam 2px.

## Components

### Buttons
Contidos e funcionais, direto do shadcn.
- **Shape:** cantos de 8px.
- **Primary:** fundo vinho, tinta quase branca, 36px de altura e 16px de respiro (40px e 24px no tamanho grande, usado em "Entrar com Google"). Hover a 90%.
- **Secondary:** fundo grafite de apoio, tinta clara; hover a 80%.
- **Ghost:** sem fundo; hover em grafite de apoio. Usado em "Sair" e no ícone de remover convite.
- **Focus:** anel vinho.

### Inputs / Fields
- **Style:** borda de 1px na linha de campo, fundo `input` a 30%, 36px de altura, 8px de canto.
- **Focus:** borda e anel vinho.
- **Error:** borda vinho (destructive).

### Navigation
- **Barra do topo:** 56px, logotipo "Umbra" em serifa 24/32 à esquerda, contexto em `text-sm` tinta secundária à direita.
- **Abas da Ficha:** variante "linha" do shadcn, alinhadas à esquerda com 16px entre elas, sobre uma linha de 1px; aba ativa em tinta clara com sublinhado vinho de 2px; inativas em tinta secundária.
- **Lista de navegação:** linhas de 48px entre linhas de 1px, com chevron em tinta secundária.

### Alerta de Compulsão
Caixa de alerta do shadcn com borda vinho a 45% e fundo vinho a 15%, texto em tinta clara, título da Compulsão em 600. O estado é dito em texto, não só em cor. Erros de login usam a variante destrutiva (texto vinho sobre grafite elevado).

### Glifos da Ficha (assinatura)
- **Caixa de dano** (24px, borda 2px, canto 4px): vazia em borda marcador; superficial é um "/" de canto a canto em tinta; agravado é o mesmo "/" mais o traço oposto, formando um X de mesmo tamanho e traço, em vinho.
- **Bolinha de ponto** (12px, borda 1px): cheia em tinta, vazia em borda marcador. Linhas de pontos com 8px entre bolinhas.
- **Bolinha de Fome** (20px, borda 2px): cheia em vinho, vazia em borda marcador; ao lado, o numeral em rosa-fome.
- **Horizonte de Humanidade:** 10 segmentos de 4px de altura com 4px entre eles; Humanidade em tinta a partir da esquerda, o restante em marcador; Manchas preenchem a partir da direita e são marcadas por um "/" de 12px com traço de 2px. Legenda em `text-xs`: "Humanidade N" à esquerda, Manchas à direita.

### Linhas de estado e de traço
- **Linha de estado** (48px): rótulo e contador `restante/máximo` em `text-sm` tinta secundária à esquerda; marcadores tocáveis à direita, em células de 40×48px. Divisórias de 1px; a primeira separa do horizonte com vinho a 25%.
- **Linha de traço** (44px): nome em `text-base` à esquerda, pontos à direita, linha de 1px embaixo. Títulos de grupo em serifa 24/32 acima.

### Named Rules
**The Ficha Oficial Rule.** Marcadores seguem a ficha de papel: caixa vazia, "/" superficial, X agravado com o mesmo traço, bolinhas para traços, trilha de 10 segmentos para Humanidade. Não substitua por barras de progresso, porcentagens ou ícones.

## Do's and Don'ts

### Do:
- **Do** partir de um componente shadcn para todo controle de interface (botão, campo, aba, alerta, separador).
- **Do** usar só passos inteiros do Tailwind (múltiplos de 4px) para espaçamento e tamanhos.
- **Do** usar só `text-xs`, `text-sm`, `text-base`, `text-xl`, `text-2xl`, `text-4xl` e `text-display`.
- **Do** usar cores e fontes por token do tema; bordas de 1px ou 2px.
- **Do** manter a serifa no logotipo, no nome do Personagem e nos títulos de seção, e Jost em todo o resto.
- **Do** desenhar dano agravado como o "/" do superficial mais o traço oposto, com o mesmo tamanho e traço.
- **Do** manter a faixa de estado presa e o topo da Ficha aquecendo com a Fome (0 a 5).
- **Do** dar a todo marcador tocável uma área de pelo menos 40×48px e anel de foco vinho.
- **Do** escrever rótulos neutros em PT-BR com os termos oficiais do V5.

### Don't:
- **Don't** usar meios passos (`p-1.5`, `gap-2.5`) nem valores arbitrários `[...]` no código do projeto.
- **Don't** usar `text-lg` nem `text-3xl`.
- **Don't** escrever hex ou cores fixas do Tailwind em classes.
- **Don't** usar Alegreya SC em rótulos, números, botões ou abas.
- **Don't** usar o rosa-fome fora do numeral da Fome, nem uma segunda cor de estado além do vinho.
- **Don't** empilhar cartões com sombra nem trocar marcadores da ficha por barras de progresso.
- **Don't** usar superfícies claras: o mundo é escuro para a mesa à meia-luz.
- **Don't** depender só de cor para estados críticos (agravado, Fome alta, Compulsão): forma ou texto acompanham.
