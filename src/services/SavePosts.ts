import Save from '@/models/Save';

export default class SavePostsService {
  static async Create(post, user) {
    const newSave = new Save({ post, user });
    await newSave.save();
    return newSave;
  }

  static async FindByUser(user) {
    return Save.find({ user });
  }

  static async DeleteOne(post, user) {
    return Save.deleteOne({ post, user });
  }

  static async DeleteAllSave(user) {
    return Save.deleteMany({ user });
  }

  static async FindOne(post, user) {
    return Save.findOne({ post, user });
  }
}
