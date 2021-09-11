const Message = require('../models/Message');
const dataUser = require('../factories/dataUsers');
const UserService = require('./User');

class MessageService {
  async Create({message, from, to, test}) {
    let newMessage = new Message({message, from, to, test})
    await newMessage.save()
    return newMessage;
  }

  async FindAllMessages(id) {
    return await Message.find({$or: [{to:id}, {from: id}]}).populate('from to')
  }

  async FindAllMessagesInUsers(id1, id2) {
    return await Message.find({$or: [
      {to:id1, from: id2},
      {to:id2, from:id1}
    ]}).populate('from to') 
  }


  async FindAllUsersOnePersonCanSendMessage(id) {

    let usersFolling = await UserService.findFollowingUsers(id, true)   

    // Obter todas as mensagens que foram para o usuário ou que ele enviou
    let users = await Message.find({$or:
      [
        {to:id},
        {from:id}
      ]
    }).populate('from to')
    let listUsers = []
    let listIds = []
    let to = ''
    let from = ''

    // Varredura de dados para obter todas as pessoas unicas
    users.forEach(user => {
      to = user.to
      from = user.from

      if (`${to._id}` != `${id}`) {
        if (listIds.includes(`${to._id}`) == false ) {
          listUsers.push(dataUser.Build(to))
          listIds.push(`${to._id}`)
        }
      }

      if (`${from._id}` != `${id}`) {
        if (listIds.includes(`${from._id}`) == false ) {
          listUsers.push(dataUser.Build(from))
          listIds.push(`${from._id}`)
        }
      }
    })

    // Adição de pessoas que o dono segue
    usersFolling.forEach(usersFolling => {
      if (`${usersFolling._id}` != `${id}`) {
        if (listIds.includes(`${usersFolling._id}`) == false ) {
          listUsers.push(dataUser.Build(usersFolling))
          listIds.push(`${usersFolling._id}`)
        }
      }
    })

    return listUsers
  }
}

module.exports = new MessageService();