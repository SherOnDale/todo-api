const expect = require('expect');
const request = require('supertest');
const {
  ObjectID
} = require('mongodb');

const {
  app
} = require('./../server');
const {
  ToDo
} = require('./../models/todo');

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

beforeEach((done) => {
  ToDo.remove({}).then(() => {
      ToDo.insertMany(todo)
    })
    .then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'ToDo test text';
    request(app)
      .post('/todos')
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        ToDo.find({
            text
          }).then((todos) => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not create a new todo with wrong data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        ToDo.find().then((todos) => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return a todo', (done) => {
    request(app)
      .get(`/todos/${todo[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todo[0].text);
      })
      .end(done);
  });

  it('should return 404 due to incorrect id', (done) => {
    let id = new ObjectID();
    request(app)
      .get(`/todos/${id.toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 400 due to invalid id', (done) => {
    let id = '123';
    request(app)
      .get(`/todos/${id}`)
      .expect(400)
      .end(done);
  })
});

describe('DELETE /todos/:id', () => {
  it('should delete and return a todo', (done) => {
    request(app)
      .delete(`/todos/${todo[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todo[0].text);
      })
      .end(done);
  });

  it('should return 400 due to invalid id', (done) => {
    request(app)
      .delete(`/todos/123abc`)
      .expect(400)
      .end(done);
  });

  it('should return 404 due to incorrect id', (done) => {
    let id = new ObjectID();
    request(app)
      .delete(`/todos/${id.toHexString()}`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should set the completed to false', (done) => {
    let id = todo[1]._id;
    let updatedTodo = {
      text: 'This is updated 1',
      completed: false
    };
    request(app)
      .patch(`/todos/${id.toHexString()}`)
      .send(updatedTodo)
      .expect(200)
      .expect((res) => {
        expect(res.body.todoInDb.text).toBe(updatedTodo.text);
        expect(res.body.todoInDb.completed).toBe(false);
        expect(res.body.todoInDb.completedAt).toBe(null);
      })
      .end(done);
  });

  it('should set the completed to true', (done) => {
    let id = todo[0]._id;
    let updatedTodo = {
      text: 'This is updated 2',
      completed: true
    };
    request(app)
      .patch(`/todos/${id.toHexString()}`)
      .send(updatedTodo)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(updatedTodo.text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toNotBe(null);
      })
      .end(done);
  });
});