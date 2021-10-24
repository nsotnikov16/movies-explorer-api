const router = require('express').Router();
const { Joi, celebrate } = require('celebrate');
const validUrl = require('../utils/validUrl');
const validIdParams = require('../utils/validIdParams');

const {
  getSaveMovies, createMovie, deleteMovieId,
} = require('../controllers/movies');

router.get('/', getSaveMovies);

router.post('/', celebrate({
  body: Joi.object().keys({

    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(validUrl),
    trailer: Joi.string().required().custom(validUrl),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().required().custom(validUrl),
    movieId: Joi.string().hex().length(24).required(),
  }),
}), createMovie);

router.delete('/:movieId', celebrate(validIdParams('movieId')), deleteMovieId);

module.exports = router;
