import Like, { ILike } from '@/models/Like';
import { rowsAffectedInterface } from 'src/interfaces/delete';

export default class LikeService {
  static async Create(post: string, user: string): Promise<ILike> {
    const newLike = new Like({ post, user });
    await newLike.save();
    return newLike;
  }

  static async DeleteLike(post: string, user: string): Promise<rowsAffectedInterface> {
    const { deletedCount } = await Like.deleteOne({ post, user });
    return { rowsAffected: deletedCount };
  }

  static async DeleteAllLikes(user: string): Promise<rowsAffectedInterface> {
    const { deletedCount } = await Like.deleteMany({ user });
    return { rowsAffected: deletedCount };
  }

  static async FindLike(post: string, user: string): Promise<ILike> {
    return Like.findOne({ post, user });
  }
}
