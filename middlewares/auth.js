const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../utils/classesErrors/UnauthorizedError');

const handleAuthError = () => {
  throw new UnauthorizedError('Необходима авторизация');
};

const extractBearerToken = (header) => header.replace('Bearer ', '');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return handleAuthError();
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, 'super-strong-secret');
  } catch (err) {
    return handleAuthError();
  }

  req.user = payload;

  return next();
};
