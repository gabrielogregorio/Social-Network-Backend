import mongoose from 'mongoose';

export interface ISave {
  _id: string;
  text: string;
  post: string;
  user: string;
}

const saveSchema = new mongoose.Schema<ISave>({
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

const Save = mongoose.model<ISave>('Save', saveSchema);
export default Save;
