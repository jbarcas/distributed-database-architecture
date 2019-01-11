const joi = require("joi");
const InvalidRequestError = require("../errors/InvalidRequestError");

const userSchema = joi.object().keys({
  id: joi.string(),
  name: joi.string(),
  email: joi.string().email({ minDomainAtoms: 2 }),
  group: joi.number().integer()
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
