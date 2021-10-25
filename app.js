require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const helmet = require('helmet');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const limiter = require('./utils/limiter');

const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./utils/classesErrors/NotFoundError');

const { PORT = 3000, NODE_ENV, MONGO } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());

app.use(require('./middlewares/cors'));

mongoose.connect(NODE_ENV === 'production' ? MONGO : 'mongodb://localhost:27017/moviesdb');

app.use(requestLogger);

app.use(rateLimit(limiter));

app.use(require('./routes/auth'));

app.use(auth);

app.use(require('./routes/users'));
app.use(require('./routes/movies'));

app.use('*', () => { throw new NotFoundError('Страница не найдена'); });

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'Ошибка сервера' : message });
  next();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
