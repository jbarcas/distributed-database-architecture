const express = require("express");
const path = require("path");
const { exec } = require("child_process");
const logger = require("../logger");
const { db } = require("../utils/rocksdb");

const router = express.Router();

const getRocksdb = value =>
  value.toLowerCase() === "primary" ? db.primary : db.secondary;

const handleGetError = (err, res, errMessage) => {
  const error = err.toString();
  if (error === "Error: NotFound: ") {
    logger.error(`${errMessage}: ${err}`);
    res.status(404).json({ error });
  } else {
    res.status(500).json({ error });
  }
};

router.get("/count", (req, res) => {
  const countScript = path.join(__dirname, "..", "scripts", "count.sh");
  exec(countScript, (err, count) => {
    if (err) {
      logger.error(err);
      res.status(500).json({ message: "Error at executing script for COUNT operation" });
    }
    res.status(200).json({ count: parseInt(count) });
  });
});

router.get("/", (req, res) => {
  const listScript = path.join(__dirname, "..", "scripts", "list.sh");
  exec(listScript, (err, stdout) => {
    if (err) {
      logger.error(err);
      res.status(500).json({ message: "Error at executing script for LIST operation" });
    }
    const users = `[${stdout.trim()}]`;
    res.status(200).json(JSON.parse(users));
  });
});

router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  const rocksdb = getRocksdb(req.query.db);
  rocksdb.get(userId, (err, user) => {
    if (err) {
      handleGetError(err, res, `RocksDB: error while reading user ${userId}`);
    } else {
      logger.info(`RocksDB: user ${userId} read successfully`);
      res.status(200).json(JSON.parse(user));
    }
  });
});

router.post("/", (req, res) => {
  const user = req.body;
  const rocksdb = getRocksdb(req.query.db);
  rocksdb.put(user.id, Buffer.from(JSON.stringify(user)), err => {
    if (err) {
      logger.error(`RocksDB: error while creating user: ${err}`);
      res.status(404).json({ error: err.toString() });
    }
    logger.info(`RocksDB: user ${user.id} created successfully`);
    res.status(201).json(user);
  });
});

router.put("/", (req, res) => {
  const userId = req.body.id;
  const rocksdb = getRocksdb(req.query.db);
  rocksdb.get(userId, (err, user) => {
    if (err) {
      handleGetError(err, res,`RocksDB: error at updating, user ${userId} does not exist`);
    } else {
      rocksdb.put(
        JSON.parse(user).id,
        Buffer.from(JSON.stringify(req.body)),
        err => {
          if (err) {
            logger.error(`RocksDB: error while updating user: ${err}`);
            res.status(400).json({ error: err.toString() });
          } else {
            logger.info(`RocksDB: user ${JSON.parse(user).id} updated successfully`);
            res.status(200).json(req.body);
          }
        }
      );
    }
  });
});

router.delete("/:userId", (req, res) => {
  const userId = req.params.userId;
  const rocksdb = getRocksdb(req.query.db);
  rocksdb.get(userId, (err, user) => {
    if (err) {
      handleGetError(err, res, `RocksDB: error at deleting, user ${userId} does not exist`);
    } else {
      rocksdb.del(userId, err => {
        if (err) {
          logger.error(`RocksDB: error while deleting user: ${err}`);
          res.status(404).json({ error: err.toString() });
        }
        logger.info(`RocksDB: user ${userId} deleted successfully`);
        res.status(204).send();
      });
    }
  });
});

module.exports = router;
