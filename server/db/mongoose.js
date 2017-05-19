const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/ToDoApp');

module.exports = {
  mongoose
};