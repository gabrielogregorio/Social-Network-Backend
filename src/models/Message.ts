import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
  },
  test: {
    type: Boolean,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  dateSendMessage: {
    type: Date,
    default: Date.now(),
  },
  dateReadMessage: {
    type: Date,
  },
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
