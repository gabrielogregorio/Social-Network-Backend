import Post, { IPost } from '@/models/Post';
import dataUser from '@/factories/dataUsers';
import dataPosts from '@/factories/dataPosts';
import UserService from '@/services/User';

export default class PostService {
  static async Create({ body, user, test, img, sharePost }) {
    let newPostData;
    if (sharePost === undefined) {
      newPostData = { body, user, test, img };
    } else {
      newPostData = { user, sharePost };
    }
    const newPost = await new Post(newPostData);
    return newPost.save();
  }

  static async FindById(id):Promise<IPost> {
    return Post.findById({ _id: id });
  }

  static async FindPostsByIds(user, ids) {
    const posts = await Post.find({ _id: { $in: ids } })
      .sort({ _id: 'desc' })
      .populate('user comments likes');

    const postFactories = [];
    posts.forEach(async (post) => {
      postFactories.push(dataPosts.Build(post, user, ids));
    });

    return postFactories;
  }

  static async DeleteAllPostByUser(user) {
    return Post.deleteMany({ user });
  }

  static async FindPostsByUser(user) {
    return Post.find({ user }).sort({ _id: 'desc' }).populate('user comments likes');
  }

  static async findFollowingPosts(id, includedUser = false) {
    const userItem = await UserService.FindById(id);

    const ids = dataUser.Build(userItem).followingIds;
    if (includedUser) {
      ids.push(id);
    }

    return Post.find({ user: { $in: ids } })
      .sort({ _id: 'desc' })
      .populate('user comments likes');
  }

  static async DeleteById(id) {
    return Post.deleteOne({ _id: id });
  }

  static async FindByIdAndPopulate(_id) {
    return Post.find({ _id }).populate('user comments likes sharePost');
  }

  static async FindOne(_id, user) {
    const post = await Post.findOne({ _id, user }).populate('user');
    if (!post) {
      return post;
    }

    return dataPosts.Build(post, user);
  }

  static async FindOneAndUpdate(_id, user, upload) {
    return Post.findOneAndUpdate({ _id, user }, { $set: upload });
  }
}
