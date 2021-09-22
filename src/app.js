require('dotenv/config');
const express = require('express');
const app = express()
const http = require("http");
const WebSocket = require("ws");

const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');
const UserController = require('./controllers/User');
const PostCommentController = require('./controllers/PostComment');
const PostController = require('./controllers/Post');
const MessageController = require('./controllers/Message');
const PostLikeController = require('./controllers/PostLike');
const PostShareController = require('./controllers/PostShare');
const userAuth = require('../src/middlewares/userAuth');
const cors = require('cors');
const { v4 } = require('uuid');
// Websockets
const server = http.createServer(app);
const websocketServer = new WebSocket.Server({ server });

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static('public'))
app.use(cors())

app.use('/', UserController)
app.use('/', PostController)
app.use('/', MessageController)
app.use('/', PostCommentController)
app.use('/', PostShareController)
app.use('/', PostLikeController)

mongoose.connect(
  process.env.DB_MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {}).catch(error => console.log(error))


// Armazena os sockets e os ids dos usuários
let sockets = {}

// Quando o usuário conectar ao socket
websocketServer.on("connection", (webSocketClient) => {

  // Gera um UUID
  let socketUuid = `${v4()}`

  // Atribui o socket do usuário com um UUID
  sockets[socketUuid] = {socket:webSocketClient, user:null}

  // Envia uma notificação ao usuário, indicando a conexão
  // e solicitando que ele envie uma mensagem informando o UUID dele
  webSocketClient.send(JSON.stringify({type:'connected', socketUuid}));

  // Quando o usuário se desconectar do socket
  webSocketClient.onclose = (event) => {
    // Loop pelos objeto sockets a fim de deletar o usuário que se desconectou
    Object.keys(sockets).forEach(item => {
      // Filtro baseado no objeto socket de cada usuário
      if (sockets[item].socket === webSocketClient) {
        delete sockets[item]
      }
    })
  }

  /*
  // Código apenas de exemplo, sem utilidade por enquanto
  // Ao receber uma mensagem do usuário
  webSocketClient.onmessage = (event) => {
    // Parse da mensagem
    let msg = JSON.parse(event.data);

    if(msg.type === 'NOVA_MENSAGEM') {
      webSocketClient.send(
        JSON.stringify({msg:'pa', type: 'NOVA_MENSAGEM'})
      )
    }
  }
  */ 
}); 

// Rota usada para o usuário informar o UUID do websocket que 
// pertence a ele e também para que essa a informação do ID do
// usuário seja salvo no objeto sockets
app.post('/connectSocket', userAuth, (req, res) => {
  let idUser = req.data.id
  let socketUuid = req.body.socketUuid

  // Atribui ao UUID do socket um usuário
  sockets[socketUuid].user = idUser
  return res.sendStatus(200)
})

// Envia uma mensagem a outro usuário conectado
app.post('/sendMessageUser', userAuth, (req, res) => {
  // Quem mandou, para quem mandou e qual foi a mensagem
  let to = req.body.to
  let from = req.body.from
  let message = req.body.message

  Object.keys(sockets).forEach(item => {
    // Usuário receptor da mensagem está conectado e com um socket atribuido
    if (sockets[item].user === to) {

      // Obter o socket deste usuário (destinatário) e enviar a mensagem
      // Isso forçará este usuário a buscar uma atualização nas mensagens
      sockets[item].socket.send(
        JSON.stringify({
          type:'RECIVE_MESSAGE',
          from,
          message
        })
      )
    }
  })

  res.sendStatus(200)
})

app.post('/validate', userAuth, (req, res) => {
  return res.sendStatus(200)
})

app.get('/', (req, res) => {
  res.send('API is Running')
})

app.delete('/user/:email', async (req, res) => {
  try {
    await User.deleteMany({email:req.params.email})
    return res.sendStatus(200)  
  } catch(error) {
    return res.sendStatus(200)
  }
})

app.delete('/image', async (req, res) => {
  try {
    await Post.deleteMany({test:true})
    return res.sendStatus(200)
  } catch(error) {
    return res.sendStatus(200)
}
})

module.exports = { app, mongoose, server };
