const mongoose = require('mongoose');

const mealRequestSchema = new mongoose.Schema({
  user_name: {
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
  preferred_date: {
    type: String,
    required: [true, 'भोजन वितरण की तिथि आवश्यक है'],
    trim: true
  },
  meal_type: {
    type: String,
    required: [true, 'भोजन का प्रकार आवश्यक है'],
    enum: ['सुबह का नाश्ता', 'दोपहर का भोजन', 'रात का भोजन', 'पूरे दिन का भोजन']
  },
  people_count: {
    type: Number,
    default: 0
  },
  items_distributed: {
    type: String,
    default: 'सात्विक भोजन, फल एवं मिष्ठान'
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'लंबित',
    enum: ['लंबित', 'स्वीकृत', 'अस्वीकार किया गया', 'पूर्ण']
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

module.exports = mongoose.models.MealRequest || mongoose.model('MealRequest', mealRequestSchema);
