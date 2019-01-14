const axios = require("axios");
const processUtils = require("./utils/processUtils");
const NotFoundError = require("./errors/NotFoundError");
const UnavailableProcessError = require("./errors/UnavailableProcessError");
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
   * Creates an entity into two nodes: if the master node is online and the
   * slave is not, then it only stores the record on the master node.
   */
  create: user => {
    axios.post(`${processUtils.getRedundantEndpoint(user.id)}`, user);
    return axios
      .post(`${processUtils.getEndpoint(user.id)}`, user)
      .then(user => user.data)
      .catch(() => {
        throw new UnavailableProcessError();
      });
  },

  /**
   * Read an entity from RocksDB processes. It tries to read from the master node,
   * if it is offline, then tries to read from slave node. If both of them are
   * offline then throws an 503 error (Service Unavailable).
   */
  get: userId =>
    axios
      .get(`${processUtils.getEndpoint(userId)}/${userId}`)
      .then(user => user.data)
      .catch(err =>
        axios
          .get(`${processUtils.getRedundantEndpoint(userId)}/${userId}`)
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
   * Updates an entity into two nodes: if the master node is online and the
   * slave is not, then it only updates the record on the master node.
   */
  update: user => {
    axios.put(`${processUtils.getRedundantEndpoint(user.id)}`, user);
    return axios
      .put(`${processUtils.getEndpoint(user.id)}`, user)
      .then(user => user.data)
      .catch(err => {
        if (err.errno === "ENOTFOUND") {
          throw new UnavailableProcessError();
        } else {
          throw new NotFoundError();
        }
      });
  },

  /**
   * Deletes an entity into two nodes: if the master node is online and the
   * slave is not, then it only deletes the record on the master node.
   */
  delete: userId => {
    axios.delete(`${processUtils.getRedundantEndpoint(userId)}/${userId}`);
    return axios
      .delete(`${processUtils.getEndpoint(userId)}/${userId}`)
      .catch(err => {
        if (err.errno === "ENOTFOUND") {
          throw new UnavailableProcessError();
        } else {
          throw new NotFoundError();
        }
      });
  },

  count: () =>
    axios
      .all(getRequests())
      .then(
        axios.spread((...responses) => {
          let count = 0;
          for (const response of responses) {
            count += response.data.count;
          }
          return count / 2;
        })
      )
      .catch(err => {
        console.log(err);
      })
};

module.exports = {
  users
};
