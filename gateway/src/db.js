const axios = require("axios");
const userUtils = require("./utils/userUtils");
const processUtils = require("./utils/processUtils");

const createUser = user => {
  const endpoint = processUtils.getEndpoint(user.id);
  return axios.post(`${endpoint}/api/users`, user);
};

const createRedundantUser = user => {
  const redundantEndpoint = processUtils.getRedundantEndpoint(user.id);
  return axios.post(`${redundantEndpoint}/api/users`, user);
};

// Store, concurrently, the user in two database processes
const users = {
  create: user =>
    axios
      .all([
        createUser(user),
        createRedundantUser(user).catch(() => {
          return false;
        })
      ])
      .then(
        axios.spread((user, redundantUser) => {
          // Both requests are now complete
          return user.data;
        })
      ),
  get: userId =>
    axios
      .get(`${processUtils.getEndpoint(userId)}/api/users/${userId}`)
      .then(user => user.data)
      .catch(error =>
        axios
          .get(
            `${processUtils.getRedundantEndpoint(userId)}/api/users/${userId}`
          )
          .then(user => user.data)
          .catch(error => error)
      )
};

module.exports = {
  users
};
