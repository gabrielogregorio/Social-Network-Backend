import Like from '@/models/Like';

export default class LikeService {
  static async Create(post, user) {
    const newLike = new Like({ post, user });
    await newLike.save();
    return newLike;
  }

  static async DeleteLike(post, user) {
    return Like.deleteOne({ post, user });
  }

  static async DeleteAllLikes(user) {
    return Like.deleteMany({ user });
  }

  static async FindLike(post, user) {
    return Like.findOne({ post, user });
  }
}
