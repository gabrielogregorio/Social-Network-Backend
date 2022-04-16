import mongoose, { Types } from 'mongoose';

export interface ItemBioSchema {
  _id: Types.ObjectId;
  text: string;
  typeItem: string;
  user: string;
}

const itemSchema = new mongoose.Schema<ItemBioSchema>({
  text: {
    type: String,
  },
  typeItem: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const ItemBio = mongoose.model<ItemBioSchema>('ItemBio', itemSchema);
export default ItemBio;
