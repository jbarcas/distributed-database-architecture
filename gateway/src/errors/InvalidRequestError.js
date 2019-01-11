const ApplicationError = require("./ApplicationError");

class InvalidRequestError extends ApplicationError {
  constructor(message) {
    super(message || "Invalid request", 400);
  }
}

module.exports = InvalidRequestError;
