/* eslint-disable no-underscore-dangle */
import Message from '@/models/Message';
import dataUser from '@/factories/dataUsers';
import UserService from '@/services/User';

export default class MessageService {
  static async Create({ message, from, to, test }) {
    const newMessage = new Message({ message, from, to, test });
    await newMessage.save();
    return newMessage;
  }

  static async DeleteAllMessages(userId) {
    return Message.deleteMany({ from: userId });
  }

  static async FindAllMessages(id) {
    return Message.find({ $or: [{ to: id }, { from: id }] }).populate('from to');
  }

  static async FindAllMessagesInUsers(id1, id2) {
    return Message.find({
      $or: [
        { to: id1, from: id2 },
        { to: id2, from: id1 },
      ],
    }).populate('from to');
  }

  static async FindAllUsersOnePersonCanSendMessage(id) {
    const usersFolling = await UserService.findFollowingUsers(id, true);

    // Obter todas as mensagens que foram para o usuário ou que ele enviou
    const users = await Message.find({ $or: [{ to: id }, { from: id }] }).populate('from to');
    const listUsers = [];
    const listIds = [];
    let to = '';
    let from = '';

    // Varredura de dados para obter todas as pessoas unicas
    users.forEach((user) => {
      to = user.to;
      from = user.from;

      // @ts-ignore
      if (`${to._id}` !== `${id}`) {
        // @ts-ignore
        if (listIds.includes(`${to._id}`) === false) {
          listUsers.push(dataUser.Build(to));
          // @ts-ignore
          listIds.push(`${to._id}`);
        }
      }
      // @ts-ignore
      if (`${from._id}` !== `${id}`) {
        // @ts-ignore
        if (listIds.includes(`${from._id}`) === false) {
          listUsers.push(dataUser.Build(from));
          // @ts-ignore
          listIds.push(`${from._id}`);
        }
      }
    });

    // Adição de pessoas que o dono segue
    usersFolling.forEach((mudarNomeOkkkkkkkkkkkk) => {
      if (`${mudarNomeOkkkkkkkkkkkk._id}` !== `${id}`) {
        if (listIds.includes(`${mudarNomeOkkkkkkkkkkkk._id}`) === false) {
          listUsers.push(dataUser.Build(mudarNomeOkkkkkkkkkkkk));
          listIds.push(`${mudarNomeOkkkkkkkkkkkk._id}`);
        }
      }
    });

    return listUsers;
  }
}
