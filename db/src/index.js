const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./logger");
const user = require("./routes/user");
const rocksdbUtils = require("./utils/rocksdbUtils");

// Initialize Express
const app = express();

// Use custom logger middleware
app.use(logger.expressMiddleware);

// Parse incoming request bodies
app.use(bodyParser.json());

// Create RocksDB partitions
rocksdbUtils.openDatabase();

// Route definitions
app.use("/api/users", user);

// Error handling
app.use((error, req, res, next) => {
  logger.error(error.stack);
  res.status(error.status || 500).json({ message: error.message });
});

// Starts server listening on suitable port
const port = process.env.PORT || 8081;
app.listen(port, logger.info(`DB process running on localhost:${port}`));
