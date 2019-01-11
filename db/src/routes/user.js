const express = require("express");
const uuidv1 = require("uuid/v1");
const userUtils = require("../utils/userUtils");

const router = express.Router();

router.get("/:userId", (req, res) => {
  const db = req.app.locals.db;
  const userId = req.params.userId;
  db.get(userId, (err, user) => {
    if (err) {
      console.log("err", err);
      res.status(404).json({ error: err.toString() });
    } else {
      console.log("user", JSON.parse(user));
      res.status(200).json(JSON.parse(user));
    }
  });
});

router.post("/", (req, res) => {
  const db = req.app.locals.db;
  const user = req.body;
  db.put(user.id, Buffer.from(JSON.stringify(user)), err => {
    if (err) {
      console.log("Error at saving user!", err);
    } else {
      console.log("Succesfully saved!");
      res.status(201).json(user);
    }
  });
});

router.put("/", (req, res) => {
  // validate input
  userUtils.validateUserSchema(req.body);

  // Temporarily send an optimistic response to API client
  res.status(200).json(req.body);
});

router.delete("/:userId", (req, res) => {
  res.sendStatus(204);
});

module.exports = router;
