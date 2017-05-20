const {
  User
} = require('./../models/user');

let authenticate = (req, res, next) => {
  let token = req.header('x-auth');
  User.findByToken(token)
    .then((user) => {
      if (user) {
        req.user = user;
        req.token = token;
        next();
      } else {
        return Promise.reject();
      }
    })
    .catch(e => {
      res.status(401).send('Invalid token');
    });
}

module.exports = {
  authenticate
}