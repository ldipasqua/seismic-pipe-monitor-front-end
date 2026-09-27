# Seismic Pipe Monitor - Front-end

Este repositório contém o **front-end** da **API Seismic Pipe Monitor**, uma aplicação web desenvolvida para monitorar a interação entre pipelines e terremotos em tempo real e além disso, armazenar os dutos na base de dados com informações básicas: nome do duto, país, operadora, produto, coordenadas iniciais e coordenadas finais do duto.

Por meio desta interface, o usuário pode inserir um novo duto na base de dados, visualizar a trajetoria do duto no mapa e os terremotos ocorridos num raio de 1000 km a partir do ponto inicial do duto. Além disso, o usuário pode visualizar todos os dutos cadastrados na base de dados e editar as informações ou remover o duto da base de dados.

---

## Funcionalidades Principais

Com esta interface, o usuário é capaz de:
* **Inserir um novo duto** na base de dados;
* **Visualizar todos os dutos cadastrados** na base de dados;
* **Editar** as informações de um duto existente;
* **Remover** um duto existente;
* **Visualizar** a trajetoria do duto no mapa e os terremotos ocorridos num raio de 1000 km a partir do ponto inicial do duto.

---
## Arquitetura do Seismic Pipe Monitor
![Arquitetura do Seismic Pipe Monitor](/img/seismic-pipe-monitor-arquitetura.png)

---

## Como executar em modo desenvolvimento

Para o funcionamento correto da interface, é necessário executar primeiramente a **API Seismic Pipe Monitor** (back-end). O passo a passo completo da API também está descrito no repositório [`seismic-pipe-monitor-rest-api`](https://github.com/ldipasqua/seismic-pipe-monitor-api/blob/main/README.md).


Após iniciar o servidor da API, abra o arquivo `index.html` (localizado no diretório `seismic-pipe-monitor-front-end/src`) diretamente em seu navegador preferido.

## Como executar através do Docker

Certifique-se de ter o Docker instalado e em execução em sua máquina.

Navegue até o diretório que contém o Dockerfile no terminal e seus arquivos de aplicação e Execute como administrador o seguinte comando para construir a imagem Docker:

$ docker build -t nome_da_sua_imagem .

Uma vez criada a imagem, para executar o container basta executar, como administrador, seguinte o comando:

$ docker run -d -p 8080:80 nome_da_sua_imagem

Uma vez executando, para acessar o front-end, basta abrir o http://localhost:8080/#/ no navegador.

---

## Fluxo de Navegação e Uso da Interface

![Tela Inicial do Front-end](/img/img1.png)

Na página inicial, o usuário visualizará um dashboard ou painel composto por um mapa do lado izquerdo e um formulário do lado direito para inserir um duto na base de dados. Além disso, na parte inferior do dashboard existe uma tabela para visualizar os dutos já cadastrados, remover ou editar as informações de um duto existente.

![Tela Cadastrando um duto na base de dados](/img/img2.png)

O usuário pode cadastrar um novo duto inserindo as informações necessárias no formulário e clicando no botão "Adicionar duto". 

![Tela mostrando o duto e os terremotos ocorridos no mapa](/img/img3.png)

Logo depois de adicionar o duto na base de dados, o mapa mostrará a trajetoria do duto e os terremotos ocorridos nos últimos 15 dias num raio de 1000 km a partir do ponto inicial do duto.

![Tela mostrando a lista atualizada de dutos](/img/img4.png)

Também se atualizará a tabela na parte inferior com as informações do duto cadastrado.

![Tela mostrando o formulário de edição das informações do duto](/img/img5.png)

O usuário pode clicar no botão "Editar duto" para editar as informações do duto. Logo depois de clicar no butão vai abrir um formulário para que o usuário possa editar as informações do duto. O usuário pode clicar em "Cancelar" se deseja cancelar a edição do duto, ou pode preencher as informações do duto e clicar em "Salvar alterações" para salvar as alterações. Depois de clicar em "Salvar alterações" vai aparecer uma mensagem de sucesso e a tabela será atualizada com as alterações. 

![Tela mostrando a lista atualizada de dutos](/img/img6.png)

O usuário pode clicar no botão "Excluir" para excluir um duto da base de dados. Logo depois de clicar no butão "x" vai aparecer uma mensagem de confirmação.

![Tela mostrando a lista atualizada de dutos](/img/img7.png)

É importante esclarecer que nesse MVP não foi considerado a atualização automática do mapa logo depois de excluir o duto ou alterar as informações do duto. Isso será considerado em uma próxima versão.

![Tela mostrando a lista atualizada de dutos](/img/img8.png)


