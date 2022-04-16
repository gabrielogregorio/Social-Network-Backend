import mongoose, { Types } from 'mongoose';

export interface ILike {
  _id: Types.ObjectId;
  text: string;
  post: string;
  user: string;
}

const likeSchema = new mongoose.Schema<ILike>({
  text: {
    type: String,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Like = mongoose.model<ILike>('Like', likeSchema);
export default Like;
