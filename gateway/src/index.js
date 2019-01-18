const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./logger");
const user = require("./routes/user");

// Initialize Express
const app = express();

// Use custom logger middleware
app.use(logger.expressMiddleware);

// Parse incoming request bodies
app.use(bodyParser.json());

// Route definitions
app.use("/api/users", user);

// Error handling
app.use((error, req, res, next) => {
  logger.error(error.stack);
  res.status(error.status || 500).json({ message: error.message });
});

// Starts server listening on suitable port (default: 8080)
const port = process.env.PORT || 8080;
if (!module.parent) {
  app.listen(port, logger.info(`API gateway running on localhost:${port}`));
}

module.exports = app;
