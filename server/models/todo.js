const mongoose = require('mongoose');

const ToDo = mongoose.model('ToDo', {
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
});

module.exports = {
  ToDo
}