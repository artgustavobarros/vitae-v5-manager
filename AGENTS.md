# Vitae - Diretrizes do Projeto

Gerenciador de fichas de Vampiro: A Máscara 5ª Edição.

Antes de mudar comportamento, leia `GLOSSARY.md`, `docs/escopo-v1.md` e as decisões em `docs/adr/`.

## Interface

- Todo componente de UI começa por um componente shadcn. Não use HTML ou Tailwind cru para botões, campos, seletores ou cartões quando existir equivalente no design system.
- Nunca use a tag HTML `<select>` ou menus improvisados.
- Seletores simples usam `Combobox` (`src/components/combobox.tsx`), com input direto, busca imediata, `ChevronsUpDown`, Popover e Command.
- Seletores múltiplos usam `SelectMultiplo` (`src/components/ui/select-multiplo.tsx`), com busca direta, checkboxes customizados, ações em lote e contagem dos selecionados.
- Use tokens do tema (`bg-background`, `text-muted-foreground`, `text-vinho`), nunca cores hexadecimais ou valores arbitrários de Tailwind (`[...]`).
- Espaçamentos e tamanhos usam passos inteiros do Tailwind, múltiplos de 4 px. Fontes: `text-xs`, `text-sm`, `text-base`, `text-xl`, `text-2xl`, `text-4xl` e `text-display`. Bordas: `border` ou `border-2`.
- Use `font-serif` só no logotipo, no nome do Personagem e em títulos de seção.
- Na Ficha, dano superficial é `/`; dano agravado é `/` mais o traço oposto, formando `X` do mesmo tamanho. Veja `src/components/ficha/marcadores.tsx`.

## Domínio e backend

- Regras do domínio ficam em `src/domain/` como TypeScript puro, com testes automatizados via Vitest.
- Server functions em `src/server/` validam entrada, checam permissões e chamam o domínio.
- Use no código e na interface os termos de `GLOSSARY.md`. A interface e os termos do domínio ficam em PT-BR.

## Comandos

- `docker compose up -d`: Postgres de desenvolvimento na porta 5434.
- `pnpm dev`: app em http://localhost:3005.
- `pnpm test` e `pnpm typecheck`.
- `pnpm db:generate --name <nome>` e `pnpm db:migrate`: migrations do Drizzle.
- `pnpm skills:install`: reinstala as skills listadas em `skills-lock.json`.
