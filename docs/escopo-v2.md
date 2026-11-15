# Escopo da v2

Escopo vigente: uma única Crônica presencial, administrada exclusivamente pelo Narrador. Este documento prevalece sobre o escopo histórico da v1.

## Acesso e administração

- Só o Narrador configurado entra na área interna, exclusivamente com Google.
- Jogadores não precisam de conta: consultam somente as visões públicas disponibilizadas pelo Narrador.
- Não há cadastro por convite, administração de contas de Jogadores, atribuição de Rascunhos ou acesso por proprietário.
- Contas antigas e suas Fichas permanecem armazenadas. Sessões de Jogadores são recusadas; o sistema não cria novas sessões para essas contas.
- O Narrador cria, edita, ativa, desativa e classifica os Personagens. Tipo de Personagem (Jogador/Não Jogador) é independente da Atividade e da conta legada.
- Rascunhos podem ser excluídos após confirmação. Ativação exige nome, sem validação de criação do V5.
- Catálogo, Paradas, Notas, Rolagens e Antagonistas são administrados pelo Narrador. Notas e Modelos não são públicos.

## Ferramentas retiradas

- Não há gestão de Coteries, vínculos, filtros ou inclusão de grupos no Combate.
- Não há tela nem API de configuração da Crônica. A idade de criação legada continua sendo lida para preservar o comportamento dos Rascunhos existentes.
- Paradas é uma referência independente de Personagens: título, Atributo + Habilidade e categoria para busca. Não exibe valores nem total de dados.

## Exibição pública

| Recurso | Controle autenticado | Exibição sem login |
| --- | --- | --- |
| Combate | `/combate` | `/publico/<token>/combate` |
| Relógios | `/relogios` | `/publico/<token>/relogios` |

- Os controles ficam em `/combate` e `/relogios`, com autenticação obrigatória. Os endereços antigos `/narrador/combate` e `/narrador/relogios` redirecionam para eles.
- O botão **Visão pública** abre o diálogo do link; abrir o diálogo não gera nem substitui o link.
- Um único link autoriza as duas exibições, com navegação entre elas.
- Só o Narrador gera e revoga o link. Gerar outro invalida o anterior; não há vencimento automático.
- O token tem 256 bits aleatórios. O banco guarda somente seu hash SHA-256; o endereço original só fica disponível no diálogo que o gerou até recarregar a página.
- O link permite apenas leitura. Não dá acesso a Fichas, contas, Modelos ou controles.
- A rota pública não carrega a sessão. Abri-la na sessão do Narrador não concede edição.
- As respostas não são armazenadas em cache, não enviam o endereço como referência e pedem aos buscadores que não indexem a exibição.

### Combate

- Exibe Rodada, ordem dos participantes ativos, turno atual e próximo participante.
- Participantes ativos aparecem em carrossel com arraste, setas e teclado; a faixa acompanha a troca de turno.
- Inimigos incapacitados aparecem após a ordem ativa, identificados como fora de Combate.
- Nomes, classificação, estados de saúde e condições narrativas são públicos.
- Personagens entram com a Condição visível por padrão. O Narrador pode ocultar ou revelar Vitalidade, Força de Vontade e Fome por participante.
- A escolha permanece durante o Combate. Ocultar retira os valores dos próximos snapshots, sem alterar a Ficha.
- Vitalidade de Inimigos começa oculta e só aparece com autorização do Narrador.
- Paradas, poderes, Especiais, Força de Vontade e notas de Inimigos não são enviados.
- Vínculos legados de dono ou Coterie nunca ampliam a divulgação.
- O público não marca dano, altera condições nem conclui turnos.

### Relógios

- Exibe apenas os Relógios visíveis, com título e etapas.
- O título público, quando preenchido, substitui o título interno também nos dados enviados.
- Só o Narrador cria, edita, move, oculta e retira Relógios.
- Zero e total não encerram nem retiram um Relógio; o valor não ultrapassa os limites.
- Descrição, perigo e Efeitos antigos permanecem armazenados, mas não aparecem nem disparam avisos.

## Atualização e feedback

- Não há notificações, sino, histórico ou alertas automáticos, inclusive de Relógios.
- Feedback de ações, erros e salvamento permanece na interface.
- SSE mantém as telas sincronizadas. A exibição pública recebe apenas invalidações sanitizadas, sem dados privados.
- O link é validado nas consultas, antes de enviar eventos e a cada ping de 20 segundos. Gerar ou revogar avisa as conexões abertas para encerrá-las.
- Na revogação, a exibição mostra “Exibição indisponível”. Informações já vistas não podem ser apagadas remotamente do aparelho.
- Reconectar consulta o estado atual. Durante a reconexão, a tela sinaliza possível desatualização.
- Há limite de 20 conexões públicas simultâneas por processo.
- A fila de marcações, IndexedDB, revisões e recibos idempotentes permanecem para proteger o salvamento do Narrador.

## Preservação de dados e implantação

- Esta limpeza não exige migration nem apaga contas, Fichas, membros ou histórico do banco.
- Tabelas legadas de convites e notificações, atribuição, Coteries e seus vínculos permanecem inativas, sem uso nos fluxos da aplicação. O registro legado da Crônica permanece somente para compatibilidade de criação.
- Instalações anteriores à exibição pública precisam da migration `0027_link-publico.sql` e das migrations posteriores já existentes.
