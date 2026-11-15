# Vitae

O Vitae é um gerenciador de fichas para **Vampiro: A Máscara 5ª Edição**. Ele organiza uma única Crônica presencial: o Narrador administra o jogo e os Jogadores acompanham as visões públicas pelo celular.

## Para a mesa

- **Narrador:** administra Personagens e Fichas, acompanha Condições em tempo real e conduz Combates.
- **Jogador:** consulta Combate e Relógios pelo link público, sem conta e sem editar dados.

O Vitae apoia a mesa durante a sessão. Ele não substitui a conversa presencial nem automatiza a rolagem de dados.

## O que o Vitae reúne

- **Fichas de Personagem:** atributos, habilidades, Disciplinas, recursos e informações narrativas. Só o Narrador edita e evolui a Ficha.
- **Painel:** acompanhamento da Condição dos Personagens Ativos e PdNs fixados.
- **Paradas:** referência de ações com título, Atributo + Habilidade e categoria, sem selecionar Personagem, calcular totais ou rolar dados.
- **Combate:** ordem de turnos manual, Rodadas, Personagens, PdNs e Inimigos criados a partir de Modelos da lista de Antagonistas.
- **Antagonistas e Sorteios:** ferramentas privadas do Narrador para preparar antagonistas e consultar Ressonâncias, Discrasias e Compulsões.
- **Atualizações em tempo real:** painéis e visões públicas acompanham mudanças via SSE. Sem notificações ou alertas automáticos.

## Modelo de uso

Cada instalação atende uma Crônica e um Narrador. Só o e-mail configurado em `NARRADOR_EMAIL` entra na área interna, exclusivamente com Google, inclusive em desenvolvimento. O Narrador administra todos os Personagens e escolhe o que revelar no link público. Contas antigas são preservadas, mas não concedem acesso interno aos Jogadores.

O uso principal é em celular, com interface em português brasileiro. O Vitae requer conexão: não oferece modo offline.

## Escopo

O projeto segue o [escopo da v2](docs/escopo-v2.md): operação exclusiva do Narrador e exibição pública somente leitura. Evolução acontece diretamente na Ficha, sem XP. O Combate tem ordem de turnos manual. Loresheets e retratos ficam fora do escopo.

## Projeto

O app é um monólito em TypeScript: interface e backend usam TanStack Start; PostgreSQL persiste os dados; Drizzle gerencia o esquema e as migrations. Regras do domínio ficam em `src/domain/`, separadas das funções de servidor em `src/server/`. Os painéis recebem atualizações em tempo real via SSE.

## Testes

Instale o Chromium de testes uma vez com `pnpm exec playwright install chromium` (em CI Linux, use `pnpm exec playwright install --with-deps chromium`).

Use um `DATABASE_URL` de testes isolado: os testes de servidor alteram dados e alguns limpam tabelas inteiras. Nunca execute a suíte contra o banco da Crônica.

`pnpm test` executa a suíte completa, incluindo as regressões do Combate e das telas de acesso em Chromium nas larguras de celular e desktop. Para executar somente as interações no navegador, use `pnpm test:browser`. Os testes de navegador usam dados fictícios e substituem as chamadas ao servidor; não acessam a Crônica nem o banco.

## Documentação

Para adicionar os 40 Modelos iniciais de Antagonistas, execute `pnpm antagonistas:povoar` após aplicar as migrations existentes. A carga preserva Modelos e edições existentes e pode ser repetida sem duplicar suas entradas. As fontes comunitárias e os nomes originais ficam nos documentos de pesquisa. A revisão inicial foi encerrada: os candidatos recusados não fazem parte da carga e ficam fora de Antagonistas e do seletor do Combate. As antigas URLs de aprovação redirecionam para Antagonistas.

- [Glossário do domínio](GLOSSARY.md): termos usados pela interface e pelo código.
- [Escopo da v2](docs/escopo-v2.md): decisões de produto e limites atuais; a v1 permanece como histórico.
- [Documentos das fatias](docs/): detalhes de fichas, catálogo, criação, combate e Sorteios.
- [Decisões de arquitetura](docs/adr/): registros das decisões técnicas.
