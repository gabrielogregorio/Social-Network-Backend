import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String,
  bio: String,
  img: String,
  motivational: String,
  itemBio: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ItemBio' }],
  posts: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  following: [this],
  followers: [this],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Likes',
    },
  ],
  saves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Save',
    },
  ],
});

const User = mongoose.model('User', userSchema);
export default User;
