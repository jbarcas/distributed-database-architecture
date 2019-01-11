const express = require("express");
const uuidv1 = require("uuid/v1");
const userUtils = require("../utils/userUtils");
const db = require("../db");

const router = express.Router();

router.get("/:userId", (req, res) => {
  db.users
    .get(req.params.userId)
    .then(user => {
      console.log("responseUser", user)
      res.status(200).json(user);
    })
    .catch(err => console.log(err));
});

router.post("/", (req, res) => {
  // validate input
  userUtils.validateUserSchema(req.body);

  const user = { id: uuidv1(), ...req.body };

  // Insert the user in 2 db processes
  db.users
    .create(user)
    .then(user => res.status(201).json(user))
    .catch(err => res.status(404).json(err));
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
