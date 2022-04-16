import Save, { ISave } from '@/models/Save';
import { rowsAffectedInterface } from 'src/interfaces/delete';

export default class SavePostsService {
  static async Create(post: string, user: string): Promise<ISave> {
    const newSave = new Save({ post, user });
    await newSave.save();
    return newSave;
  }

  static async FindByUser(user: string): Promise<ISave[]> {
    return Save.find({ user });
  }

  static async DeleteOne(post: string, user: string): Promise<rowsAffectedInterface> {
    const { deletedCount } = await Save.deleteOne({ post, user });
    return { rowsAffected: deletedCount };
  }

  static async DeleteAllSave(user: string): Promise<rowsAffectedInterface> {
    const { deletedCount } = await Save.deleteMany({ user });
    return { rowsAffected: deletedCount };
  }

  static async FindOne(post: string, user: string): Promise<ISave> {
    return Save.findOne({ post, user });
  }
}
