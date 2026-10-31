# Fontes para Modelos iniciais do Bestiário V5

Pesquisa em 31/10/2026. Objetivo: localizar arquivos públicos no GitHub que ajudem a criar Modelos de criaturas para o Vitae, verificar se são do V5 e procurar traduções oficiais brasileiras.

## Atualização: conjuntos encontrados fora do GitHub

A ampliação da busca para Reddit e web encontrou conjuntos com fichas preenchidas:

1. **Craft / GooseGooseDuck: 22 antagonistas em JSON**, todos acessados e baixados para inspeção. **14** têm as três paradas gerais, Vitalidade, Força de Vontade e Paradas Excepcionais; **8** usam Atributos e Habilidades e exigem uma escolha de simplificação para caber no Modelo atual. Inventário e método de obtenção: [pesquisa do conjunto Craft](pesquisa-antagonistas-craft.md).
2. **Groulien: 15 mortais em PDF**, com fichas simplificadas preenchidas. Há um campo caseiro para alimentação que deve ser tratado separadamente. Fonte criadora: [VtM5: Victim Cards](https://groulien.wordpress.com/2023/10/11/vtm5-victim-cards/).
3. Outras coleções verificadas, incluindo **cinco PdNs em PDF do Blank Bodies** e uma amostra de **Targets of the Hunt**, estão na [pesquisa de fontes comunitárias](pesquisa-antagonistas-comunidade.md).

A recomendação passa a ser avaliar primeiro os **14 registros simplificados do Craft** e os **15 mortais do Groulien**, mantendo Szlachta e Vozhd do Companion como fonte oficial brasileira já conferida. Os arquivos comunitários estão em inglês e ainda precisam de revisão das regras e dos nomes. Obter JSON estruturado confirma a viabilidade de extração; não confirma fidelidade de todos os valores ao livro nem tradução oficial.

As conclusões abaixo registram a busca inicial restrita principalmente ao GitHub. A ausência de um conjunto pronto naquela seleção não se aplica aos achados posteriores acima.

## Resultado e recomendação

A fonte mais útil encontrada foi o **Companion oficial da Galápagos em PT-BR**, fora do GitHub. Ele contém fichas simplificadas de **Szlachta**, p. 22, e **Vozhd**, p. 23. É possível começar por essas duas criaturas com nomes e regras já traduzidos oficialmente. O PDF foi baixado e inspecionado durante a pesquisa. [Página da editora](https://vampiro.mundogalapagos.com.br/materiaisCronicas) · [Download oficial do ZIP](https://vampiromundogalapagos.wpcomstaging.com/wp-content/uploads/2021/10/Material2-Companion-28102021.zip).

**Não foi encontrado, entre os repositórios e arquivos examinados, um bestiário V5 completo com criaturas e valores prontos para importar.** Foram encontrados arquivos de geração, localização, material narrativo e um bestiário de outra edição. A distinção abaixo evita apresentar um gerador aleatório ou uma ficha antiga como estatística publicada do V5.

Os detalhes da tradução, incluindo termos ainda não confirmados, estão em [Traduções oficiais](pesquisa-bestiario-traducoes-oficiais.md).

## Inclusão pontual do Sabá

O conjunto Craft/Groulien não cobre os antagonistas de **Sabá: A Mão Negra**. A busca posterior localizou o **Blood-Hound**, chamado **Sabujo de Sangue** pelo Narrador, com referência a *Sabbat: The Black Hand*, p. 34 da edição inglesa. Foi incluído como candidato pendente; isso não representa importação do restante do suplemento.

A [referência comunitária da ficha](https://whitewolf.fandom.com/wiki/Blood-Hound_%28Tzimisce_Ghoul%29) discrimina as edições e informa: Físico 5, Social 1, Mental 2, Vitalidade 6 e Força de Vontade 3. Paradas Excepcionais: Percepção para localizar Membros 6, Sobrevivência para rastrear Membros 6 e Furtividade 6. Potência 1 e mordida com dano +2; dificuldade geral 3/2. Esses valores também aparecem na reprodução consultada da página 34 do livro inglês. O Modelo conserva Potência 1 sem fixar um poder específico.

[Produto oficial da Renegade](https://renegadegamestudios.com/pdf-sabbat-the-black-hand-vampire-the-masquerade-roleplaying-game/). Não foi localizado um JSON desse livro nas coleções já baixadas. A terminologia em PT-BR continua sujeita à revisão do Narrador; a pesquisa não certifica uma tradução oficial obtida diretamente da editora. Fonte e página ficam neste documento, sem rótulos de origem no card.

## Arquivos encontrados no GitHub

### 1. Gerador de PdNs do V5: estrutura aproveitável

Repositório: [zsombro/vampire-npc-generator](https://github.com/zsombro/vampire-npc-generator). O [README](https://github.com/zsombro/vampire-npc-generator/blob/main/README.md) declara suporte à 5ª edição.

- [src/service/generator.service.ts](https://github.com/zsombro/vampire-npc-generator/blob/c04b7cb168a91594c0da4ae5a3ded70c67cf74f9/src/service/generator.service.ts): gera Vitalidade, Força de Vontade e paradas Físico, Social e Mental em três níveis de ameaça.
- [src/model/SPC.ts](https://github.com/zsombro/vampire-npc-generator/blob/c04b7cb168a91594c0da4ae5a3ded70c67cf74f9/src/model/SPC.ts): define os dois formatos de ficha simplificada usados pelo gerador.

**Uso possível:** referência de estrutura para criar Modelos próprios. **Limite:** não contém um catálogo de espécies nem fichas oficiais prontas. Os números são sorteados dentro de faixas do autor; não foram validados como equivalentes a criaturas publicadas. Não foi identificada uma licença no metadado do repositório consultado.

### 2. Foundry WoD5E: arquivos PT-BR e formato de antagonistas

Repositório: [WoD5E-Developers/wod5e](https://github.com/WoD5E-Developers/wod5e).

- [lang/pt-BR/core-pt-BR.json](https://github.com/WoD5E-Developers/wod5e/blob/c3cf665a15db289bff0f4fe6ef67ec1f4f36c544/lang/pt-BR/core-pt-BR.json): contém rótulos como Carniçal, Caçador, Mortal, Vampiro, Lobisomem e Vitalidade.
- [lang/pt-BR/vampire-pt-BR.json](https://github.com/WoD5E-Developers/wod5e/blob/c3cf665a15db289bff0f4fe6ef67ec1f4f36c544/lang/pt-BR/vampire-pt-BR.json): localização específica de Vampiro.

**Uso possível:** comparar termos e nomes de campos. **Limite:** tradução comunitária, sem confirmação de revisão pela editora. Não equivale a tradução oficial. O [README do projeto](https://github.com/WoD5E-Developers/wod5e/blob/c3cf665a15db289bff0f4fe6ef67ec1f4f36c544/README.md) informa que não fornece os materiais licenciados do WoD5E; a árvore consultada traz packs de macros e condições, sem um pack de criaturas. O código declara GPLv3; isso não estabelece uma licença aberta para textos dos livros.

### 3. Pacote de antagonistas em JSON: material narrativo

Arquivo: [vtm_antagonist_npc_pack.json](https://github.com/HannaLovvold/V-tM-Australia/blob/aea3961dd7faf9dae68086d7769f5152fe9d3bcf/V%3AtM%20Antagonist%20NPC%20Pack/vtm_antagonist_npc_pack.json), do repositório [HannaLovvold/V-tM-Australia](https://github.com/HannaLovvold/V-tM-Australia).

**Uso possível:** inspiração para antagonistas, com material sobre caçadores mortais, príncipes, coteries rivais e figuras do Sabá. **Limite:** o arquivo usa entradas de lorebook, com campos como `key`, `comment` e `content`; não é uma coleção de Modelos com nossas paradas e recursos numéricos. O próprio repositório se apresenta como prompts e lorebooks para uso com IA. Não há validação das regras como conteúdo oficial nem tradução oficial PT-BR identificada para esse pacote. Não foi identificada uma licença no metadado consultado.

## Resultados descartados como fonte direta de criaturas

| Fonte examinada | O que foi verificado | Decisão |
| --- | --- | --- |
| [EndreJordal/vtm-combat-tracker — js/data.js](https://github.com/EndreJordal/vtm-combat-tracker/blob/6fc69290165f15b5b556d9e2f46360546d5d3354/js/data.js) | Tem criaturas e animais, mas o comentário inicial identifica **Revised Edition**; usa regras e recursos dessa edição. | Não importar como V5. Exigiria conversão e validação próprias. |
| [Clownf1sh/vampire-the-masquerade-5e-compendium — module.json](https://github.com/Clownf1sh/vampire-the-masquerade-5e-compendium/blob/e0a46dabb99c82c21dc312002c5edf2a7fe375a3/module.json) | Os quatro packs declarados são clãs, Disciplinas, Potência do Sangue/Tipos de Predador e Vantagens/Defeitos, todos do tipo Item. | Não é bestiário. O fork de rodrigopssilva examinado tem a mesma organização de packs. |
| [Harbl/vtm5e-tools](https://github.com/Harbl/vtm5e-tools/tree/17d9907b1400bd19cb5c2e6fb433abac2fa83504) | Há módulos de ficha, automação e packs de regras/equipamento; não foi localizado pack de criaturas na árvore consultada. | Não resolve os Modelos iniciais. |
| [Musrha/foundry-vampire5th — data/actors.db](https://github.com/Musrha/foundry-vampire5th/blob/f143ec90986ba6b671fced2d6d592c933eebafaa/data/actors.db) | Quatro registros: templates e exemplos de Coterie e Personagem. | Não contém criaturas prontas. |
| [onkelwanya/spc-factory](https://github.com/onkelwanya/spc-factory/blob/181c323dfdfebd03792df8a4743aff81101d3db2/README.md) | Gera vampiros, carniçais e mortais usando uma API de IA. | Ferramenta de geração; não é um arquivo de criaturas verificadas. |

Também foi examinado [hoagsie/vtm/antagonists.md](https://github.com/hoagsie/vtm/blob/9a37063bd0535035134d0932b8291cb8c24cda19/antagonists.md). É uma página de referência com links e remissões, não uma coleção de fichas numéricas. A referência a `List_of_statblocks` não corresponde a um arquivo disponível na árvore examinada. Não foi usado como autoridade para valores ou traduções.

## Compatibilidade com o Vitae

O [Modelo atual](../src/domain/bestiario.ts) pede nome, categoria, três paradas gerais, Vitalidade, Força de Vontade, Paradas Excepcionais, Especiais e notas. As duas fichas do Companion usam essa estrutura geral, com duas ressalvas verificadas no PDF:

- **Vozhd tem parada Social 0.** O schema atual exige pelo menos 1 nas três paradas. Antes de importá-lo fielmente, será necessário permitir zero nesse campo; não substituir o valor por 1 silenciosamente.
- **Szlachta é um protótipo personalizável.** A ficha deixa a escolha de uma Habilidade especializada e de dois poderes de nível 1 em aberto. Um Modelo inicial deve preservar essa indicação ou registrar explicitamente as escolhas do Narrador.

Disciplinas não têm campo próprio no Modelo atual e precisam ser representadas nos Especiais ou nas notas, com detalhes suficientes para uso. Essa adequação de formato é uma avaliação da pesquisa, não uma integração oferecida pela editora.

Para uma futura inclusão, manter nome original, fonte e página; registrar a tradução como **oficial verificada** ou **proposta para revisão**. Não preencher valores ausentes com números inventados e atribuí-los ao livro. Descrições de Especiais podem ser redigidas pelo projeto, preservando a mecânica conferida na fonte.

Próxima entrega recomendada: dois Modelos iniciais, **Szlachta e Vozhd**, conferidos no Companion oficial PT-BR. Depois ampliar com fichas de V5 cuja origem e tradução possam ser verificadas individualmente.

Esta entrega adiciona apenas pesquisa. Não altera o Bestiário nem importa registros no banco. Os arquivos externos foram lidos para avaliação; o PDF oficial ficou em arquivo temporário e não foi incorporado ao repositório.
