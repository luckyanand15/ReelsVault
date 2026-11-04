const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_ALGORITHM = 'HS256';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Add it to the server environment.');
}

const signAccessToken = userId =>
  jwt.sign({}, JWT_SECRET, {
    subject: userId,
    expiresIn: JWT_ACCESS_EXPIRES_IN,
    algorithm: JWT_ALGORITHM,
  });

// Pin the algorithm so a token can't pick its own (e.g. "none").
const verifyAccessToken = token =>
  jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });

// Proves the user re-entered their password moments ago, for account changes.
// Signed with a key derived from JWT_SECRET rather than JWT_SECRET itself, so
// verifyAccessToken rejects it: it must never work as an access token.
const REAUTH_SECRET = crypto.createHmac('sha256', JWT_SECRET).update('reauth').digest('hex');
const REAUTH_AUDIENCE = 'reauth';
const REAUTH_EXPIRES_IN = '10m';

const signReauthToken = userId =>
  jwt.sign({}, REAUTH_SECRET, {
    subject: userId,
    audience: REAUTH_AUDIENCE,
    expiresIn: REAUTH_EXPIRES_IN,
    algorithm: JWT_ALGORITHM,
  });

const verifyReauthToken = token =>
  jwt.verify(token, REAUTH_SECRET, {
    algorithms: [JWT_ALGORITHM],
    audience: REAUTH_AUDIENCE,
  });

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signReauthToken,
  verifyReauthToken,
};
