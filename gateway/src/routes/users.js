const express = require("express");
const shortid = require("shortid");
const userValidator = require("../utils/userValidator");
const db = require("../db");

const router = express.Router();

router.get("/count", (req, res) => {
  db.users
    .count()
    .then(count => res.status(200).json({ count }))
    .catch(err => res.status(err.status).json({ message: err.message }));
});

router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  db.users
    .get(userId)
    .then(user => res.status(200).json(user))
    .catch(err => res.status(err.status).json({ message: err.message }));
});

router.get("/", (req, res) => {
  const offset = req.query.offset || 0;
  let limit = 10;
  if ("limit" in req.query && req.query.limit > 0 && req.query.limit < 100) {
    limit = req.query.limit;
  }
  db.users
    .list(offset, limit)
    .then(users => res.status(200).json(users))
    .catch(err => res.status(err.status).json({ message: err.message }));
});

router.post("/", (req, res) => {
  const user = { id: shortid.generate(), ...req.body };
  userValidator.validate(user);

  // Insert the user in 2 db processes
  db.users
    .create(user)
    .then(user => res.status(201).json(user))
    .catch(err => res.status(err.status).json({ message: err.message }));
});

router.put("/", (req, res) => {
  const user = req.body;
  userValidator.validate(user);

  // Update the user in 2 db processes
  db.users
    .update(user)
    .then(user => res.status(200).json(user))
    .catch(err => res.status(err.status).json({ message: err.message }));
});

router.delete("/:userId", (req, res) => {
  const userId = req.params.userId;
  db.users
    .delete(userId)
    .then(() => res.status(204).send())
    .catch(err => res.status(err.status).json(err));
});

module.exports = router;
