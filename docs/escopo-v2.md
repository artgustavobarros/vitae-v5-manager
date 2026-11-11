# Escopo da v2

A Crônica pode ser conduzida inteiramente pelo Narrador, sem exigir contas ou ações dos Jogadores. As Fichas existentes e os acessos autenticados da v1 são preservados. A primeira entrega separa o controle do Narrador da exibição coletiva de Combate e Relógios.

## Primeira entrega: exibição da mesa

| Recurso | Controle autenticado | Exibição sem login |
| --- | --- | --- |
| Combate | `/narrador/combate` | `/publico/<token>/combate` |
| Relógios | `/narrador/relogios` | `/publico/<token>/relogios` |

- Os caminhos anteriores `/combate` e `/relogios` continuam atendendo Jogadores autenticados. Para o Narrador, redirecionam ao respectivo controle.
- O botão **Visão pública**, presente nos dois controles, abre a geração do link. Abrir o diálogo não gera nem substitui um link.
- Um único link da Crônica autoriza as duas exibições. A pessoa alterna entre Combate e Relógios pela navegação pública.
- Só o Narrador gera e revoga o link. Gerar outro invalida o anterior. Não há vencimento automático nesta entrega.
- O token tem 256 bits aleatórios. O banco guarda somente seu hash SHA-256; o endereço original fica disponível no diálogo que o gerou até o recarregamento da página. Para recuperá-lo depois, é necessário gerar outro.
- Quem tiver o link pode ler a exibição. Ele não dá acesso a Fichas, contas, Modelos, controles ou alterações.
- Abrir a exibição na mesma sessão do Narrador não concede privilégios adicionais. A rota pública não carrega a sessão autenticada.
- As respostas não são armazenadas em cache, não enviam o endereço como referência e pedem aos buscadores que não indexem a exibição.

## Informações exibidas

### Combate

- Rodada, ordem dos participantes ativos, turno atual e próximo participante.
- Inimigos incapacitados aparecem depois da ordem ativa, identificados como fora de Combate.
- Nas visões do Narrador e do público, os participantes ativos aparecem em cards estreitos num carrossel com arraste, setas e teclado. A faixa acompanha a troca de turno.
- O Narrador conserva os controles dos cards; a alça de reordenação e os botões de mover alteram a ordem, enquanto arrastar o corpo do card apenas navega na faixa.
- Nomes, identificação de Personagem de Jogador/PdN/Inimigo, estados de saúde e condições narrativas.
- A Vitalidade de Inimigos só aparece quando o Narrador usa a opção existente de revelar. Paradas, poderes, Especiais, Força de Vontade e notas dos Inimigos não são enviados.
- Em cada card de Personagem, o Narrador escolhe mostrar ou ocultar a Condição (Vitalidade, Força de Vontade e Fome) para todos no Combate. A escolha vale para a exibição pública e os Jogadores autenticados, incluindo PdNs.
- A divulgação começa desligada e fica salva por participante durante aquele Combate. A autorização não concede acesso à Ficha nem edição. Ocultar novamente retira os valores dos próximos snapshots públicos.
- O compartilhamento por Coterie da v1 continua independente: não autoriza divulgação pelo link coletivo. Na visão autenticada, o dono e quem já tem acesso pela Coterie conservam seus acessos.
- Não existem ações de marcar dano, concluir turno ou editar na exibição.

### Relógios

- Apenas Relógios visíveis, com descrição, etapas, tendência e Efeitos ativos.
- Efeitos futuros e textos de desativação não são antecipados no carregamento.
- Os avisos de ativação e desativação chegam quando a transição acontece, inclusive com a exibição aberta no Combate.
- Relógios ocultos e seus avisos não são enviados à exibição pública.

## Atualização e revogação

- O controle e a exibição leem o mesmo estado persistido; não há cópia independente do Combate ou dos Relógios.
- Um SSE exclusivo da exibição transmite somente invalidações sanitizadas e avisos de Relógios públicos. Não transmite notificações pessoais.
- O link é validado em cada consulta, antes de enviar eventos e a cada ping de 20 segundos. Gerar ou revogar o link também avisa as conexões abertas para encerrá-las.
- Na revogação, a exibição é substituída por “Exibição indisponível”. Informações que alguém já viu não podem ser apagadas desse aparelho remotamente.
- Reconectar consulta o estado atual, sem reproduzir avisos perdidos durante a desconexão. Enquanto reconecta, a tela sinaliza que os dados podem estar desatualizados.
- Há um limite de 20 conexões públicas simultâneas por processo. O barramento continua usando a arquitetura de processo único da v1.

## Próximo recorte da v2

- Tornar explícita a classificação e a administração dos Personagens pelo Narrador, sem inferir o papel pela conta proprietária.
- Manter o estado de preparação (Rascunho/Ativo/Arquivado) separado do papel narrativo.
- Definir o vínculo entre Personagens e os Modelos de Antagonistas existentes antes de unificar classificações.

Esses pontos ainda não alteram o domínio nesta primeira entrega.

## Implantação

Aplicar a migration `0027_link-publico.sql` com `pnpm db:migrate` antes de disponibilizar as novas rotas. Ela adiciona apenas a tabela de controle do link, sem mudar Fichas ou contas existentes.
