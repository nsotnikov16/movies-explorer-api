require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const reqSuccess = require('../utils/successfulRequest');
const BadRequestError = require('../utils/classesErrors/BadRequestError');
const NotFoundError = require('../utils/classesErrors/NotFoundError');
const ConflictError = require('../utils/classesErrors/ConflictError');

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password).then((user) => {
    const { NODE_ENV, JWT_SECRET } = process.env;
    const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret', { expiresIn: '7d' });
    res.send({ token });
  })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  return User.findOne({ email }).then((data) => {
    if (data) {
      next(new ConflictError('Такой пользователь уже существует!'));
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) next(err);
      return User.create({
        name, about, avatar, email, password: hash,
      }).then((user) => reqSuccess(res,
        { _id: user._id, email: user.email, name: user.name }))
        .catch((error) => {
          if (error.name === 'ValidationError') {
            throw new BadRequestError('Переданы некорректные данные при создании профиля');
          }
          // throw error;
          /* теперь появляется ошибка Mongo,
          о том что индекс в бд повторяется (если я правильно понял) */
        })
        .catch(next);
    });
  }).catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id).then((user) => {
    if (!user) throw new NotFoundError('Такой пользователь не найден!');
    reqSuccess(res, user);
  }).catch(next);
};

module.exports.updateInfoUser = (req, res, next) => {
  const { email, name } = req.body;

  User.findOne({ email }).then((data) => {
    if (data) {
      throw new ConflictError('Такая почта уже занята!');
    }
    User.findByIdAndUpdate(req.user._id, { name, email }, {
      new: true,
      runValidators: true,
    })
      .then((user) => {
        if (!user) {
          throw new NotFoundError('Пользователь по указанному _id не найден.');
        } else {
          reqSuccess(res, user);
        }
      })
      .catch((err) => {
        if ((err.name === 'CastError') || (err.name === 'ValidationError')) {
          throw new BadRequestError('Переданы некорректные данные при обновлении профиля');
        }
        throw err;
      })
      .catch(next);
  }).catch(next);
};
