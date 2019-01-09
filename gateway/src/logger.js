const { createLogger, format, transports } = require("winston");
const morgan = require("morgan");

//
// Custom logging levels: https://github.com/winstonjs/winston/tree/master/examples
//
const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5,
    silly: 6,
    custom: 7
  },
  colors: {
    error: "red",
    debug: "blue",
    warn: "yellow",
    data: "grey",
    info: "green",
    verbose: "cyan",
    silly: "magenta",
    custom: "yellow"
  }
};

let logger = createLogger({
  levels: config.levels,
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()],
  exitOnError: false
});

logger.stream = {
  write: message => {
    logger.info(message);
  }
};

logger.expressMiddleware = morgan("combined", { stream: logger.stream });

module.exports = logger;
