# Conjunto de antagonistas V5 em JSON: Craft

Verificado em 31/10/2026, após ampliar a pesquisa para Reddit e web. Esta nota complementa a [pesquisa principal](pesquisa-bestiario-v5.md).

## Resultado verificado

O projeto comunitário **V5 Vampire: The Masquerade**, de **GooseGooseDuck**, contém **22 antagonistas**. A página pública do [pacote](https://www.craftrpgs.com/discover/packages/019f8a0a-7203-7598-86d4-f490ed6b34e1) lista as entradas; o [projeto](https://www.craftrpgs.com/discover/projects/v5-vampire-the-masquerade) e o [capítulo sobre antagonistas](https://www.craftrpgs.com/discover/projects/v5-vampire-the-masquerade?chapter=antagonists&view=builder-manual) explicam a organização.

**Foi possível obter os 22 registros completos em JSON pela API pública, sem conta.** A inspeção dos registros encontrou dois formatos:

| Formato efetivamente encontrado | Quantidade | Viabilidade para o Vitae |
| --- | --- | --- |
| Três paradas gerais + Vitalidade + Força de Vontade + Paradas Excepcionais | 14 | Estrutura diretamente mapeável ao Modelo atual; revisar valores, Especiais e tradução antes de incluir. |
| Atributos e Habilidades + recursos e Disciplinas | 8 | Exigem uma decisão de simplificação; não existe conversão única fornecida pelo arquivo para as três paradas gerais. |

Os 22 têm Vitalidade e Força de Vontade preenchidas. As contagens acima foram calculadas sobre os arquivos baixados, não apenas sobre o anúncio do site. O manual descreve um formato geral, mas não garante que cada registro tenha todas as paradas simplificadas: oito realmente não têm esses campos.

## Inventário completo

As sugestões em português abaixo são **propostas para revisão**, exceto **Carniçal**, cujo termo já foi confirmado no Companion oficial brasileiro. Não foi encontrada tradução oficial brasileira desse pacote comunitário.

| Nome original | Nome proposto em PT-BR | Categoria do arquivo | Formato |
| --- | --- | --- | --- |
| Anarch Revolutionary | Revolucionário Anarquista | vampire | Atributos e Habilidades |
| Bat (Large) | Morcego grande | animal | Simplificado |
| Bear | Urso | animal | Simplificado |
| Bird of Prey | Ave de rapina | animal | Simplificado |
| Bloodthirsty Sheriff | Xerife sanguinário | vampire | Atributos e Habilidades |
| Clergy | Clérigo | mortal | Simplificado |
| Elysium Harpy | Harpia do Elísio | vampire | Atributos e Habilidades |
| Faerie | Fada | creature | Atributos e Habilidades |
| Faith Hunter | Caçador da fé | mortal | Simplificado |
| Gangster | Criminoso | mortal | Simplificado |
| Ghoul | Carniçal | ghoul | Simplificado |
| Guard Dog | Cão de guarda | animal | Simplificado |
| Horse | Cavalo | animal | Simplificado |
| Inquisitor Delta | Inquisidor Delta | mortal | Simplificado |
| Inquisitor Investigator | Investigador da Inquisição | mortal | Simplificado |
| Magician | Mago | creature | Atributos e Habilidades |
| Noddist Bishop | Bispo nodista | vampire | Atributos e Habilidades |
| Police Detective | Detetive de polícia | mortal | Simplificado |
| Rat | Rato | animal | Simplificado |
| Spectre | Espectro | creature | Atributos e Habilidades |
| Wight | Criatura | vampire | Atributos e Habilidades |
| Wolf | Lobo | animal | Simplificado |

Totais: **7 animais, 6 mortais, 1 carniçal, 5 vampiros e 3 outras criaturas**. Não há uma entrada Werewolf/Lobisomem nesse conjunto de 22, mesmo que o manual mencione categorias sobrenaturais mais amplas.

## Obtenção dos arquivos

O site carrega os registros por rotas de leitura pública. A inspeção dos arquivos JavaScript públicos identificou o mesmo método utilizado pelo compêndio da própria página:

- Lista: `https://api.craftrpgs.com/api/files/public/compendium?containerId=01a0825d-14f5-7df8-aeae-6fb6fbfdec58&fileTypeId=01a0825d-14fc-79a0-a417-fd17a3563d6b&offset=0`
- Ficha: `https://api.craftrpgs.com/api/files/public/<id>`.
- Exemplo público: [Bird of Prey em JSON](https://api.craftrpgs.com/api/files/public/01a0825d-1925-7d4c-a8f8-ebafb3924090).

Na requisição de leitura foram enviados `User-Agent: Mozilla/5.0`, `Origin: https://www.craftrpgs.com` e `Referer: https://www.craftrpgs.com/`. Sem esses cabeçalhos, a tentativa inicial recebeu 403; com eles, a API pública respondeu com os dados, sem autenticação. A lista retornou os 22 registros e `nextOffset: null`.

O conteúdo de cada ficha está em `currentVersion.content`. Foram salvos arquivos temporários, sem integração com a aplicação:

- `/tmp/vitae-antagonistas-craft.json`: as 22 fichas obtidas, com origem e conteúdo.
- `/tmp/vitae-antagonistas-craft-dados.json`: versão de trabalho com os dados mecânicos e a fonte de cada entrada, removendo imagens e descrições narrativas. Os valores mecânicos não foram alterados.

Esses caminhos são temporários. As URLs e o inventário acima permitem repetir a obtenção; disponibilidade futura não é garantida. A API é observada na aplicação pública, sem promessa de estabilidade pelo fornecedor.

## Mapeamento para o Modelo do Vitae

| Campo da fonte | Campo do Vitae |
| --- | --- |
| `name` | `nome`, após revisão da tradução |
| `category` | `categoria`, em PT-BR |
| `standardDicePools.physical/social/mental` | `paradaFisico`, `paradaSocial`, `paradaMental` |
| `secondaryAttributes.health/willpower` | `vitalidade`, `vontade` |
| `exceptionalDicePools` | `paradasExcepcionais`, após traduzir as chaves |
| `specialAbilities` e `disciplines` | `especiais` ou `notas`, com revisão |

O Bestiário agora mantém os dois formatos: os 14 simplificados usam as paradas gerais; os oito completos preservam Atributos, Habilidades e Disciplinas individuais, sem conversão automática. Todos continuam sujeitos à aprovação do Narrador.

O pacote é comunitário e não teve todos os seus valores confrontados com os livros. A interface exibe o rótulo “Licensed”, mas esta pesquisa não verificou quais direitos esse rótulo representa; não o tratar como certificação de fidelidade às regras ou de tradução oficial. O objetivo é usar os dados como candidatos revisáveis, com origem preservada.

## Planilha do Reddit que não atende à importação

O tópico [A database for NPC?](https://www.reddit.com/r/WhiteWolfRPG/comments/13hh0jf/a_database_for_npc/) aponta para **VAMPIRE 5E NPC Stat Breakdown**, de Eunomiac. A [própria planilha](https://docs.google.com/spreadsheets/d/1-z9ennwIKnqvBRBPb0J-m2wUazUWyzl1syANONjSqrA/edit) explica que fornece distribuições de pontos e estimativas de XP, sem identificar quais características receberam cada valor. Portanto, não é um conjunto de fichas prontas para o nosso Bestiário. A indicação no Reddit foi seguida até a fonte para confirmar essa limitação.

## Implementação dos dois formatos

Os oito registros com Atributos e Habilidades agora entram como Ficha Completa de Antagonista, preservando os valores do JSON. Atributos/Habilidades ausentes não viram paradas gerais. Nenhum poder individual é escolhido a partir do nível da Disciplina; as escolhas continuam com o Narrador. Humanidade zero da Criatura é preservada, e recursos ausentes ficam vazios. A Fada mantém Carisma 7 e a Habilidade Empatia que aparece no arquivo, com aviso para revisão da nomenclatura.

A inspeção recursiva do conteúdo dos 22 registros não encontrou campos de livro, página ou citação. A aprovação liga cada Modelo inicial ao seu registro público no Craft e informa essa ausência. Para os 15 mortais de Groulien, o link aponta para a página correspondente do PDF (1, 2 ou 3); são fichas criadas pelo autor, não fichas oficiais atribuídas a um livro. Os dois Carniçais preexistentes no banco local não têm procedência registrada e não herdam a fonte do Modelo inicial só por terem o mesmo nome.

O Narrador forneceu um recorte em português com o título **Criatura**, confirmando o nome para Wight e os valores do Modelo. A Habilidade dessa ficha aparece como **Empatia com Animais** e foi ajustada conforme a imagem. O recorte não identifica livro/página; não foi atribuída uma referência bibliográfica por suposição.
