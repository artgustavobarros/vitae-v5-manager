# Umbra

Gerenciador de fichas de Vampiro: A Máscara 5ª Edição. Leia antes de mudar comportamento:

- `GLOSSARY.md`: vocabulário do domínio. Use esses termos no código e na interface.
- `docs/escopo-v1.md`: decisões confirmadas da v1.
- `docs/adr/`: decisões de arquitetura.

## Convenções

- UI é shadcn first: todo componente de interface começa de um componente shadcn (`pnpm dlx shadcn@latest add <nome>`). Não escreva `<button>`, `<input>`, `<select>` ou cartões em Tailwind cru quando existir equivalente shadcn. Use os tokens do tema (`bg-background`, `text-muted-foreground`), não cores fixas do Tailwind.
- Todo select é combobox (shadcn Popover + Command) com busca ao digitar, que ignora acento e caixa e casa também o nome original em inglês.
- Régua de design (classes Tailwind, nunca valores arbitrários `[...]` no nosso código):
  - Espaçamento e tamanhos: só passos inteiros do Tailwind (múltiplos de 4px). Sem meios passos (`p-1.5`, `gap-2.5`).
  - Fontes: só `text-xs`, `text-sm`, `text-base`, `text-xl`, `text-2xl`, `text-4xl` e `text-display` (40/44). Sem `text-lg` e `text-3xl`.
  - Cores e fontes só por token do tema (`bg-background`, `text-vinho`, `font-serif`), nunca hex na classe.
  - Bordas: `border` (1px) ou `border-2` (2px).
  - Serifa (`font-serif`) só no logotipo, no nome do Personagem e em títulos de seção.
- Glifos da ficha oficial: dano superficial é `/`; dano agravado é o mesmo `/` mais o traço oposto, formando `X` do mesmo tamanho (`src/components/ficha/marcadores.tsx`).
- Regras do domínio ficam em `src/domain/` como TypeScript puro e testado. Server functions em `src/server/` só validam entrada, checam permissão e chamam o domínio.
- Interface e termos do domínio em PT-BR.

## Comandos

- `docker compose up -d`: Postgres de dev (porta 5434).
- `pnpm dev`: app em http://localhost:3005.
- `pnpm test` e `pnpm typecheck`.
- `pnpm db:generate --name <nome>` e `pnpm db:migrate`: migrations do Drizzle.
