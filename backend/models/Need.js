const mongoose = require('mongoose');

const needSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'शीर्षक आवश्यक है'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'श्रेणी आवश्यक है'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  required_quantity: {
    type: Number,
    required: [true, 'आवश्यक मात्रा प्रदान करें']
  },
  available_quantity: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: 'इकाई'
  },
  photo_url: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: 'सक्रिय',
    enum: ['सक्रिय', 'पूर्ण', 'स्थगित']
  },
  created_by: {
    type: Number,
    default: 1
  },
  legacy_id: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Need || mongoose.model('Need', needSchema);
