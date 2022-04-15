import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
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

const ItemBio = mongoose.model('ItemBio', itemSchema);
export default ItemBio;
