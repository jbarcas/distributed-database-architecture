const DB_N = process.env.DB_N || 3;
const DB_PORT = process.env.DB_PORT || 8081;

const hashCode = uuid => {
  let hash = 0,
    i,
    chr;
  if (uuid.length === 0) return hash;
  for (i = 0; i < uuid.length; i++) {
    chr = uuid.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const isObject = variable => typeof variable === "object";

/**
 * Returns the db process a user belongs to.
 */
const getDbProcess = user => {
  const uuid = isObject(user) ? user.id : user;
  const hash = Math.abs(hashCode(uuid));
  const dbProcess = hash % DB_N;
  return dbProcess;
};

const getUrl = (user, dbProcess) => {
  const protocol = "http";
  const hostname = `db-${dbProcess}`;
  const port = DB_PORT;
  let pathname = "api/users";
  if (!isObject(user)) {
    pathname = pathname.concat(`/${user}`);
  }
  return `${protocol}://${hostname}:${port}/${pathname}`;
};

const getPrimaryEndpoint = user => {
  const dbProcess = getDbProcess(user);
  const url = getUrl(user, dbProcess);
  return url.concat("?db=primary");
};

const getSecondaryEndpoint = user => {
  const dbProcess = (getDbProcess(user) + 1) % DB_N;
  const url = getUrl(user, dbProcess);
  return url.concat("?db=secondary");
};

module.exports = {
  getPrimaryEndpoint,
  getSecondaryEndpoint
};
