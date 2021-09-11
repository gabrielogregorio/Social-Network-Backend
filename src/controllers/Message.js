const express = require('express');
const router = express.Router()
const userAuth = require('../middlewares/userAuth');
const { processId } = require('../util/textProcess');
const MessageService = require('../services/Message');


router.post('/message', userAuth, async (req, res) => {
  let from = processId(req.data.id)
  let to = processId(req.body.to)
  let message = req.body.message;
  let test = req.body.test;

  if (test == undefined) {
    test = false
  } else {
    test = true
  }

  if (from == undefined || to == undefined || message == undefined || message == '') {
    return res.sendStatus(400)
  }
 
  let newMessage = await MessageService.Create({message:message, from, to, test})
  return res.json(newMessage)
})


router.get('/messages', userAuth, async (req, res) => {
  let id = processId(req.data.id)  

  let messagesAllUsers = await MessageService.FindAllMessages(id)
  return res.json(messagesAllUsers) 
})


router.get('/message/:id', userAuth, async (req, res) => {
  let id1 = processId(req.data.id)
  let id2 = processId(req.params.id)

  let messagesAllUsers = await MessageService.FindAllMessagesInUsers(id1, id2)

  return res.json(messagesAllUsers)
})


router.get('/messages/users', userAuth, async(req, res) => {
  let id = processId(req.data.id)

  let listUsers = await MessageService.FindAllUsersOnePersonCanSendMessage(id)
 
  // Todas as pessoas que o dono segue + pessoas que ele enviou ou recebeu mensagem!
  return res.json(listUsers)
})

module.exports = router;
