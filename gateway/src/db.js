const axios = require("axios");
const processUtils = require("./utils/processUtils");
const NotFoundError = require("./errors/NotFoundError");
const UnavailableProcessError = require("./errors/UnavailableProcessError");
const logger = require("./logger");

const DB_N = process.env.DB_N || 3;
const DB_PORT = process.env.DB_PORT || 8081;

/**
 * Generates an array of requests necessary to query the number of entities
 * to each of the nodes.
 */
const getRequests = () => {
  requests = [];
  for (let i = 0; i < DB_N; i++) {
    const request = axios.get(`http://db-${i}:${DB_PORT}/api/users/count`);
    requests.push(request);
  }
  return requests;
};

const throwError = error => {
  if (error.errno === "ENOTFOUND") {
    throw new UnavailableProcessError();
  } else {
    throw new NotFoundError();
  }
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
      .post(processUtils.getPrimaryEndpoint(user), user)
      .then(response => {
        axios
          .post(processUtils.getSecondaryEndpoint(user), user)
          .catch(err => logger.warn(err.message));
        return response.data;
      })
      .catch(() => {
        throw new UnavailableProcessError();
      }),

  /**
   * Read an entity from RocksDB processes. It tries to read from the primary node,
   * if it is down, then tries to read from secondary node. If both of them are
   * down then throws an 503 error (Service Unavailable).
   */
  get: userId =>
    axios
      .get(processUtils.getPrimaryEndpoint(userId))
      .then(user => user.data)
      .catch(err =>
        axios
          .get(processUtils.getSecondaryEndpoint(userId))
          .then(user => user.data)
          .catch(err => throwError(err))
      ),

  /**
   * Updates an entity into two nodes:
   * - if the primary node is UP: it updates the record on it and tries to update
   *   the record on secondary node.
   * - if the primary node is DOWN: the method return a 503 (Serive Unavailable)
   */
  update: user =>
    axios
      .put(processUtils.getPrimaryEndpoint(user), user)
      .then(response => {
        axios
          .put(processUtils.getSecondaryEndpoint(user), user)
          .catch(err => logger.warn(err.message));
        return response.data;
      })
      .catch(err => throwError(err)),

  /**
   * Deletes an entity in two nodes:
   * - if the primary node is UP: it deletes the record on it and tries to delete
   *   the record on the secondary node.
   * - if the primary node is DOWN: the method return a 503 (Serive Unavailable)
   */
  delete: userId =>
    axios
      .delete(processUtils.getPrimaryEndpoint(userId))
      .then(() => {
        axios
          .delete(processUtils.getSecondaryEndpoint(userId))
          .catch(err => logger.warn(err.message));
        return;
      })
      .catch(err => throwError(err)),

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
