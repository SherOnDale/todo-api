const expect = require('expect');
const request = require('supertest');
const {
  ObjectID
} = require('mongodb');
const {
  todo,
  users,
  populateToDos,
  populateUsers
} = require('./seed/seed');

const {
  app
} = require('./../server');
const {
  ToDo
} = require('./../models/todo');
const {
  User
} = require('./../models/user');

beforeEach(populateUsers);
beforeEach(populateToDos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'ToDo test text';
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return a todo', (done) => {
    request(app)
      .get(`/todos/${todo[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todo[0].text);
      })
      .end(done);
  });

  it('should not return a todo created by others', (done) => {
    request(app)
      .get(`/todos/${todo[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 due to incorrect id', (done) => {
    let id = new ObjectID();
    request(app)
      .get(`/todos/${id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 400 due to invalid id', (done) => {
    let id = '123';
    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(400)
      .end(done);
  })
});

describe('DELETE /todos/:id', () => {
  it('should delete and return a todo', (done) => {
    request(app)
      .delete(`/todos/${todo[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todo[0].text);
      })
      .end(done);
  });

  it('should not delete a todo made by others', (done) => {
    request(app)
      .delete(`/todos/${todo[0]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 400 due to invalid id', (done) => {
    request(app)
      .delete(`/todos/123abc`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(400)
      .end(done);
  });

  it('should return 404 due to incorrect id', (done) => {
    let id = new ObjectID();
    request(app)
      .delete(`/todos/${id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[1].tokens[0].token)
      .send(updatedTodo)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(updatedTodo.text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end(done);
  });

  it("should return error if user tried to update other's todos", (done) => {
    let id = todo[1]._id;
    let updatedTodo = {
      text: 'This is updated 1',
      completed: false
    };
    request(app)
      .patch(`/todos/${id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(updatedTodo)
      .expect(404)
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
      .set('x-auth', users[0].tokens[0].token)
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
describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('it should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  let user = {
    email: 'sherinbinu@gmail.com',
    password: 'newuserpass'
  };
  it('should create a new user', (done) => {
    request(app)
      .post('/users')
      .send(user)
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(user.email);
      })
      .end(err => {
        if (err) return done(err);
        User.findOne({
            email: user.email
          })
          .then(userDB => {
            expect(userDB).toExist();
            expect(userDB.email).toBe(user.email);
            expect(userDB.password).toNotBe(user.password);
            done();
          })
          .catch(err => done(err));
      });
  });

  it('should return validation errors if request is invalid', (done) => {
    let user = {
      email: 'sherinbinu',
      password: 'newuserpass'
    };
    request(app)
      .post('/users')
      .send(user)
      .expect(400)
      .expect(res => {
        expect(res.body.name).toBe('ValidationError');
      })
      .end(done);
  });

  it('should not create user if email already exists', (done) => {
    let user = {
      email: 'sherinbinu@hotmail.com',
      password: 'newuserpass'
    };
    request(app)
      .post('/users')
      .send(user)
      .expect(400)
      .expect(res => {
        expect(res.body.code).toBe(11000);
      })
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should log in without error', (done) => {
    let user = {
      email: users[0].email,
      password: users[0].password
    };
    request(app)
      .post('/users/login')
      .send(user)
      .expect(200)
      .expect(res => {
        expect(res.body.email).toBe(user.email);
        expect(res.body._id).toExist(users[0]._id);
        expect(res.headers['x-auth']).toExist();
      })
      .end(done);
  });

  it('should throw invalid email error', (done) => {
    let user = {
      email: 'thisemaildontexist@gmail.com',
      password: 'anypassword'
    };
    request(app)
      .post('/users/login')
      .send(user)
      .expect(400)
      .end(done);
  });

  it('should throw invalid password error', (done) => {
    let user = {
      email: users[0].email,
      password: users[1].password
    };
    request(app)
      .post('/users/login')
      .expect(400)
      .end(done);
  });
});

describe('DELETE /users/logout', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/logout')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end(done);
  });
});