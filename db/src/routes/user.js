const express = require("express");
const path = require("path");
const { exec } = require("child_process");
const logger = require("../logger");
const { db } = require("../utils/rocksdbUtils");

const router = express.Router();

const getRocksdb = value =>
  value.toLowerCase() === "primary" ? db.primary : db.secondary;

router.get("/count", (req, res) => {
  exec(
    path.join(__dirname, "..", "scripts", "count.sh"),
    (err, stdout, stderr) => {
      if (err) {
        logger.error(err);
        return;
      }
      res.status(200).json({ count: parseInt(stdout) });
    }
  );
});

router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  rocksdb = getRocksdb(req.query.db);
  rocksdb.get(userId, (err, user) => {
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
  const user = req.body;
  rocksdb = getRocksdb(req.query.db);
  rocksdb.put(user.id, Buffer.from(JSON.stringify(user)), err => {
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
  const user = req.body;
  rocksdb = getRocksdb(req.query.db);
  rocksdb.get(user.id, (err, user) => {
    if (err) {
      logger.error(`RocksDB: error at updating, user does not exist: ${err}`);
      res.status(404).json({ error: err.toString() });
    } else {
      rocksdb.put(
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
  const userId = req.params.userId;
  rocksdb = getRocksdb(req.query.db);
  rocksdb.get(userId, (err, user) => {
    if (err) {
      logger.error(`RocksDB: error at deleting, user does not exist: ${err}`);
      res.status(404).json({ error: err.toString() });
    } else {
      rocksdb.del(userId, err => {
        if (err) {
          logger.error(`RocksDB: error while deleting user: ${err}`);
          res.status(404).json({ error: err.toString() });
        } else {
          logger.info(`RocksDB: user ${userId} deleted successfully`);
          res.status(204).send();
        }
      });
    }
  });
});

module.exports = router;
