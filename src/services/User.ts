import User from '@/models/User';
import dataUser from '@/factories/dataUsers';

export default class UserService {
  static async Create({ name, email, username, hash, img }) {
    const newUser = new User({ name, email, username, password: hash, img });
    await newUser.save();
    return newUser;
  }

  static async FindByListIds(ids) {
    // @ts-ignore
    return User.find({ _id: { $in: ids } }).populate();
  }

  static async FindById(id) {
    const user = await User.findById({ _id: id }).populate('itemBio following followers');
    if (user) {
      return dataUser.Build(user);
    }
    return user;
  }

  static async FindByIdRaw(id) {
    const user = await User.findById({ _id: id });
    return user;
  }

  static async FindByIdNotPopulate(id) {
    const user = await User.findById({ _id: id });
    return user;
  }

  static async FindByIdAndUpdate(id, update) {
    return User.findOneAndUpdate({ _id: id }, { $set: update });
  }

  static async findFollowingUsers(id, includedUser = false) {
    const userItem = await this.FindById(id);

    const ids = dataUser.Build(userItem).followingIds;
    if (includedUser) {
      ids.push(id);
    }
    return this.FindByListIds(ids);
  }

  static async UserExistsByEmail(email) {
    const userExists = await User.findOne({ email });
    if (userExists === null) {
      return undefined;
    }

    return userExists;
  }

  static async FindUserByEmail(email) {
    const userExists = await User.findOne({ email });
    if (userExists === null) {
      return undefined;
    }
    return userExists;
  }

  static async DeleteUserById(_id) {
    return User.deleteOne({ _id });
  }

  static async FindAllUsers() {
    const users = await User.find().populate('itemBio following followers');

    const userFactories = [];
    users.forEach((user) => {
      userFactories.push(dataUser.Build(user));
    });

    return userFactories;
  }
}
