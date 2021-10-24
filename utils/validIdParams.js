const { Joi } = require('celebrate');

module.exports = (typeId) => {
  const validation = Joi.string().hex().length(24).required();

  return {
    params: Joi.object().keys({
      [typeId]: validation,
    }),
  };
};
