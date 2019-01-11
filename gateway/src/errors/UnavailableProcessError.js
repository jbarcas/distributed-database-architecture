const ApplicationError = require("./ApplicationError");

class UnavailableProcessError extends ApplicationError {
  constructor(message) {
    super(message || "DB process not available", 503);
  }
}

module.exports = UnavailableProcessError;
