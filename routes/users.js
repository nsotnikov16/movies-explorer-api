const router = require('express').Router();
const { Joi, celebrate } = require('celebrate');

const {
  getCurrentUser, updateInfoUser,
} = require('../controllers/users');

router.get('/users/me', getCurrentUser);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
  }),
}), updateInfoUser);

module.exports = ('/', router);
