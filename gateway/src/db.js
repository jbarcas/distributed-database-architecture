const axios = require("axios");
const processUtils = require("./utils/processUtils");
const NotFoundError = require("./errors/NotFoundError");
const UnavailableProcessError = require("./errors/UnavailableProcessError");

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
  }
};

module.exports = {
  users
};
