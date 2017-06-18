require('./config/config');

const {
  mongoose
} = require('./db/mongoose');
const ToDo = require('./models/todo').Todo;
const {
  User
} = require('./models/user');
const {
  MongoClient,
  ObjectID
} = require('mongodb');
const {
  authenticate
} = require('./middleware/authenticate');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, async(req, res) => {
  let body = _.pick(req.body, ['text', 'completed']);
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
  let todo = new ToDo({
    text: body.text,
    completed: body.completed,
    completedAt: body.completedAt,
    _creator: req.user._id
  });
  try {
    const doc = await todo.save();
    res.status(200).send(doc);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/todos', authenticate, async(req, res) => {
  try {
    const todos = await ToDo.find({
      _creator: req.user._id
    });
    res.status(200).send({
      todos
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/todos/:id', authenticate, async(req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    res.status(400).send('Enter a valid id');
  }
  try {
    const todo = await ToDo.findOne({
      _id: id,
      _creator: req.user._id
    });
    if (todo) {
      res.send({
        todo
      });
    } else {
      res.status(404).send('No document exists with the given id');
    }
  } catch (e) {
    res.status(404).send('Cant find a document with the given id');
  }
});

app.delete('/todos/:id', authenticate, async(req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    res.status(400).send('Enter a valid ID');
  }
  try {
    const todo = await ToDo.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    });
    if (todo) {
      res.send({
        todo
      });
    } else {
      res.status(404).send('No document exists with the given id');
    }
  } catch (e) {
    res.status(404).send('Cant find a document with the given id');
  }
});

app.patch('/todos/:id', authenticate, async(req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['text', 'completed']);
  if (!ObjectID.isValid(id)) {
    res.status(400).send('Enter a valid ID');
  }
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
  try {
    const todo = await ToDo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true});
    if(todo) {
      res.send({todo});
    } else {
      res.status(404).send('No document with the given ID is found');
    }
  } catch(e) {
    res.status(404).send('Unable to find the document with the given ID');
  }
});

app.post('/users', async(req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', async(req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  try {
    const user = await User.findByCredentials(body);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

app.delete('/users/logout', authenticate, async(req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send('You are successfully logged out');
  } catch (e) {
    res.status(500).send();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = {
  app
};