# API da rede social

### Serviços
#### Configuração do .env
Será preciso uma conta no mongodb atlas e o uso de pelo menos a camada gratuita do Google Buckets.

| Item | Descrição | Exemplo |
|------|-----------|---------|
| DB_MONGO_URI | É preciso configurar o arquivo .env, para isso será preciso obter uma URI do mongodb | mongodb+srv://dbNameRedeSocial:yourPassword@cluster0.4oubv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority |
| JWT_SECRET | Segredo do JWT | QUALQUER COISA ALEATORIA COMO CHAVE |
| GCLOUD_STORAGE_BUCKET | Nome de um bucket no Google | myBucketName |
| GCLOUD_PROJECT_ID | Projeto no Google Console | project-music-1234500 |

Faça funcionar no local.


## Configurtação do buckets do Google

https://console.cloud.google.com/cloud-resource-manager?folder=&organizationId=0&hl=pt-br
Crie um projeto

1. Crie um novo projeto No console.cloud.google.com. Depois de criado, espere um pouco e depois atualize a página
![](images/tutorial/001.png)

2. Volte na página inicial e você verá algo parecido com isso
![](images/tutorial/002.png)

3. Na barra superior de busca, procure pelo 'Cloud Storage'
![](images/tutorial/003.png)

4. Crie um bucket
![](images/tutorial/004.png)

5. De um nome ao Bucket
![](images/tutorial/005.png)

6. Pode mentar as opções padrões
![](images/tutorial/006.png)

7. Continue com as opções padrões
![](images/tutorial/007.png)

9. Desative a opção para aplicar prevenção a acesso publico ao bucket
![](images/tutorial/009.png)

10 - Mantenha as opções conforme abaixo
![](images/tutorial/010.png)




11 - Com o bucket criado, clique em 'Intervalos' e depois no bucket, clique nos três pontinhos e escolha a opção Editar Permissões do bucket
![](images/tutorial/011.png)

12. Adicione um principal, vamos tornar o acesso ao bucket publico
![](images/tutorial/012.png)

13 - Clique no campo, escolha a opção Cloud Storage, Leitor de objetos do storage e por fim a opção leitor de objetos do storage
![](images/tutorial/013.png)

14 - Confirme a opção
![](images/tutorial/015.png)

15 - Agora vamos obter as credenciais para acessar e manipularmos o bucket. Faça a busca por API Credenciais
![](images/tutorial/016.png)

16 - Crie uma credencial como conta do serviço
![](images/tutorial/017.png)

17 - Escolha o nome da conta de serviço
![](images/tutorial/018.png)

18 - Escolha a opção cloud storage, administrador do storage.
![](images/tutorial/019.png)

8. Pode deixar tudo em branco
![](images/tutorial/008.png)










19 - Conta criada, clique nela
![](images/tutorial/020.png)

20 - Clique em adicionar a chaves
![](images/tutorial/021.png)

21 - Crie uma chave
![](images/tutorial/022.png)

22 - Escolha a chave como Json
![](images/tutorial/023.png)

23 - Faça o download da chave json, e preencha os campos, salvando no arquivo 'google-credentials.json'.
![](images/tutorial/024.png)

24 - O arquivo deverá ficar +- assim, obviamente com os campos preenchidos.
![](images/tutorial/25.png)

25 - Preencha o arquivo .env, por enquanto somente os dois campos referentes ao Google Storage (Poject ID encontra no Json, e o Storage Bucket é o nome do bucket que você criou)
```
GCLOUD_PROJECT_ID
GCLOUD_STORAGE_BUCKET
```

## Deploy no heroku
1. Faça o deply da aplicação
2. É preciso configuar todas as variáveis de ambientes, igual no arquivo .env no heroku. (Settings > Reveal Config Vars)
3. Adicione a variável de GOOGLE_APPLICATION_CREDENTIALS, mantendo esses valores exatos.
> Você precisa estar no repositório que está vinculado ao deploy no heroku
```
heroku login
heroku config:set GOOGLE_APPLICATION_CREDENTIALS='google-credentials.json'
```

4. Adicione o buildpack no nodejs (Se o buildpack já existir na aplicação, ok, sem panico, tudo certo!)
```
heroku buildpacks:set heroku/nodejs
```

5. Adicione o buildpack do buyersight como indice 1, na frente do buildpack do nodejs
```
heroku buildpacks:add --index 1 https://github.com/buyersight/heroku-google-application-credentials-buildpack
```

6. Adicione a variável de ambiente 'GOOGLE_CREDENTIALS', informando todas as credenciais do Google (Aquela que você fez o download e salvou no arquivo 'google-credentials.json')
```
{
  "type": "...",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

7. Refaça o deploy (git push, uma simples modificação na aplicação e um git push)

### TDD 
Para executar os testes automatizados é preciso ter o jest instalado de forma global. Após isso, execute o comando abaixo:
  
```shell
npm run test
```



### Configuração do bucket
Crie um arquivo chamado bucket-config.json, você deverá colocar os dados de uma chave do seu google bucket como json.

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
