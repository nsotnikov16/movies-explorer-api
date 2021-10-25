const Movie = require('../models/movie');
const reqSuccess = require('../utils/successfulRequest');

const BadRequestError = require('../utils/classesErrors/BadRequestError');
const NotFoundError = require('../utils/classesErrors/NotFoundError');
const ForbiddenError = require('../utils/classesErrors/ForbiddenError');
const ConflictError = require('../utils/classesErrors/ConflictError');

module.exports.getSaveMovies = (req, res, next) => {
  const currentOwner = req.user._id;

  Movie.find({ owner: currentOwner }).then((movies) => {
    if (movies.length === 0) {
      return next(new NotFoundError('Нет сохраненных фильмов'));
    }

    return reqSuccess(res, movies);
  })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description, image,
    trailer, nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  const owner = req.user._id;

  Movie.findOne({ owner, movieId }).then((data) => {
    if (data) {
      return next(new ConflictError('Такой фильм уже сохранен!'));
    }

    return Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailer,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner,
    })
      .then((movie) => {
        reqSuccess(res, movie);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          throw new BadRequestError('Переданы некорректные данные при добавлении фильма');
        }
        throw err;
      })
      .catch(next);
  }).catch(next);
};

module.exports.deleteMovieId = (req, res, next) => {
  Movie.findById(req.params.movieId).then((movie) => {
    if (!movie) {
      return next(new NotFoundError('Фильм с указанным _id не найден'));
    }
    if (req.user._id !== String(movie.owner)) {
      return next(new ForbiddenError('Доступ запрещен'));
    }

    return Movie.remove(movie)
      .then(() => {
        reqSuccess(res, { message: 'movie deleted' });
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          throw new BadRequestError('Переданы некорректные данные в метод удаления Фильма');
        }
        throw err;
      })
      .catch(next);
  }).catch(next);
};
