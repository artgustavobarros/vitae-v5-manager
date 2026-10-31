# Bestiário V5: traduções oficiais em português

Pesquisa realizada em 31/10/2026. Complementa `docs/pesquisa-bestiario-v5.md`.

## Resultado principal

O **Companion / Guia Suplementar oficial da Galápagos**, gratuito e em PT-BR, contém dois Modelos de antagonistas do próprio V5: **Szlachta**, na página 22, e **Vozhd**, na página 23. Os nomes foram mantidos na edição brasileira. É a fonte mais direta encontrada para começar com criaturas que já têm ficha simplificada e tradução oficial.

Fonte primária: [página oficial de materiais de Vampiro](https://vampiro.mundogalapagos.com.br/materiaisCronicas). O botão de download do Companion leva a [este ZIP oficial](https://vampiromundogalapagos.wpcomstaging.com/wp-content/uploads/2021/10/Material2-Companion-28102021.zip), cujo download foi verificado. Dentro dele existe um PDF de 5.280.055 bytes, com o nome `Vampiro - A Máscara - Companion (Guia Suplementar) - Oficial Galápagos.pdf`.

O [calendário oficial](https://vampiro.mundogalapagos.com.br/calendario) registra o lançamento brasileiro do Guia Suplementar em 29/10/2021. Não é necessário depender de cópia publicada por terceiros para obter esse arquivo.

## Traduções confirmadas no material publicado

| Original / conceito | Nome brasileiro confirmado | Evidência | Uso no Bestiário |
| --- | --- | --- | --- |
| Szlachta | Szlachta | Companion PT-BR, p. 22 | Modelo pronto no formato simplificado do V5. |
| Vozhd | Vozhd | Companion PT-BR, p. 23 | Modelo pronto no formato simplificado do V5. |
| Ghoul | Carniçal; plural Carniçais | Companion PT-BR, seção da p. 49; também anunciado com esse nome na página oficial de materiais | Nome confirmado; a seção de criação de personagem não equivale, por si só, a um único Modelo de antagonista. |
| Mortal | Mortal; plural Mortais | Companion PT-BR, seção da p. 41 | Categoria confirmada; é preciso escolher um arquétipo e conferir sua ficha de antagonista. |

Todas as referências de página da tabela acima são da edição brasileira inspecionada, obtida pelo [ZIP oficial](https://vampiromundogalapagos.wpcomstaging.com/wp-content/uploads/2021/10/Material2-Companion-28102021.zip). As páginas 22 e 23 também correspondem às posições 22 e 23 do PDF. Na implementação, a política do projeto continua sendo registrar a referência de página da edição inglesa; essa equivalência deve ser conferida no original.

### Compatibilidade com o formato do Vitae

As fichas de Szlachta e Vozhd têm as três paradas gerais, Vitalidade, Força de Vontade, Paradas Excepcionais, Disciplinas e um campo Especial. A estrutura geral corresponde ao Modelo descrito em `GLOSSARY.md` e `docs/escopo-v1.md`, mas há um impedimento na validação atual: **Vozhd tem parada Social 0**, enquanto `src/domain/bestiario.ts` exige pelo menos 1. Uma inclusão fiel precisa permitir esse zero, sem alterar o número do livro. Szlachta também deixa uma Habilidade especializada e dois poderes de nível 1 para escolha; não é uma ficha com todas as escolhas fechadas. Disciplinas precisam ser acomodadas nos Especiais ou nas notas, pois o Modelo não tem campo próprio para elas. Essa adequação é uma avaliação do projeto, baseada na leitura das duas fichas; não é uma declaração de integração feita pela editora.

No Vitae, usar os termos já definidos pelo projeto: **Físico, Social, Mental**, **Paradas Excepcionais** e **Especial**. O livro usa algumas formas mais longas e plurais. Preservar os termos do domínio não altera os valores das fichas.

## Nomes encontrados em divulgação oficial

O [Spoilerboard oficial da Asmodee](https://www.portal.asmodee.com.br/spoilerboard), consultado em 31/10/2026, usa os títulos **Lobisomem: O Apocalipse** e **Caçador: A Revanche**, inclusive em anúncios de suplementos. Isso confirma esses nomes na comunicação da editora. Não confirma, sozinho, a redação, as regras ou os valores das fichas de antagonistas chamadas *Werewolf* e *Hunter* no livro básico de V5.

| Original | Nome disponível | Estado para esta pesquisa |
| --- | --- | --- |
| Werewolf | Lobisomem | Termo confirmado em título oficial da linha; nome da ficha específica do V5 ainda não conferido em amostra oficial. |
| Hunter | Caçador | Termo confirmado em título oficial da linha; nome da ficha específica do V5 ainda não conferido em amostra oficial. |

Os jogos da mesma família não devem ser tratados como se trouxessem automaticamente a mesma ficha. Um antagonista de V5 e um personagem de Lobisomem ou Caçador podem exigir regras e campos diferentes. Para começar, priorizar fichas explicitamente publicadas para V5.

## Traduções ainda não confirmadas

Não foi localizada nesta busca uma fonte primária brasileira pública que permita confirmar a tradução da ficha específica de **Wight**, **Wraith**, **Spectre**, **Ghost**, **Zombie** ou de cada animal. A falta de uma fonte localizada não prova ausência de tradução publicada.

| Original | Proposta para revisão | Pendência |
| --- | --- | --- |
| Wight | Criatura | Nome e valores conferidos no recorte em português fornecido pelo Narrador. Livro e página não identificados no recorte. |
| Wraith | Aparição (*Wraith*) | Tradução proposta nesta pesquisa; não validada em material oficial brasileiro do V5. |
| Spectre | Espectro (*Spectre*) | Tradução proposta; preservar distinção em relação a Wraith e Ghost. |
| Ghost | Fantasma (*Ghost*) | Tradução proposta; conferir se a fonte trata o termo como categoria genérica ou criatura específica. |
| Zombie | Zumbi (*Zombie*) | Tradução proposta; conferir fonte e regras da ficha. |

Para os animais, usar o nome original e revisar caso a caso. Traduções de nomes de animais em pacotes comunitários podem ajudar, mas não demonstram que a editora empregou o mesmo nome.

## Como aproveitar os achados

1. Começar por **Szlachta** e **Vozhd**, com referência ao Companion e descrições curtas escritas pelo projeto.
2. Confrontar os demais arquivos encontrados no GitHub com sua fonte de V5 e a edição brasileira correspondente.
3. Registrar nome original, nome proposto, fonte e estado da revisão para cada tradução pendente, conforme a política de Catálogo do projeto.

Esta pesquisa só adiciona referências. Não altera o Bestiário, o Catálogo nem o glossário. O PDF oficial foi examinado em arquivo temporário; não foi incorporado ao repositório. Disponibilidade gratuita do PDF não deve ser confundida com uma licença aberta de republicação integral.
