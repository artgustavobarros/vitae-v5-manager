# Sincronização das marcas da Ficha sem bloquear o toque

Para minimizar a latência percebida, a tela da Ficha aplica dano, Fome e Manchas imediatamente, usa TanStack Query no transporte e no cache e mantém uma fila explícita por conta em IndexedDB. A fila persiste cada operação antes do envio, inclusive enquanto a requisição está em andamento; persistir somente mutations pausadas não protegeria uma resposta perdida ou o descarte da página nesse intervalo.

O servidor compara os valores anteriores dos campos alterados sob bloqueio da linha, permitindo mudanças independentes sem sobrescrever mudanças concorrentes. Cada operação tem um identificador imutável: Ficha, recibo e notificações são gravados na mesma transação, e uma repetição devolve o resultado original. Uma revisão monotônica, incrementada por trigger em qualquer alteração da Ficha, impede que respostas e consultas antigas substituam confirmações mais recentes no cliente.

O serviço pertence à conta e permanece ativo entre telas. O provedor autenticado fica dentro da rota raiz, após carregar a sessão; o envio e o SSE começam quando a tela hidrata. Conflitos bloqueiam a cadeia daquele Personagem até o descarte explícito das pendências. Esta primeira entrega abrange as marcações na tela da Ficha; Painéis, Combate e os demais formulários mantêm seus fluxos atuais.

Durante a leitura inicial do IndexedDB, novos toques são aplicados como intenções em memória. A operação definitiva, com identificador, base e posição na fila, só é criada depois de recuperar as pendências anteriores. Até concluir a gravação local, a interface mantém a indicação de salvamento; uma falha de leitura conserva os toques em memória e avisa para manter a página aberta. Operações já persistidas não são reescritas, pois outra aba pode já tê-las enviado.

Operações e confirmações são lidas na mesma transação do IndexedDB. Se a fila local mudar enquanto uma leitura aguarda resposta, seu snapshot é descartado e a leitura é repetida. Assim, um carregamento atrasado não reinsere uma operação já confirmada ou descartada.
