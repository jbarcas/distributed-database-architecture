const joi = require("joi");
const InvalidRequestError = require("../errors/InvalidRequestError");

const userSchema = joi.object().keys({
  id: joi.string().required(),
  name: joi.string().required(),
  email: joi.string().email({ minDomainAtoms: 2 }).required(),
  group: joi.number().integer().required()
});

const validateUserSchema = user => {
  const validateUser = joi.validate(user, userSchema);
  if (validateUser.error) {
    throw new InvalidRequestError(`Malformed payload: ${validateUser.error}`);
  }
};

module.exports = {
  validateUserSchema
};
