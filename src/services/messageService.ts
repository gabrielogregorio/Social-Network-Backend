/* eslint-disable no-underscore-dangle */
import Message, { IMessage } from '@/models/Message';
import dataUser from '@/factories/dataUsers';
import UserService from '@/services/userService';
import { rowsAffectedInterface } from 'src/interfaces/delete';
import { IUser } from '@/models/User';
import { Types } from 'mongoose';

type messageServiceCreate = {
  message: string;
  from: string;
  to: string;
  test: boolean;
};

export default class MessageService {
  static async Create({ message, from, to, test }: messageServiceCreate): Promise<IMessage> {
    const newMessage = new Message({ message, from, to, test });
    await newMessage.save();
    return newMessage;
  }

  static async DeleteAllMessages(userId): Promise<rowsAffectedInterface> {
    const { deletedCount } = await Message.deleteMany({ from: userId });
    return { rowsAffected: deletedCount };
  }

  static async FindAllMessages(id: string): Promise<IMessage[]> {
    return Message.find({ $or: [{ to: id }, { from: id }] }).populate('from to');
  }

  static async FindAllMessagesInUsers(id1: string, id2: string): Promise<any> {
    return Message.find({
      $or: [
        { to: id1, from: id2 },
        { to: id2, from: id1 },
      ],
    }).populate<{
      to: IUser;
      from: IUser;
    }>('from to');
  }

  static async FindAllUsersOnePersonCanSendMessage(id) {
    const usersFollowing = await UserService.findFollowingUsers(id, true);

    const users = await Message.find({ $or: [{ to: id }, { from: id }] }).populate('from to');
    const listUsers = [];
    const listIds = [];

    let to: Types.ObjectId = null;
    let from: Types.ObjectId = null;

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

    usersFollowing.forEach((user) => {
      if (`${user._id}` !== `${id}`) {
        if (listIds.includes(`${user._id}`) === false) {
          listUsers.push(dataUser.Build(user));
          listIds.push(`${user._id}`);
        }
      }
    });

    return listUsers;
  }
}
