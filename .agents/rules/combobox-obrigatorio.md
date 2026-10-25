---
description: Regra obrigatória sobre uso exclusivo do formato novo de Combobox em vez de select nativo
globs: ["src/**/*.tsx"]
---

# Regra: Proibição de `<select>` Nativo e Uso do Formato Novo de Combobox

1. **PROIBIDO `<select>` nativo**:
   - É terminantemente proibido inserir tags `<select>` HTML no código.
   - Qualquer necessidade de seleção em telas do Narrador, telas do Jogador ou modais deve usar os componentes padronizados do projeto.

2. **Formato Novo de Combobox**:
   - O padrão do projeto é o **Combobox com input direto** (`PopoverAnchor` + `CommandPrimitive.Input` + `ChevronsUpDown`).
   - O usuário deve poder clicar ou focar no campo e digitar imediatamente para filtrar as opções com `casaBusca` (sem acento, case-insensitive).
   - Ao fechar ou desfocar, exibe o valor selecionado (ou contagem).

3. **Componentes Oficiais**:
   - Seleção única: `<Combobox />` importado de `#/components/combobox`.
   - Seleção múltipla: `<SelectMultiplo />` importado de `#/components/ui/select-multiplo`.
