import mongoose from 'mongoose';

export interface ItemSchema {
  _id: string;
  text: string;
  typeItem: string;
  user: string;
}

const itemSchema = new mongoose.Schema<ItemSchema>({
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

const ItemBio = mongoose.model<ItemSchema>('ItemBio', itemSchema);
export default ItemBio;
