const rocksdb = require("rocksdb");
const logger = require("../logger");

const dbPrimary = process.env.DB_PRIMARY || "/tmp/userdb/primary";
const dbSecondary = process.env.DB_SECONDARY || "/tmp/userdb/secondary";

const db = {
  primary: rocksdb(dbPrimary),
  secondary: rocksdb(dbSecondary)
};

const init = () => {
  Object.values(db).map(partition => {
    partition.open({ compression: false }, err => {
      if (err) { logger.error("Error opening RocksDB" + err); }
    });
  });
  return db;
};

module.exports = {
  init,
  db
};
