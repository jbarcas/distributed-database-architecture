const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const user = require("./routes/user");

// Initialize Express
const app = express();

// Parse incoming request bodies
app.use(bodyParser.json());

// Route definitions
app.use("/api/users", user);

app.get("/*", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "index.html"));
});

// Starts server listening on suitable port (default: 8080)
const port = process.env.PORT || 8080;
app.listen(port, console.log(`Running on localhost:${port}`));
