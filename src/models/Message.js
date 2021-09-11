let mongoose = require('mongoose');

let messageSchema = new mongoose.Schema({
  message: {
    type: String,
  },
  test: {
    type: Boolean,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dateSendMessage: {
    type: Date,
    default: Date.now()
  },
  dateReadMessage: {
    type: Date
  }
})

let Message = mongoose.model('Message', messageSchema);
module.exports = Message;
