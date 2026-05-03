const mongoose = require('mongoose');

const brainLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userName: String,
  userRole: String,
  transcript: {
    type: String,
    required: true
  },
  reply: {
    type: String,
    required: true
  },
  modelUsed: String,
  locale: {
    type: String,
    default: 'pt'
  },
  pageContext: String,
  status: {
    type: String,
    enum: ['success', 'error'],
    default: 'success'
  },
  errorMessage: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BrainLog', brainLogSchema);
