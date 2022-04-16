import Comment from '@/models/Comment';
import logger from '../logger';

export default class CommentService {
  static async Create({ post, user, text, replie, base = false }) {
    logger.info('Criação de comentário');

    const create = { post, user, text, base };
    if (replie !== undefined) {
      // @ts-ignore
      create.replie = replie;
    }

    const newComment = new Comment(create);
    await newComment.save();
    return newComment;
  }

  static async DeleteOne(_id, user) {
    return Comment.deleteOne({ _id, user });
  }

  static async DeleteAllComments(user) {
    return Comment.deleteMany({ user });
  }

  static async FindById(id) {
    return Comment.findById({ _id: id });
  }

  static async FindByPosts(post) {
    return Comment.find({ post, base: true });
  }

  static async FindOneAndUpdate(_id, user, update) {
    return Comment.findOneAndUpdate({ _id, user }, { $set: update });
  }
}
