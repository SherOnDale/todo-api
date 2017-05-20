const {
  ObjectID
} = require('mongodb');
const {
  ToDo
} = require('./../../models/todo');
const {
  User
} = require('./../../models/user');
const JWT = require('jsonwebtoken');

const user1Id = new ObjectID();
const user2Id = new ObjectID();
const users = [{
  _id: user1Id,
  email: 'sherinbinu@hotmail.com',
  password: 'user1pass',
  tokens: [{
    access: 'auth',
    token: JWT.sign({
      _id: user1Id.toHexString(),
      access: 'auth'
    }, '123abc').toString()
  }]
}, {
  _id: user2Id,
  email: 'sherondale13@gmail.com',
  password: 'user2pass'
}
];

const todo = [{
    _id: new ObjectID(),
    text: 'This is a first test todo'
  },
  {
    _id: new ObjectID(),
    text: 'This is a second test todo',
    completed: true,
    completedAt: 1234566
  }
];

const populateToDos = (done) => {
  ToDo.remove({}).then(() => {
      ToDo.insertMany(todo)
    })
    .then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    let user1 = new User(users[0]).save();
    let user2 = new User(users[1]).save();
    return Promise.all([user1, user2])
  })
  .then(() => done());
};

module.exports = {
  todo,
  users,
  populateToDos,
  populateUsers
}