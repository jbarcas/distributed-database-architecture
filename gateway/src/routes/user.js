const express = require("express");
const uuidv1 = require("uuid/v1");
const userUtils = require("../utils/userUtils");
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

router.post("/", (req, res) => {
  const user = { id: uuidv1(), ...req.body };

  // validate input
  userUtils.validateUserSchema(user);

  // Insert the user in 2 db processes
  db.users
    .create(user)
    .then(user => res.status(201).json(user))
    .catch(err => res.status(err.status).json({ message: err.message }));
});

router.put("/", (req, res) => {
  // validate input
  userUtils.validateUserSchema(req.body);

  // Update the user in 2 db processes
  const user = req.body;
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
