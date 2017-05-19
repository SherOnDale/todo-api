const {
  mongoose
} = require('./db/mongoose');
const {
  ToDo
} = require('./models/todo');
const {
  User
} = require('./models/user');

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
      res.status(200).send(doc);
    }, (err) => {
      res.status(400).send(err);
    });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

module.exports =  {
  app
};