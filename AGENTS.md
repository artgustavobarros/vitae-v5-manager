# Vitae - Diretrizes para Agentes

Gerenciador de fichas de Vampiro: A Máscara 5ª Edição.

## Regras Obrigatórias de Interface (UI)

### 1. Regra Estrita de Selects/Combobox (PROIBIDO `<select>` nativo)
- **Nunca use a tag HTML `<select>`** nem menus improvisados.
- **Seletores Simples**: use sempre `Combobox` (`src/components/combobox.tsx`) no formato novo (trigger com input direto para digitação e busca imediata, `ChevronsUpDown`, Popover + Command).
- **Seletores Múltiplos**: use sempre `SelectMultiplo` (`src/components/ui/select-multiplo.tsx`), que herda o mesmo formato novo de Combobox (input direto para busca, `ChevronsUpDown`, listagem via cmdk com checkboxes customizados, botões de ação em lote e contagem dos selecionados).
- Não crie dropdowns sem busca instantânea ao digitar.

### 2. Padrões Shadcn & Tailwind
- UI é shadcn first: componentes começam a partir do design system do shadcn.
- Use sempre os tokens do tema (`bg-background`, `text-muted-foreground`, `text-vinho`), nunca cores hexadecimais arbitrárias nas classes.
- Espaçamentos e tamanhos em passos inteiros do Tailwind (múltiplos de 4px).
- Fontes padronizadas: `text-xs`, `text-sm`, `text-base`, `text-xl`, `text-2xl`, `text-4xl`, `text-display`.

## Regras de Domínio e Backend
- O domínio reside em `src/domain/` como TypeScript puro e com testes automatizados (`vitest`).
- Server functions em `src/server/` validam permissões de usuário e invocam o domínio.
- Nomes e terminologias seguem estritamente o `GLOSSARY.md`.
