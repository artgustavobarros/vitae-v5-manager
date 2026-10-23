# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Narrador**: conduz uma única Crônica presencial de Vampiro: A Máscara 5ª Edição. Administra o site, vê e edita todas as Fichas, cria PdNs, libera Fichas para evolução, gerencia Coteries, conduz Combates e faz Sorteios durante a sessão.
- **Jogadores**: poucos, convidados pelo Narrador. Usam o celular na mesa para acompanhar e marcar o estado do próprio Personagem (dano, Fome, Manchas) e, fora da sessão, criar e evoluir Personagens.

## Product Purpose

Substituir a ficha de papel e o PDF preenchível da mesa por um site em que cada Jogador controla a própria Ficha, sob regras do V5 aplicadas automaticamente, e o Narrador acompanha o estado de todos em tempo real. O sucesso é a mesa jogar uma sessão inteira sem papel e sem perguntar "quanto de Fome você está?".

## Positioning

Feito para uma mesa só, presencial, com o Narrador no controle: a evolução acontece quando o Narrador libera a Ficha (não há XP), a Condição de cada Personagem pode ser compartilhada com a Coterie e o Narrador tem painel ao vivo, Combate e Sorteios das tabelas do V5 num botão.

## Operating Context

- Sessões presenciais à noite, com **luz baixa de propósito** para o clima. Telas claras incomodam e quebram a ambientação.
- Jogadores usam o celular na mesa, entre falas e rolagens de dados físicos. As interações durante a cena precisam ser rápidas e de baixo risco.
- Hoje a mesa usa a **ficha de papel oficial** e o **PDF preenchível**. Os Jogadores já conhecem a organização da ficha oficial: pontos em bolinhas, caixas de Vitalidade e Força de Vontade com dano superficial e agravado, trilha de Humanidade com Manchas.
- O Narrador alterna entre o painel de todos os Personagens, o Combate e as Fichas individuais.

## Capabilities and Constraints

- Escopo e regras confirmados em `docs/escopo-v1.md`; vocabulário em `GLOSSARY.md`.
- Interface somente em PT-BR, com os termos da tradução oficial. Conteúdo só em inglês recebe tradução livre com o nome original entre parênteses.
- Nenhum texto dos livros é reproduzido: o Catálogo guarda nomes, números, referências de página e descrições curtas escritas pelo projeto.
- Sem modo offline, sem XP, sem rolagem de dados para Jogadores e sem retrato na v1.
- Componentes de interface partem do shadcn/ui.

## Brand Commitments

- Nome: **Umbra**.
- Voz: **neutra e clara**. Rótulos e mensagens diretos com os termos oficiais do V5; o clima do jogo fica no visual, não nas frases.
- Não usar "Vampiro: A Máscara" nem "Masquerade" como marca do produto.

## Evidence on Hand

- Nenhum logo, ilustração ou foto existe ainda. Arte oficial dos livros não pode ser usada.

## Product Principles

1. A mesa vem primeiro: durante a cena, qualquer marcação comum se faz em um toque, sem tirar a atenção do jogo.
2. A ficha que eles já conhecem: a organização e os marcadores seguem a ficha oficial, para ninguém reaprender.
3. O Narrador decide: o sistema bloqueia o impossível para o Jogador, mas nunca para o Narrador.
4. Privacidade por padrão: o que é de um Jogador só aparece para os outros quando ele escolhe compartilhar.

## Accessibility & Inclusion

- Uso em ambiente escuro: evitar superfícies muito claras e brilho excessivo, mantendo contraste legível (WCAG AA).
- Estados críticos (dano agravado, Fome alta, Compulsão Ativa) não podem depender só de cor.
