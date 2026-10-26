# Vitae

O Vitae é um gerenciador de fichas para **Vampiro: A Máscara 5ª Edição**. Ele organiza uma única Crônica presencial: o Narrador administra o jogo e os Jogadores consultam e atualizam seus Personagens pelo celular.

## Para a mesa

- **Narrador:** administra Personagens e Fichas, organiza Coteries, acompanha Condições em tempo real e conduz Combates.
- **Jogador:** mantém as Fichas dos próprios Personagens, acompanha as Coteries de que participa e recebe Convites para a Crônica e para Coteries.

O Vitae apoia a mesa durante a sessão. Ele não substitui a conversa presencial nem automatiza a rolagem de dados.

## O que o Vitae reúne

- **Fichas de Personagem:** atributos, habilidades, Disciplinas, recursos e informações narrativas. O Narrador controla a edição; a Ficha Liberada permite evolução pelo Jogador.
- **Coteries e painéis:** organização de Personagens, convites e acompanhamento de Condição. O compartilhamento de Vitalidade, Força de Vontade e Fome é controlado por Personagem.
- **Paradas:** combinações padrão e personalizadas de Atributos e Habilidades, calculadas a partir da Ficha. A página consulta dados, mas não rola os dados.
- **Combate:** ordem de turnos manual, Rodadas, Personagens, PdNs e Inimigos criados a partir de Modelos do Bestiário.
- **Bestiário e Sorteios:** ferramentas privadas do Narrador para preparar antagonistas e consultar Ressonâncias, Discrasias e Compulsões.
- **Atualizações e notificações:** painéis acompanham mudanças em tempo real enquanto o site está aberto; notificações ficam no próprio site.

## Modelo de uso

Cada instalação atende uma Crônica e um Narrador. O Narrador convida Jogadores por um link da Crônica. Cada Personagem pertence a um Jogador ou é um PdN controlado pelo Narrador. Uma Ficha pode ficar bloqueada para proteger os valores definidos na mesa; o Jogador continua atualizando dano, Fome e Manchas.

O uso principal é em celular, com interface em português brasileiro. O Vitae requer conexão: não oferece modo offline nem notificações push quando o site está fechado.

## Escopo

O projeto segue o escopo da v1. Entre as escolhas de produto estão a evolução por Ficha Liberada, em vez de XP, e o Combate com ordem de turnos manual. Rolagens de dados para Jogadores, Loresheets e retratos de Personagem não fazem parte da v1.

## Projeto

O app é um monólito em TypeScript: interface e backend usam TanStack Start; PostgreSQL persiste os dados; Drizzle gerencia o esquema e as migrations. Regras do domínio ficam em `src/domain/`, separadas das funções de servidor em `src/server/`. Os painéis recebem atualizações em tempo real via SSE.

## Documentação

- [Glossário do domínio](GLOSSARY.md): termos usados pela interface e pelo código.
- [Escopo da v1](docs/escopo-v1.md): decisões de produto e limites do projeto.
- [Documentos das fatias](docs/): detalhes de fichas, Coteries, catálogo, criação, combate e Sorteios.
- [Decisões de arquitetura](docs/adr/): registros das decisões técnicas.
