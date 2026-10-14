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

module.exports = { signAccessToken, verifyAccessToken };
