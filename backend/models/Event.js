const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'कार्यक्रम शीर्षक आवश्यक है'],
    trim: true
  },
  event_date: {
    type: String,
    required: [true, 'कार्यक्रम की तिथि आवश्यक है'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'विवरण आवश्यक है'],
    trim: true
  },
  image_url: {
    type: String,
    default: null
  },
  photos: {
    type: [String],
    default: []
  },
  is_published: {
    type: Number,
    default: 1
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

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);
