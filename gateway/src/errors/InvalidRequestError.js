const ApplicationError = require("./ApplicationError");

class InvalidRequestError extends ApplicationError {
  constructor(message) {
    super(message || "Invalid request", 404);
  }
}

module.exports = InvalidRequestError;
