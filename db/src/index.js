const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const rocksdb = require("rocksdb");

const logger = require("./logger");
const user = require("./routes/user");

// Initialize Express
const app = express();

// Use custom logger middleware
app.use(logger.expressMiddleware);

// Parse incoming request bodies
app.use(bodyParser.json());

// Create RocksDB instance
const db = rocksdb("/tmp/userdb");

// Use db instance in routes
app.locals.db = db;

// Open a databse connection
db.open(err => {
  if (err) {
    console.log("Error opening RocksDb database", err);
  }
});

// Route definitions
app.use("/api/users", user);

app.get("/*", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "index.html"));
});

// Error handling
app.use((error, req, res, next) => {
  logger.error(error.stack);
  res.status(error.status || 500).json({ message: error.message });
});

// Starts server listening on suitable port
const port = process.env.PORT || 8081;
app.listen(port, logger.info(`Running on localhost:${port}`));
