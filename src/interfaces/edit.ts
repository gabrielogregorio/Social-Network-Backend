import { ItemBioSchema } from '@/models/ItemBio';

export type IUpdateUser = {
  name: string;
  password: string;
  username: string;
  img: string;
  motivational: string;
  bio: string;
  email: string;
  itemBio: ItemBioSchema[];
};
