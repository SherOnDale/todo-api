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

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo = new ToDo({
    text: req.body.text
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

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

module.exports = {
  app
};