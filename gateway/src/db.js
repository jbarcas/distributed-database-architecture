const axios = require("axios");

const processUtils = require("./utils/processUtils");
const NotFoundError = require("./errors/NotFoundError");
const UnavailableProcessError = require("./errors/UnavailableProcessError");

// The following funcions are required for concurrent creation
const createUser = user =>
  axios.post(`${processUtils.getEndpoint(user.id)}`, user);
const createRedundantUser = user =>
  axios.post(`${processUtils.getRedundantEndpoint(user.id)}`, user);

// The following funcions are required for concurrent update
const updateUser = user =>
  axios.put(`${processUtils.getEndpoint(user.id)}`, user);
const updateRedundantUser = user =>
  axios.put(`${processUtils.getRedundantEndpoint(user.id)}`, user);

// The following funcions are required for concurrent deletion
const deleteUser = userId =>
  axios.delete(`${processUtils.getEndpoint(userId)}/${userId}`);
const deleteRedundantUser = userId =>
  axios.delete(`${processUtils.getRedundantEndpoint(userId)}/${userId}`);

// Store, concurrently, the user in two database processes
const users = {
  create: user =>
    axios
      .all([createUser(user), createRedundantUser(user)])
      .then(
        axios.spread((user, redundantUser) => {
          return user.data || redundantUser.data;
        })
      )
      .catch(err => {
        throw new UnavailableProcessError();
      }),

  get: userId =>
    axios
      .get(`${processUtils.getEndpoint(userId)}/${userId}`)
      .then(user => user.data)
      .catch(() =>
        axios
          .get(`${processUtils.getRedundantEndpoint(userId)}/${userId}`)
          .then(user => user.data)
          .catch(error => {
            throw new NotFoundError();
          })
      ),

  update: user =>
    axios
      .all([updateUser(user), updateRedundantUser(user)])
      .then(
        axios.spread((user, redundantUser) => {
          return user.data || redundantUser.data;
        })
      )
      .catch(err => {
        throw new UnavailableProcessError();
      }),

  delete: userId =>
    axios
      .all([deleteUser(userId), deleteRedundantUser(userId)])
      .then(() => {})
      .catch(err => {
        throw new UnavailableProcessError();
      })
};

module.exports = {
  users
};
