# Dificuldade Geral dos Antagonistas no V5

Pesquisa em 31/10/2026, restrita a **Vampiro: A Máscara 5ª edição**. Regras de V20, dos testes alfa e de Hunter não foram tratadas como regras de V5.

## Resultado

A Dificuldade Geral permite usar oposição estática no lugar de rolar os dados do antagonista. **Não foi encontrada uma fórmula oficial universal que transforme a ficha inteira no par de Dificuldades Gerais publicado nos suplementos.** As fontes consultadas apresentam valores de referência e métodos alternativos de resolver a oposição, não um cálculo pela soma ou média de Físico, Social e Mental.

## O que significa 4/3

**Regra oficial:** *Cults of the Blood Gods*, p. 15, seção **General Difficulties**, distingue o primeiro número, usado nas áreas em que o personagem se destaca, do segundo, usado nas demais áreas, onde ele é mediano ou pouco competente. Assim, `4/3` indica Dificuldade 4 na especialidade e 3 nos outros testes. A barra separa alternativas; não indica divisão matemática. A publicação também permite recorrer aos Atributos e Habilidades em vez dessa abstração. [Amostra oficial, página impressa 15; página 17 do PDF](https://d1vzi28wh99zvq.cloudfront.net/pdf_previews/336233-sample.pdf#page=17).

*Second Inquisition*, p. 13, relaciona esses valores aos Antagonistas Simples do livro básico, p. 370, e confirma a ordem: melhor capacidade antes da barra, outros testes depois. Referência bibliográfica conferida também na [transcrição pública consultada](https://pdfcoffee.com/vtm-v5-second-inquisition-2-pdf-free.html). Essa URL não é distribuição oficial do suplemento.

## Quais cálculos existem

| Situação | Operação | Limite da regra |
| --- | --- | --- |
| Substituir a rolagem oposta de um antagonista por dificuldade estática | `floor(parada correspondente / 2)` | Usa a parada específica daquela ação, não a ficha inteira. |
| Precisar de dados para um Antagonista Simples descrito por uma Dificuldade | `Dificuldade × 2` | Converte a abstração em parada; não explica como os autores escolheram o par publicado. |

**Regra oficial:** *Vampire: The Masquerade Corebook*, seção **Opposition**, p. 121, oferece alternativas: escolher pela tabela de dificuldades; usar metade da parada correspondente, arredondando para baixo; ou usar a Habilidade do alvo como Dificuldade. O mínimo 1 mencionado nesse último método pertence à alternativa da Habilidade. **Taking Half**, p. 123, é a referência do arredondamento. [Trecho indexado do livro básico, pp. 101–150](https://anyflip.com/agkyz/nyxm/basic/101-150). A abertura direta desse espelho retornou 403 nesta pesquisa; o texto estava disponível no índice de busca.

**Tradução oficial brasileira conferida:** o *Companion / Guia Suplementar* da Galápagos, p. 62 (também página 62 do PDF), traz a seção **Expandindo “Pegar a Metade”**. Ela confirma o uso de metade da parada como sucessos comuns automáticos e menciona o uso de Dificuldades fixas para os personagens do Narrador. O arredondamento para baixo da conversão de oposição foi conferido no livro básico, não inferido dessa passagem do Companion. [Página oficial de materiais](https://vampiro.mundogalapagos.com.br/materiaisCronicas) · [ZIP oficial com o PDF em PT-BR](https://vampiromundogalapagos.wpcomstaging.com/wp-content/uploads/2021/10/Material2-Companion-28102021.zip). Foi reutilizada a cópia oficial já obtida e documentada em `docs/pesquisa-bestiario-traducoes-oficiais.md`, sem importar texto do livro para o código.

**Regra oficial:** **Simple Antagonists**, livro básico, p. 370, permite obter a parada multiplicando a Dificuldade por dois. [Trecho indexado do capítulo de Antagonistas](https://anyflip.com/agkyz/nyxm/basic/351-400).

Exemplos de aplicação: uma parada específica de 7 dados fornece Dificuldade estática 3 pelo primeiro método; uma Dificuldade 3 fornece uma parada abstrata de 6 dados pelo segundo. **Inferência matemática:** as conversões não são inversas exatas para paradas ímpares. Elas não preservam toda a distribuição das rolagens, críticos ou outras nuances.

## Reddit e wikis

A discussão [General Difficulty?](https://www.reddit.com/r/vtm/comments/pz2ahs/general_difficulty/) surgiu especificamente sobre o suplemento do Sabá. As respostas distinguem especialidade de atividades comuns e corrigem a descrição do segundo valor como uma suposta fraqueza obrigatória. É confirmação comunitária, subordinada ao texto dos livros.

A [V5 Homebrew Wiki — Creating SPCs and Setting Difficulties](https://www.v5homebrew.com/wiki/Creating_SPCs_and_Setting_Difficulties) separa fichas simplificadas com paradas gerais, Dificuldades Gerais e Antagonistas Simples. Remete a *Cults of the Blood Gods*, p. 15, e ao livro básico, p. 370. Trata as Dificuldades Gerais como valores atribuídos pelo Narrador e apresenta a conversão de Dificuldade em dados. A wiki também comenta Hunter e probabilidades; esses comentários não foram elevados a regra oficial de V5.

A tentativa de consultar [Antagonists na wiki Paradox](https://vtm.paradoxwikis.com/Antagonists) retornou 401. Não foi possível confirmar conteúdo dessa página.

## GitHub: implementação concreta encontrada

O sistema comunitário de Foundry **WoD5E** guarda dois números independentes, `normal` e `strongest`, no [modelo de dados de antagonistas](https://github.com/WoD5E-Developers/wod5e/blob/c3cf665a15db289bff0f4fe6ef67ec1f4f36c544/system/actor/data-models/spc-actor-model.js). São campos numéricos armazenados, separados das paradas gerais e excepcionais.

A [ficha](https://github.com/WoD5E-Developers/wod5e/blob/c3cf665a15db289bff0f4fe6ef67ec1f4f36c544/system/actor/spc-actor-sheet.js) lê os valores existentes. O [template da Dificuldade Geral](https://github.com/WoD5E-Developers/wod5e/blob/c3cf665a15db289bff0f4fe6ef67ec1f4f36c544/display/shared/actors/parts/spc/generaldifficulty.hbs) oferece campos editáveis e botões que usam o dobro de cada valor para rolar. O [helper `x2`](https://github.com/WoD5E-Developers/wod5e/blob/c3cf665a15db289bff0f4fe6ef67ec1f4f36c544/system/scripts/helpers.js) multiplica o número por dois.

**Conclusão limitada ao código consultado:** essa implementação usa preenchimento independente dos dois valores e a conversão `Dificuldade × 2`. Nos arquivos e resultados de busca desse repositório, não apareceu derivação automática do par a partir das outras características. Isso é evidência de implementação comunitária, não uma nova regra oficial nem prova de ausência em todos os projetos do GitHub.

## Consequência para o Vitae

**Recomendação de implementação, ainda não executada:** preservar a Dificuldade Geral informada no livro e permitir edição independente pelo Narrador. Para uma ação específica, pode haver uma sugestão explícita de metade da parada correspondente, arredondada para baixo. Não recalcular nem substituir silenciosamente o par publicado pela média, soma, maior valor ou menor valor das características.

Esta pesquisa não alterou fichas, regras, schema, migrations ou dados do banco.
