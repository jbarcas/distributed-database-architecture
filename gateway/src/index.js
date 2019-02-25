const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./logger");
const users = require("./routes/users");

// Initialize Express
const app = express();

// Use custom logger middleware
app.use(logger.expressMiddleware);

// Parse incoming request bodies
app.use(bodyParser.json());

// Route definitions
app.use("/api/users", users);

// Error handling
app.use((error, req, res, next) => {
  logger.error(error.stack);
  res.status(error.status || 500).json({ message: error.message });
});

module.exports = app;
