const mongoose = require('mongoose');

const ToDoSchema = new mongoose.Schema({
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

const ToDo = mongoose.model('ToDo', ToDoSchema);

module.exports = {
  ToDo
};