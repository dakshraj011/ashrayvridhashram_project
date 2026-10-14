const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'नाम आवश्यक है'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'मोबाइल नंबर आवश्यक है'],
    match: [/^[0-9]{10}$/, 'मोबाइल नंबर 10 अंकों का होना चाहिए'],
    trim: true
  },
  email: {
    type: String,
    default: null,
    trim: true
  },
  subject: {
    type: String,
    default: 'सामान्य पूछताछ',
    trim: true
  },
  message: {
    type: String,
    required: [true, 'संदेश आवश्यक है'],
    trim: true
  },
  status: {
    type: String,
    default: 'अपठित',
    enum: ['अपठित', 'पठित', 'हल किया गया']
  },
  legacy_id: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.ContactSubmission || mongoose.model('ContactSubmission', contactSubmissionSchema);
