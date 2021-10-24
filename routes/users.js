const router = require('express').Router();
const { Joi, celebrate } = require('celebrate');

const {
  getCurrentUser, updateInfoUser,
} = require('../controllers/users');

router.get('/me', getCurrentUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email(),
    name: Joi.string().min(2).max(30),
  }),
}), updateInfoUser);

module.exports = router;
