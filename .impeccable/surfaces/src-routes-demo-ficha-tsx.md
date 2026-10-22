---
version: 1
slug: "src-routes-demo-ficha-tsx"
primary_target: "src/routes/demo/ficha.tsx"
related_targets: ["src/components/ficha"]
---

# Ficha do Personagem (celular)

Modo: Operate. Usuário: Jogador na mesa presencial, meia-luz, celular na mão entre falas; Narrador abre a mesma Ficha no celular ou notebook. Tarefa: ler e marcar dano, Fome e Manchas em um toque; consultar Atributos, Habilidades, Disciplinas e Notas. Restrições: termos oficiais do V5 em PT-BR, glifos da ficha oficial, shadcn first, régua de 4px e escala tipográfica fechada (ver CLAUDE.md).

## Direction contract

THESIS: A Ficha é uma página escura e literária em que o estado do Personagem vive no topo e a Fome aquece o fundo. Recusa o padrão da categoria: cartões empilhados com barras de progresso e acento vermelho.

OWN-WORLD: Grafite tingido de ameixa (#141215 / #1c191d, linhas #2e2930), tinta clara #f1edf0, secundário #a69ea6; vinho #c0304e como única cor de estado, rosa-fome #ff7d95 só no número da Fome. Serifa Alegreya SC só no nome do Personagem, no logotipo e nos títulos de seção; Jost em todo o resto. Linhas finas no lugar de cartões. Glifos da ficha oficial: caixa vazia, "/" superficial, "X" agravado (mesmo traço), bolinhas de pontos, trilha de Humanidade em 10 segmentos.

STORY: O Jogador abre a Ficha e lê em um segundo quanto dano tem, a Fome e a Humanidade; toca uma caixa ou bolinha para marcar e volta para a cena. Entende que a Ficha é a oficial, bem feita, e confia que o Narrador vê o mesmo.

FIRST VIEWPORT: Topo em degradê vinho→grafite cuja intensidade segue a Fome (0 a 5): cabeçalho com "Umbra" em serifa e a Coterie; nome do Personagem em serifa display 40/44; linha de clã, Geração e Potência; horizonte de Humanidade com Manchas; três linhas de 48px com Vitalidade, Força de Vontade e Fome, rótulo à esquerda e marcadores tocáveis à direita. Abaixo, alerta de Compulsão Ativa quando houver; abas sublinhadas em vinho (Atributos, Habilidades, Disciplinas, Notas); títulos de grupo em serifa e linhas de traço com bolinhas.

FORM: Combinação do usuário das minhas candidatas convencionais 1 (Grafite e Vinho: app escuro moderno) e 2 (Noite Azulada: estrutura literária com serifa), escolhida na rodada de registro "mais seguro". Movimento-assinatura: o topo aquece com a Fome. seed: 0df87a213a050621

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
