const crypto = require('crypto');

// PREFIX + YYYYMMDDHHmmss (UTC) + 8 random hex chars, e.g. USER20261020143005A7F3C91E.
// No shared counter to fall out of sync; the random suffix keeps IDs created
// in the same second from colliding.
const generateId = prefix => {
  const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();

  return `${prefix}${timestamp}${suffix}`;
};

module.exports = generateId;
