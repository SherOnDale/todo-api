require('./config/config');

const {
  mongoose
} = require('./db/mongoose');
const {
  ToDo
} = require('./models/todo');
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

app.post('/todos', authenticate, (req, res) => {
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
  todo.save()
    .then((doc) => {
      res.status(200)
        .send(doc);
    }, (err) => {
      res.status(400)
        .send(err);
    });
});

app.get('/todos', authenticate,  (req, res) => {
  ToDo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.status(200)
      .send({
        todos
      })
  }, (err) => {
    res.status(400)
      .send(err);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  if (ObjectID.isValid(id)) {
    ToDo.findOne({
      _id: id,
      _creator: req.user._id
    })
      .then((todo) => {
        if (todo) {
          res.send({
            todo
          });
        } else {
          res.status(404).send('No document exists with the given id');
        }
      })
      .catch((err) => {
        res.status(404).send('Cant find a document with the given id');
      });
  } else {
    res.status(400).send('Enter a valid id');
  }
});

app.delete('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  if (ObjectID.isValid(id)) {
    ToDo.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    })
      .then((todo) => {
        if (todo) {
          res.send({
            todo
          });
        } else {
          res.status(404).send('No document exists with the given id');
        }
      })
      .catch(err => {
        res.status(404).send('Cant find a document with the given id');
      });
  } else {
    res.status(400).send('Enter a valid ID');
  }
});

app.patch('/todos/:id', authenticate, (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);
  if (ObjectID.isValid(id)) {
    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }
    ToDo.findOneAndUpdate({
      _id: id,
      _creator: req.user._id
    }, {
        $set: body
      }, {
        new: true
      })
      .then((todo) => {
        if (todo) {
          res.send({
            todo
          });
        } else {
          res.status(404).send("No document witht the given ID is found");
        }
      })
      .catch(err => {
        res.status(404).send('Unable to find the document with the given ID');
      })
  } else {
    res.status(400).send('Enter a valid ID');
  }
});

app.post('/users', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  let user = new User(body);
  user.save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header('x-auth', token).send(user);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  let body = _.pick(req.body, ['email', 'password']);
  User.findByCredentials(body)
    .then(user => {
      return user.generateAuthToken()
        .then((token) => {
          res.header('x-auth', token).send(user);
        })
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

app.delete('/users/logout', authenticate , (req, res) => {
  req.user.removeToken(req.token)
    .then(() => {
      res.send('You are successfully logged out');
    }, () => {
      res.status(500).send();
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = {
  app
};