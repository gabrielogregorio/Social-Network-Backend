import mongoose from 'mongoose';

const saveSchema = new mongoose.Schema({
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

const Save = mongoose.model('Save', saveSchema);
export default Save;
