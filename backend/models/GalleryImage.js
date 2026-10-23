const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'शीर्षक आवश्यक है'],
    trim: true
  },
  image_url: {
    type: String,
    required: [true, 'इमेज यूआरएल आवश्यक है'],
    trim: true
  },
  image_data: {
    type: String,
    default: null
  },
  category: {
    type: String,
    default: 'कार्यक्रम',
    trim: true
  },
  event_id: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  legacy_id: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.GalleryImage || mongoose.model('GalleryImage', galleryImageSchema);
