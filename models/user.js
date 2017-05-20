const mongoose = require('mongoose');
const validator = require('validator');
const JWT = require('jsonwebtoken');
const _ = require('lodash');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: 'String',
      required: true
    },
    token: {
      type: 'String',
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function () {
  let user = this;
  let userObject = user.toObject();
  return _.pick(userObject, ['email', '_id']);
};

UserSchema.methods.generateAuthToken = function () {
  let user = this;
  let access = 'auth';
  let token = JWT.sign({
    _id: user._id.toHexString(),
    access
  }, '123abc');
  user.tokens.push({
    access,
    token
  });
  return user.save()
    .then(() => {
      return token;
    });
};

UserSchema.statics.findByToken = function (token) {
  let User = this;
  var decoded;
  try {
    decoded = JWT.verify(token, '123abc');
  } catch(e) {
    return Promise.reject();
  }
  return User.findOne({
    _id: decoded._id,
    'tokens.access': 'auth',
    'tokens.token': token
  });
};

const User = mongoose.model('User', UserSchema);

module.exports = {
  User
};