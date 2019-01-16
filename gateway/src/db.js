const axios = require("axios");
const processUtils = require("./utils/processUtils");
const NotFoundError = require("./errors/NotFoundError");
const UnavailableProcessError = require("./errors/UnavailableProcessError");
const logger = require("./logger");

const DB_N = process.env.DB_N || 3;
const DB_PORT = process.env.DB_PORT || 8081;

const getRequests = () => {
  requests = [];
  for (let i = 0; i < DB_N; i++) {
    const request = axios.get(`http://db-${i}:${DB_PORT}/api/users/count`);
    requests.push(request);
  }
  return requests;
};

const users = {
  /**
   * Creates an entity into two nodes:
   * - if the primary node is UP: it saves the record on it and tries to save
   *   the record on secondary node.
   * - if the primary node is DOWN: the method return a 503 (Serive Unavailable)
   */
  create: user =>
    axios
      .post(`${processUtils.getEndpoint(user)}`, user)
      .then(response => {
        axios
          .post(`${processUtils.getRedundantEndpoint(user)}`, user)
          .catch(err => logger.warn(err.message));
        return response.data;
      })
      .catch(err => {
        throw new UnavailableProcessError();
      }),

  /**
   * Read an entity from RocksDB processes. It tries to read from the primary node,
   * if it is down, then tries to read from secondary node. If both of them are
   * down then throws an 503 error (Service Unavailable).
   */
  get: userId =>
    axios
      .get(`${processUtils.getEndpoint(userId)}`)
      .then(user => user.data)
      .catch(err =>
        axios
          .get(`${processUtils.getRedundantEndpoint(userId)}`)
          .then(user => user.data)
          .catch(err => {
            if (err.errno === "ENOTFOUND") {
              throw new UnavailableProcessError();
            } else {
              throw new NotFoundError();
            }
          })
      ),

  /**
   * Updates an entity into two nodes:
   * - if the primary node is UP: it updates the record on it and tries to update
   *   the record on secondary node.
   * - if the primary node is DOWN: the method return a 503 (Serive Unavailable)
   */
  update: user =>
    axios
      .put(`${processUtils.getEndpoint(user)}`, user)
      .then(response => {
        axios
          .put(`${processUtils.getRedundantEndpoint(user)}`, user)
          .catch(err => logger.warn(err.message));
        return response.data;
      })
      .catch(err => {
        if (err.errno === "ENOTFOUND") {
          throw new UnavailableProcessError();
        } else {
          throw new NotFoundError();
        }
      }),

  /**
   * Deletes an entity in two nodes:
   * - if the primary node is UP: it deletes the record on it and tries to delete
   *   the record on the secondary node.
   * - if the primary node is DOWN: the method return a 503 (Serive Unavailable)
   */
  delete: userId =>
    axios
      .delete(`${processUtils.getEndpoint(userId)}`)
      .then(() => {
        axios
          .delete(`${processUtils.getRedundantEndpoint(userId)}`)
          .catch(err => logger.warn(err.message));
        return;
      })
      .catch(err => {
        throw new UnavailableProcessError();
      }),

  /**
   * Counts the number of entities in the usersdb database
   */
  count: () =>
    axios
      .all(getRequests())
      .then(
        axios.spread((...responses) => {
          let count = 0;
          for (const response of responses) {
            count += response.data.count;
          }
          return count;
        })
      )
      .catch(err => {
        logger.error(err.message);
        throw new UnavailableProcessError();
      })
};

module.exports = {
  users
};
