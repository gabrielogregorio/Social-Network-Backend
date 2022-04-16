import mongoose, { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  username: string;
  password: string;
  bio: string;
  img: string;
  motivational: string;
  itemBio: string[];
  posts: string;
  following: Types.ObjectId[];
  followers: Types.ObjectId[];
  likes: string[];
  saves: string[];
}

const userSchema = new mongoose.Schema<IUser>({
  name: String,
  email: String,
  username: String,
  password: String,
  bio: String,
  img: String,
  motivational: String,
  itemBio: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ItemBio' }],
  posts: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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

const User = mongoose.model<IUser>('User', userSchema);
export default User;
