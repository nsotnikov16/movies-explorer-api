require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const reqSuccess = require('../utils/successfulRequest');
const BadRequestError = require('../utils/classesErrors/BadRequestError');
const NotFoundError = require('../utils/classesErrors/NotFoundError');
const UnauthorizedError = require('../utils/classesErrors/UnauthorizedError');
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

  return User.findOne({ email }).then((mail) => {
    if (mail) next(new ConflictError('Такой пользователь уже существует!'));
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) next(err);
      return User.create({
        name, about, avatar, email, password: hash,
      // eslint-disable-next-line no-shadow
      }).then(({ _id, email, name }) => reqSuccess(res,
        { _id, email, name }))
        .catch((error) => {
          if (error.name === 'ValidationError') {
            throw new BadRequestError('Переданы некорректные данные при создании профиля');
          }
        })
        .catch(next);
    });
  });
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id).then((user) => {
    if (!user) throw new UnauthorizedError('Необходима авторизация');
    reqSuccess(res, user);
  }).catch(next);
};

module.exports.updateInfoUser = (req, res, next) => {
  const { email, name } = req.body;

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
    })
    .catch(next);
};
