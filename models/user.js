const mongoose = require('mongoose');
const validator = require('validator');
const JWT = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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

UserSchema.methods.removeToken = function (token) {
  let user = this;
  return user.update({
    $pull: {
      tokens: {
        token
      }
    }
  });
};

UserSchema.statics.findByToken = function (token) {
  let User = this;
  var decoded;
  try {
    decoded = JWT.verify(token, '123abc');
  } catch (e) {
    return Promise.reject();
  }
  return User.findOne({
    _id: decoded._id,
    'tokens.access': 'auth',
    'tokens.token': token
  });
};

UserSchema.statics.findByCredentials = function ({
  email,
  password
}) {
  let User = this;
  return User.findOne({
      email
    })
    .then(user => {
      if (!user) return Promise.reject('Email is wrong');
      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
          console.log(res);
          if (err || !res) reject('Password is wrong');
          if (res) resolve(user);
        });
      });
    });
};

UserSchema.pre('save', function (next) {
  let user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = {
  User
};