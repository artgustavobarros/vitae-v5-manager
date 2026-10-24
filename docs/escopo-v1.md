# Escopo da v1

Decisões confirmadas na sessão de definição de 2026-10-21. Os termos seguem o `GLOSSARY.md`.

## Base

- Uma única Crônica, jogada presencialmente, com uso principal no celular.
- Interface somente em PT-BR. Sem modo offline.
- Um único Narrador, que entra com Google.
- Jogadores entram por Convite para a Crônica:
  - é um link só para a mesa, que o Narrador envia como quiser; não precisa de e-mail;
  - quem tiver o link cria conta como Jogador, quantas pessoas forem;
  - "Gerar novo link" faz o anterior parar de valer, para quando o link vazar;
  - pelo link, a pessoa cria conta com nome de usuário e senha, ou entra com Google; com Google, o nome começa com os dois primeiros nomes da conta;
  - sem link, ninguém cria conta. A tela de entrar só serve a quem já tem conta.
- O Narrador remove da Crônica quem não é da mesa: a conta é apagada.
- Uma página de configurações deixa a pessoa trocar o nome (também com Google), o nome de usuário e a senha. Não há recuperação de senha por e-mail: o Narrador gera uma senha nova para o Jogador.
- Stack: ver `docs/adr/0001-monolito-tanstack-start-postgres-vps.md`. Tempo real via SSE.

## Personagens e Fichas

- Ciclo: Rascunho → Ativo → Arquivado. Não há aprovação do Narrador: o Personagem vira Ativo quando a criação é concluída, e a Ficha fica bloqueada.
- O Jogador cria seus próprios Personagens quando quiser, quantos quiser, e só apaga Rascunhos. Só o Narrador arquiva e reativa.
- Personagem atribuído:
  - o Narrador pode criar um Rascunho e atribuí-lo a um Jogador, um por vez;
  - o Jogador vê o Rascunho numa seção "Esperando você" no topo de Meus Personagens, pode abrir a Ficha para leitura e aceita ou recusa;
  - se aceitar, o Rascunho passa a ser dele; se recusar, volta a ser só do Narrador;
  - enquanto espera, o Narrador continua editando e pode cancelar a atribuição;
  - um Rascunho atribuído não pode ser concluído.
- A criação guiada aplica as regras do V5 e bloqueia escolhas inválidas para o Jogador. O Narrador cria PdNs pela mesma criação guiada.
- Já no wizard da fatia 2, a regra de Clã e Geração (Sangue-Ralo da 14ª à 16ª Geração; os demais clãs até a 13ª) vale para o Jogador. O Narrador cria sem validação.
- Durante a criação, cada valor mostra sua origem (distribuição, clã, Tipo de Predador). Depois de concluída, a Ficha mostra só o valor final.
- Até a criação guiada existir (fatia 5), Jogador e Narrador criam Personagens por um formulário manual provisório, sem validação do V5.
- O Tipo de Predador aplica os bônus automaticamente. O Jogador escolhe quando o livro oferece opções.
- Não há XP. A evolução acontece pela Ficha Liberada:
  - o Narrador libera a Ficha inteira;
  - o Jogador edita dentro dos limites do V5 (máx. 5 pontos, poder ≤ nível da Disciplina, amálgamas, Potência do Sangue ≤ teto da Geração);
  - as mudanças valem na hora;
  - o Narrador fecha a liberação manualmente e revisa o registro de mudanças.
- Com a Ficha bloqueada, o Jogador altera sozinho apenas o dano (Vitalidade e Força de Vontade), a Fome e as Manchas. Humanidade só muda com a Ficha Liberada ou pelo Narrador.
- Valores Derivados são calculados automaticamente: Vitalidade, Força de Vontade e efeitos da Potência do Sangue. Só o Narrador os sobrescreve.
- A Ficha guarda:
  - poderes de Disciplina individualmente;
  - Rituais, Cerimônias e Fórmulas, escolhidos do Catálogo e validados por nível;
  - Vantagens e Defeitos do Catálogo (7 e 2 pontos na criação);
  - campos narrativos: Seita, Senhor, Geração, Ambição, Desejo, Convicções com Pedras de Toque, Aparência e História.

  A Ficha não tem retrato.
- Notas: só o Jogador escreve. O Narrador lê, exceto as Notas marcadas como privadas.

## Narrador

- O Narrador vê e edita todas as Fichas, e suas edições ignoram a validação.
- PdNs:
  - o Narrador pode criar PdNs com Ficha completa;
  - o Narrador pode converter qualquer Personagem de Jogador em PdN;
  - na conversão, o Jogador perde o acesso e as Notas privadas são apagadas;
  - um PdN nunca vira Personagem de Jogador.
- Quando um Jogador é removido da Crônica, os Personagens Ativos dele viram PdNs e os Rascunhos passam a ser Rascunhos do Narrador.
- Opções de criação da Crônica, definidas pelo Narrador:
  - idades permitidas;
  - Sangue-Ralo e Caitiff;
  - clãs permitidos.

  Padrão: Neófito, todos os clãs e sem Sangue-Ralo.

## Coteries

- O Narrador cria, edita e apaga Coteries. Um Personagem pode estar em várias.
- A Coterie tem Nome, Conceito/Descrição, Domínio (Caça, Abrigo e Porte de 0 a 5 cada) e lista de membros. O Tipo de Coterie e Vantagens e Defeitos compartilhados vêm do Catálogo.
- A página da Coterie é acessível pelo Narrador e pelos Jogadores que têm Personagem nela.
- A Coterie Padrão nasce com a Crônica e não pode ser apagada. O Narrador escolhe quais Personagens entram nela; nenhum entra automaticamente.
- Convite de Coterie:
  - o convite é feito para um Personagem;
  - o Jogador aceita ou recusa;
  - o convite fica pendente sem prazo, e o Narrador pode cancelá-lo.
- O Jogador pode sair de qualquer Coterie.
- O Narrador:
  - adiciona PdNs diretamente;
  - expulsa membros;
  - ao apagar uma Coterie, deixa os membros sem ela.
- O Personagem Arquivado sai de todas as Coteries. O PdN convertido permanece nelas.
- O Jogador só enxerga as Coteries em que tem Personagem.
- Condição (Vitalidade + Força de Vontade + Fome):
  - um único botão de compartilhar por Personagem, tudo ou nada, desligado por padrão;
  - fica visível para Jogadores que dividem ao menos uma Coterie com o Personagem.

## Painéis

- Painel do Narrador: lista única de Personagens Ativos com as Coteries ao lado de cada nome, mais os PdNs fixados. Mostra Condição, Humanidade e Manchas, com atualização em tempo real.
- Tela do Jogador: lista única com os membros das Coteries dele. A Condição não compartilhada aparece como "oculto".
- A barra de filtro por Coterie aparece quando a pessoa enxerga 3 ou mais Coteries.

## Notificações

- Só dentro do site, com o site aberto: toast na hora e um sino com a lista. Chegam pelo mesmo tempo real (SSE) dos Painéis.
- Eventos que geram notificação para o Jogador:
  - Personagem atribuído a ele;
  - Convite de Coterie recebido;
  - Ficha Liberada e liberação fechada;
  - Combate iniciado com um Personagem dele na ordem de turnos;
  - Ressonância Atual ou Compulsão Ativa aplicada a um Personagem dele;
  - Personagem dele arquivado ou convertido em PdN;
  - Personagem dele removido de uma Coterie, inclusive quando a Coterie é apagada;
  - o Narrador editou a Ficha de um Personagem dele.
- Eventos que geram notificação para o Narrador:
  - conta nova criada pelo Convite para a Crônica;
  - Personagem concluído (Rascunho virou Ativo);
  - Personagem atribuído aceito ou recusado;
  - mudança feita pelo Jogador com a Ficha Liberada, uma por salvamento;
  - Convite de Coterie aceito ou recusado;
  - Personagem saiu de uma Coterie;
  - Mudança de Condição marcada por Jogador: Fome chega a 4 ou a 5; Vitalidade ou Força de Vontade fica toda preenchida (qualquer dano) ou toda curada.
- Cada marca de dano ou Fome não vira notificação: o Painel já mostra isso em tempo real.

## Combate

- O Bestiário é privado do Narrador e guarda Modelos com a ficha simplificada de antagonista do V5: paradas Físico, Social e Mental, paradas especiais, Vitalidade, Força de Vontade, Disciplinas e notas.
- No Combate entram:
  - Personagens;
  - PdNs;
  - Inimigos criados a partir de Modelos, cada um com Vitalidade e Força de Vontade próprias.
- A ordem de turnos é manual (arrastar), com destaque de quem está agindo e contador de Rodadas.
- Os Jogadores veem a ordem e os Inimigos. Veem a Vitalidade de um Inimigo só se o Narrador liberar.
- A Condição dos Personagens no Combate segue as mesmas regras de compartilhamento.
- Há um Combate ativo por vez, descartado ao encerrar.

## Sorteios

- O Narrador aperta um botão e recebe o resultado na hora, sem dados visíveis. Há três Sorteios:
  - **Ressonância**: sorteia tipo e intensidade. Se der Aguda, sorteia também a Discrasia.
  - **Discrasia avulsa**: por tipo de Ressonância escolhido ou de qualquer tipo.
  - **Compulsão**: geral ou de clã.
- O Narrador pode aplicar o resultado a um Personagem, que passa a ter Ressonância Atual ou Compulsão Ativa até o Narrador encerrar. Se não aplicar, só o Narrador vê.

## Catálogo

- Cobre todo livro que a VTM Wiki (vtm.paradoxwikis.com) cita como fonte, exceto as Loresheets. O que faltar na wiki vem dos PDFs do Narrador.
- Nomes seguem a edição brasileira quando existir; a referência de página é sempre da edição em inglês.
- Cada item tem nome, nível, pré-requisitos, custo, referência de página e uma descrição curta escrita pelo projeto. Nenhum texto do livro é copiado.
- Conteúdo só disponível em inglês é traduzido livremente, com o nome original entre parênteses.
- Toda tradução passa por uma página de revisão durante o desenvolvimento. A página mostra o original e a tradução proposta, e tem um campo para o Narrador sugerir uma tradução melhor.
- O Catálogo não é editável dentro do site.
- **Consulta rápida de regras**: tocar no nome de termos de regras (Atributos, Habilidades, Clãs, Disciplinas, Domínio da Coterie, poderes, etc.) abre uma folha no celular ou diálogo no desktop com descrições curtas e escala explicativa.

## Fora da v1

- XP.
- Rolagem de parada de dados para Jogadores.
- Modo offline.
- Notificação push no celular com o site fechado.
- Retrato do Personagem.
- Resumo dos Personagens dos outros Jogadores fora das Coteries.
- Loresheets.
