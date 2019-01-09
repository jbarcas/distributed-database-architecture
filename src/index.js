const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

// Initialize Express
const app = express();

// Parse incoming request bodies
app.use(bodyParser.json());

// Route definitions
app.get("/foo", (req, res) => {
  res.status(200).json({ success: true });
});

app.get("/*", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "index.html"));
});

// Starts server listening on port 8080
app.listen(8080, console.log("Running on localhost:8080"));
