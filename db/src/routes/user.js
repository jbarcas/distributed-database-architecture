const express = require("express");
const logger = require("../logger");

const router = express.Router();

router.get("/:userId", (req, res) => {
  const db = req.app.locals.db;
  const userId = req.params.userId;

  db.get(userId, (err, user) => {
    if (err) {
      logger.error(`RocksDB: error while reading user ${userId}: ${err}`);
      res.status(404).json({ error: err.toString() });
    } else {
      logger.info(`RocksDB: user ${userId} read successfully`);
      res.status(200).json(JSON.parse(user));
    }
  });
});

router.post("/", (req, res) => {
  const db = req.app.locals.db;
  const user = req.body;
  db.put(user.id, Buffer.from(JSON.stringify(user)), err => {
    if (err) {
      logger.error(`RocksDB: error while creating user: ${err}`);
      res.status(404).json({ error: err.toString() });
    } else {
      logger.info(`RocksDB: user ${user.id} created successfully`);
      res.status(201).json(user);
    }
  });
});

router.put("/", (req, res) => {
  const db = req.app.locals.db;
  const user = req.body;
  db.get(user.id, (err, user) => {
    if (err) {
      logger.error(
        `RocksDB: error while updating, user does not exist: ${err}`
      );
      res.status(404).json({ error: err.toString() });
    } else {
      db.put(
        JSON.parse(user).id,
        Buffer.from(JSON.stringify(req.body)),
        err => {
          if (err) {
            logger.error(`RocksDB: error while updating user: ${err}`);
            res.status(400).json({ error: err.toString() });
          } else {
            logger.info(
              `RocksDB: user ${JSON.parse(user).id} updated successfully`
            );
            res.status(200).json(req.body);
          }
        }
      );
    }
  });
});

router.delete("/:userId", (req, res) => {
  const db = req.app.locals.db;
  const userId = req.params.userId;
  db.del(userId, err => {
    if (err) {
      logger.error(`RocksDB: error while deleting user: ${err}`);
      res.status(404).json({ error: err.toString() });
    } else {
      logger.info(`RocksDB: user ${userId} deleted successfully`);
      res.status(204).send();
    }
  });
});

module.exports = router;
