import mongoose, { Types } from 'mongoose';

export interface IPost {
  _id: Types.ObjectId;
  title: string;
  body: string;
  test: boolean;
  img: string;
  sharePost: IPost;
  edited: boolean;
  thisReferencesShared: IPost[];
  user: Types.ObjectId;
  likes: Types.ObjectId[];
  saves: string[];
  comments: string[];
}

const postSchema = new mongoose.Schema<IPost>(
  {
    title: String,
    body: String,
    test: Boolean,
    img: String,
    sharePost: this,
    edited: Boolean,
    thisReferencesShared: [this],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like',
      },
    ],
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Save',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Post = mongoose.model<IPost>('Post', postSchema);
export default Post;
