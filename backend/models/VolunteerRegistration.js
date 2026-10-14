const mongoose = require('mongoose');

const volunteerRegistrationSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: [true, 'पूरा नाम आवश्यक है'],
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
  address: {
    type: String,
    default: '',
    trim: true
  },
  preferred_date: {
    type: String,
    required: [true, 'पसंदीदा तिथि आवश्यक है'],
    trim: true
  },
  help_type: {
    type: String,
    required: [true, 'सेवा का प्रकार आवश्यक है'],
    trim: true
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'लंबित',
    enum: ['लंबित', 'स्वीकृत', 'अस्वीकार किया गया']
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

module.exports = mongoose.models.VolunteerRegistration || mongoose.model('VolunteerRegistration', volunteerRegistrationSchema);
