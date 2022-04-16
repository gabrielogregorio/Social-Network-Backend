import { IComment } from '@/models/Comment';
import { IPost } from '@/models/Post';
import DataUsers, { dataUsersType } from './dataUsers';

export type dataPostsType = {
  _id: string;
  title: string;
  body: string;
  edited: boolean;
  img: string;
  createdAt: Date;
  updatedAt: Date;
  comments: string[] | IComment[];
  user: dataUsersType | {};
  likes: number;
  likedByUser: boolean;
  savedByUser: boolean;
  sharePost: IPost;
};

export default class DataPosts {
  static Build(post: any, userId: string, idsSaves: string[] = []): dataPostsType {
    const newPost: dataPostsType = {
      _id: post?.id,
      title: post?.title,
      body: post?.body,
      edited: post?.edited,
      img: post?.img,
      createdAt: post?.createdAt,
      updatedAt: post?.updatedAt,
      comments: post?.comments,
      user: '',
      likes: post?.likes === undefined ? 0 : post?.likes.length,
      likedByUser: false,
      savedByUser: false,
      sharePost: post?.sharePost ? post?.sharePost : null,
    };

    if (post.user !== undefined) {
      newPost.user = DataUsers.Build(post.user);
    } else {
      newPost.user = {};
    }

    if (idsSaves !== undefined) {
      idsSaves.forEach((idSave) => {
        if (post._id === idSave) {
          newPost.savedByUser = true;
        }
      });
    }

    post.likes.forEach((postLike) => {
      if (userId === postLike.user) {
        newPost.likedByUser = true;
      }
    });

    return newPost;
  }
}
