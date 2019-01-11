const express = require("express");

const router = express.Router();

router.get("/:userId", (req, res) => {
  const db = req.app.locals.db;
  const userId = req.params.userId;
  db.get(userId, (err, user) => {
    if (err) {
      res.status(404).json({ error: err.toString() });
    } else {
      res.status(200).json(JSON.parse(user));
    }
  });
});

router.post("/", (req, res) => {
  const db = req.app.locals.db;
  const user = req.body;
  db.put(user.id, Buffer.from(JSON.stringify(user)), err => {
    if (err) {
      res.status(404).json({ error: err.toString() });
    } else {
      console.log("User saved!");
      res.status(201).json(user);
    }
  });
});

router.put("/", (req, res) => {
  const db = req.app.locals.db;
  const user = req.body;
  db.put(user.id, Buffer.from(JSON.stringify(user)), err => {
    if (err) {
      res.status(400).json({ error: err.toString() });
    } else {
      console.log("User updated!");
      res.status(200).json(user);
    }
  });
});

router.delete("/:userId", (req, res) => {
  const db = req.app.locals.db;
  const userId = req.params.userId;
  db.del(userId, err => {
    if (err) {
      res.status(404).json({ error: err.toString() });
    } else {
      console.log("User deleted!");
      res.status(204).send();
    }
  });
});

module.exports = router;
