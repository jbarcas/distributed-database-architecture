const DB_N = process.env.DB_N || 3;

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

const getDbProcess = uuid => {
  const hash = Math.abs(hashCode(uuid));
  const dbProcess = hash % DB_N;
  return dbProcess;
};

const getEndpoint = uuid => {
  const dbProcess = getDbProcess(uuid);
  return `http://db-${dbProcess}:8081`;
};

const getRedundantEndpoint = uuid => {
  const dbProcess = (getDbProcess(uuid) + 1) % DB_N;
  return `http://db-${dbProcess}:8081`;
};

module.exports = {
  getEndpoint,
  getRedundantEndpoint
};
