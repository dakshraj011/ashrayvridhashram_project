const mongoose = require('mongoose');

const assistanceRequestSchema = new mongoose.Schema({
  elderly_name: {
    type: String,
    required: [true, 'बुजुर्ग का नाम आवश्यक है'],
    trim: true
  },
  elderly_age: {
    type: Number,
    default: null
  },
  contact_number: {
    type: String,
    required: [true, 'संपर्क नंबर आवश्यक है'],
    match: [/^[0-9]{10}$/, 'संपर्क नंबर 10 अंकों का होना चाहिए'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'पता आवश्यक है'],
    trim: true
  },
  assistance_type: {
    type: String,
    required: [true, 'सहायता का प्रकार (जैसे: दवा, आश्रय, राशन) आवश्यक है'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'विवरण आवश्यक है'],
    trim: true
  },
  photo_url: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: 'लंबित',
    enum: ['लंबित', 'प्रक्रिया में', 'स्वीकृत', 'पूर्ण', 'अस्वीकार किया गया']
  },
  user_id: {
    type: Number,
    default: 0
  },
  legacy_id: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.AssistanceRequest || mongoose.model('AssistanceRequest', assistanceRequestSchema);
