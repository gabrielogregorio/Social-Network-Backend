import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
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

const Like = mongoose.model('Like', likeSchema);
export default Like;
