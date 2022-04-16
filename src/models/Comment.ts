import mongoose, { Types } from 'mongoose';

export interface IComment {
  _id: Types.ObjectId;
  text: string;
  replie: IComment;
  replies: Types.ObjectId[];
  base: boolean;
  post: Types.ObjectId;
  user: Types.ObjectId;
}

const commentSchema = new mongoose.Schema(
  {
    text: { type: String },
    replie: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    base: { type: Boolean, default: false },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

function autoPopulateChildren(next) {
  this.populate('replies');
  next();
}

commentSchema.pre('findOne', autoPopulateChildren).pre('find', autoPopulateChildren);

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
