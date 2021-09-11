# API da rede social

### TDD
Para executar os testes automatizados é preciso ter o jest instalado de forma global. Após isso, execute o comando abaixo:

```shell
npm run test
```

### Servidor   
Para executar o backend é preciso configurar o arquivo .env.example, renomeando para .env, e então você poderá alterar os valores para a sua preferência.

Também será preciso iniciar o mongodb, no meu caso, estou usando na minha máquina e portanto preciso abrir o Prompt de comando como administrador e rodar o seguinte comando

```shell
net start mongodb
```

A saida deverá ser algo como

> O serviço de MongoDB Server (MongoDB) está sendo iniciado..
> O serviço de MongoDB Server (MongoDB) foi iniciado com êxito.

Com o mongodb iniciado, para iniciar o servidor você precisa executar o seguinte comando
```shell
node src/server.js
```


# Documentação parcial.
## Endpoints   
### <img src="images/post.png" height="18"> - /user

Permite o cadastro de um usuário, para que ele possa ter acesso as demais rotas.

#### Parâmetros Json   
**name**: Nome do usuário
**email**: Email do usuário
**password**:Senha do usuário

Exemplo:
```json
{
    "name":"usuario",
    "email":"usuario@email.com",
    "password":"senha"
}
```

#### Parâmetros Url   
Nenhum

#### Respostas
##### 200 - OK
Retorna o id do usuário recém cadastrado, o e-mail dele e um Bearer Token JWT. Use esse token para acessar as demais rotas da API.

Exemplo de retorno
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    "email": "usuaris@email.com",
    "id": "6112c9d62111445eb013da5b"
}
```

##### 400 - Entrada faltante ou existente
Alguma entrada não foi informada, como o email, o password ou o e-mail já está cadastrado

##### 500 - Erro no servidor
Algum erro no banco de dados ou na geração do hash com o bcrypt.



-------------------------------------------

### <img src="images/post.png" height="18"> - /auth

Realiza o login na API, para permitir o uso do token para acessar as demais rotas.

#### Parâmetros Json   
**email**: Email de um usuário cadastrado no sistema
**password**: Senha do usuário cadastrado no sistema

Exemplo:
```json
{
    "email":"user@email.com",
    "password":"123abc"
}
```

#### Parâmetros Url   
Nenhum

#### Respostas
##### 200 - OK
Retorna um token JWT que pode ser usado como "Bearer Token". Use esse token para acessar as demais rotas da API.

Exemplo de retorno
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    "id": "6112bc91009864224c992ee2"
}
```

##### 400 - Entrada faltante   
Alguma entrada não foi informada, como o email ou o password.

##### 403 - Senha inválida
Senha inválida

##### 404 - Email não cadastrado
Email não cadastrado na base de dados

--------------

### <img src="images/get.png" height="18"> - /users

Retorna a listagem de todos os usuários

#### Parâmetros Json
Nenhum

#### Parâmetros Url
Nenhum

#### Autorização
Precisa de um token bearer válido e gerado pela API para funcionar.

#### Respostas   
##### 200 – OK   
Listagem de todos os usuários do sistema

Exemplo de retorno
```json
[
    {
        "_id": "6112bca1009864224c992ee6",
        "name": "julia castro",
        "email": "julia"
    },
    {
        "_id": "6112ce6907e0a253744a7073",
        "name": "usuario",
        "email": "usuariso@emaail.com"
    }
]
```

##### 403 - Token inválido
Token inválido ou expirado.

----------------

### <img src="images/get.png" height="18"> - /user/:id

Retorna a um usuário pelo ID

#### Parâmetros Json
Nenhum

#### Parâmetros Url
**id**: Valor numérico que representa o id de um usuário na API
Exemplo:
```url
http://127.0.0.1:3333/user/6111a771806c464fd4bcd5eb
```

#### Autorização
Precisa de um token bearer válido e gerado pela API para funcionar.


#### Respostas
##### 200 - OK
Listagem de um usuário

Exemplo de retorno
```json
[
    {
        "_id": "6112c8dd2111445eb013da2e",
        "name": "julia",
        "email": "julia"
    }
]
```
##### 403 - Falha na autenticação
Token inválido ou expirado.

##### 404 - Usuário não cadastrado
Usuário não encontrado

##### 500 - Id inválido      
Id é inválido

-------


### <img src="images/get.png" height="18"> - /me

Obter dados de si mesmo

#### Parâmetros Json
Nenhum

#### Parâmetros Url
```url
http://127.0.0.1:3333/me
```

#### Autorização
Precisa de um token bearer válido e gerado pela API para funcionar.


#### Respostas
##### 200 - OK
Dados do proprio usuário

Exemplo de retorno
```json
{
    "_id": "6112d0bae5002a1c4cbce9af",
    "name": "user",
    "email": "user@email.com"
}
```
##### 403 - Falha na autenticação
Token inválido ou expirado.

##### 404 - Usuário não cadastrado
Usuário não encontrado na base de dados

-------

### <img src="images/put.png" height="18"> - /user/:id
Edita um usuário pelo ID. O token do usuário precisa ser válido pela API e conter o proprio id do usuário.

#### Parâmetros Json
**name**: O novo nome do usuário
**password**: A senha do usuário, caso seja nula ou vazia ela não será alterada.

Exemplo
```json
{
    "name": "Novo nome",
    "password": "Nova senha"
}
```

#### Parâmetros Url
**id**: Valor numérico que representa o id de um usuário existente na API
Exemplo:
```url
http://127.0.0.1:3333/user/2
```

#### Autorização
Precisa de um token bearer válido e gerado pela API para funcionar.


#### Respostas
##### 200 - OK
Os dados alterados na API

Exemplo de retorno
```json
{
    "_id": "6112d0bae5002a1c4cbce9af",
    "name": "emailNovo",
    "email": "email@email.com",
    "password": "$2b$10$ALiTPRVZslIU//4cmlnjpuZhrrYxGZhiiGXfQW.JbAaCiJ/eY9Jce",
    "__v": 0
}
```

##### 400 - Entrada faltante
O nome novo não foi informado

##### 403 - Falha na autenticação
Token inválido ou um usuário tentou editar outro (Mesmo que o outro não exista)

--------------------
### <img src="images/delete.png" height="18"> - /user/:id


1. Não implementado ainda
2. Documetação de postagem a desenvolver....
