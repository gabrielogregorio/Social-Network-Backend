import User, { IUser } from '@/models/User';
import dataUser from '@/factories/dataUsers';

export default class UserService {
  static async Create({ name, email, username, hash, img }): Promise<any> {
    const newUser = new User({ name, email, username, password: hash, img });
    await newUser.save();
    return newUser;
  }

  static async FindByListIds(ids): Promise<any> {
    return User.find({ _id: { $in: ids } });
  }

  static async FindById(id): Promise<any> {
    const user = await User.findById({ _id: id }).populate('itemBio following followers');
    if (user) {
      return dataUser.Build(user);
    }
    return user;
  }

  static async FindByIdRaw(id): Promise<any> {
    return User.findById({ _id: id });
  }

  static async FindByIdNotPopulate(id): Promise<any> {
    return User.findById({ _id: id });
  }

  static async FindByIdAndUpdate(id, update): Promise<any> {
    return User.findOneAndUpdate({ _id: id }, { $set: update });
  }

  static async findFollowingUsers(id, includedUser = false): Promise<any> {
    const userItem = await this.FindById(id);

    const ids = dataUser.Build(userItem).followingIds;
    if (includedUser) {
      ids.push(id);
    }
    return this.FindByListIds(ids);
  }

  static async UserExistsByEmail(email): Promise<any> {
    const userExists = await User.findOne({ email });
    if (userExists === null) {
      return undefined;
    }

    return userExists;
  }

  static async FindUserByEmail(email): Promise<any> {
    const userExists = await User.findOne({ email });
    if (userExists === null) {
      return undefined;
    }
    return userExists;
  }

  static async DeleteUserById(_id): Promise<any> {
    return User.deleteOne({ _id });
  }

  static async FindAllUsers(): Promise<any> {
    const users = await User.find().populate('itemBio following followers');

    const userFactories = [];
    users.forEach((user) => {
      userFactories.push(dataUser.Build(user));
    });

    return userFactories;
  }
}
