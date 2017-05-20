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

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
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
    completedAt: body.completedAt
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

app.get('/todos', (req, res) => {
  ToDo.find({}).then((todos) => {
    res.status(200)
      .send({
        todos
      })
  }, (err) => {
    res.status(400)
      .send(err);
  });
});

app.get('/todos/:id', (req, res) => {
  let id = req.params.id;
  if (ObjectID.isValid(id)) {
    ToDo.findById(id)
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

app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;
  if (ObjectID.isValid(id)) {
    ToDo.findByIdAndRemove(id)
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

app.patch('/todos/:id', (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);
  if (ObjectID.isValid(id)) {
    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }
    ToDo.findByIdAndUpdate(id, {
        $set: body
      }, {
        new: true
      })
      .then((todo) => {
        if(todo) {
          res.send(todo);
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = {
  app
};