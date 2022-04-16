import mongoose, { Types } from 'mongoose';

export interface IMessage {
  _id: Types.ObjectId;
  message: string;
  test: boolean;
  to: Types.ObjectId;
  from: Types.ObjectId;
  dateSendMessage: any;
  dateReadMessage: any;
}

const messageSchema = new mongoose.Schema<IMessage>({
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

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
