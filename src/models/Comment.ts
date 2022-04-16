import mongoose from 'mongoose';

export interface IComment {
  _id: string;
  text: string;
  replie: IComment;
  replies: string[];
  base: boolean;
  post: string;
  user: string;
}

const commentSchema = new mongoose.Schema(
  {
    text: { type: String },
    replie: this,
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
