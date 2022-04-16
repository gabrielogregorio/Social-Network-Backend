import Post, { IPost } from '@/models/Post';
import dataUser from '@/factories/dataUsers';
import dataPosts, { dataPostsType } from '@/factories/dataPosts';
import UserService from '@/services/userService';
import { rowsAffectedInterface } from 'src/interfaces/delete';

type postServiceType = {
  body: string;
  user: string;
  test: boolean;
  img: string;
  sharePost: string;
};

export default class PostService {
  static async Create({ body, user, test, img, sharePost }: postServiceType) {
    let newPostData;
    if (!sharePost) {
      newPostData = { body, user, test, img };
    } else {
      newPostData = { user, sharePost };
    }
    const newPost = await new Post(newPostData);
    return newPost.save();
  }

  static async FindById(id: string): Promise<IPost> {
    return Post.findById({ _id: id });
  }

  static async FindPostsByIds(user: string, ids) {
    const posts = await Post.find({ _id: { $in: ids } })
      .sort({ _id: 'desc' })
      .populate('user comments likes');

    const postFactories: dataPostsType[] = [];
    posts.forEach(async (post) => {
      postFactories.push(dataPosts.Build(post, user, ids));
    });

    return postFactories;
  }

  static async DeleteAllPostByUser(user: string) {
    return Post.deleteMany({ user });
  }

  static async FindPostsByUser(user) {
    return Post.find({ user }).sort({ _id: 'desc' }).populate('user comments likes');
  }

  static async findFollowingPosts(id: string, includedUser = false) {
    const userItem = await UserService.FindById(id);

    const ids: string[] = dataUser.Build(userItem).followingIds;
    if (includedUser) {
      ids.push(id);
    }

    return Post.find({ user: { $in: ids } })
      .sort({ _id: 'desc' })
      .populate('user comments likes');
  }

  static async DeleteById(id: string): Promise<rowsAffectedInterface> {
    const { deletedCount } = await Post.deleteOne({ _id: id });
    return { rowsAffected: deletedCount };
  }

  static async FindByIdAndPopulate(_id: string): Promise<any[]> {
    return Post.find({ _id }).populate('user comments likes sharePost');
  }

  static async FindOne(_id: string, user: string): Promise<any> {
    const post = await Post.findOne({ _id, user }).populate('user');
    if (!post) {
      return null;
    }

    return dataPosts.Build(post, user);
  }

  static async FindOneAndUpdate(_id: string, user: string, upload) {
    return Post.findOneAndUpdate({ _id, user }, { $set: upload });
  }
}
