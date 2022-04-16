import { ItemBioSchema } from '@/models/ItemBio';
import { IUser } from '@/models/User';

export type dataUsersType = {
  _id: string;
  name: string;
  username: string;
  email: string;
  img: string;
  bio: string;
  motivational: string;
  itemBio: ItemBioSchema[];
  followers: IUser[];
  following: IUser[];
  followersIds: string[];
  followingIds: string[];
};
export default class DataUsers {
  static Build(user): dataUsersType {
    const newUser: dataUsersType = {
      _id: user._id,
      name: user.name,
      username: user.username === undefined ? '' : `${user.username}`,
      email: user.email,
      img: user.img,
      bio: user.bio,
      motivational: user.motivational,
      itemBio: user.itemBio,
      followers: user.followers ? user.followers.map((userTemp) => this.Build(userTemp)) : [],
      following: user.following ? user.following.map((userTemp) => this.Build(userTemp)) : [],
      followersIds: user.followers ? user.followers.map((userTemp) => userTemp._id) : [],
      followingIds: user.following ? user.following.map((userTemp) => userTemp._id) : [],
    };
    return newUser;
  }
}
