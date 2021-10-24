const { isURL } = require('validator');
const BadRequestError = require('./classesErrors/BadRequestError');

module.exports = (value) => {
  const result = isURL(value, { protocols: ['http', 'https', 'ftp'], require_tld: true, require_protocol: true });
  if (result) {
    return value;
  }
  throw new BadRequestError('URL validation err');
};
