const express = require("express");
const uuidv1 = require("uuid/v1");
const userUtils = require("../utils/userUtils");

const router = express.Router();

router.get("/:userId", (req, res) => {
  res.sendStatus(200);
});

router.post("/", (req, res) => {
  // validate input
  userUtils.validateUserSchema(req.body);

  // Temporarily send an optimistic response to API client
  const user = { id: uuidv1(), ...req.body };
  res.status(201).json(user);
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
