const rocksdb = require("rocksdb");
const logger = require("../logger");

const dbPrimary = process.env.DB_PRIMARY || "/tmp/userdb/primary";
const dbSecondary = process.env.DB_SECONDARY || "/tmp/userdb/secondary";

const db = {
  primary: rocksdb(dbPrimary),
  secondary: rocksdb(dbSecondary)
};

const openDatabase = () => {
  db.primary.open({ compression: false }, err => {
    if (err) {
      logger.error("Error opening primary RocksDb database" + err);
    }
  });
  db.secondary.open({ compression: false }, err => {
    if (err) {
      logger.error("Error opening secondary RocksDb database", err);
    }
  });
  return db;
};

module.exports = {
  openDatabase,
  db
};
