let env = process.env.NODE_ENV || 'development';

if(env =='development') {
  process.env.PORT = 3000;
  process.env.MONGOLAB_URI = 'mongodb://127.0.0.1:27017/ToDoApp';
} else if(env == 'test') {
  process.env.PORT = 3030;
  process.env.MONGOLAB_URI = 'mongodb://127.0.0.1:27017/ToDoAppTest';
}