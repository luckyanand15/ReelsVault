// Machine-readable codes sent as `code` in error responses. The client matches
// on these, never on `message`, so treat each value as part of the API: add
// new ones freely, but don't rename or remove one the app still checks.
//
// Keep in sync with client/src/constants/errorCodes.js.
const ERROR_CODES = Object.freeze({
  // Generic
  RATE_LIMITED: 'RATE_LIMITED',

  // Auth
  LOGIN_LOCKED: 'LOGIN_LOCKED',
  RESET_TOKEN_INVALID: 'RESET_TOKEN_INVALID',

  // Account (profile changes)
  REAUTH_REQUIRED: 'REAUTH_REQUIRED',
  CHANGE_TOKEN_INVALID: 'CHANGE_TOKEN_INVALID',

  // OTP
  OTP_DAILY_LIMIT: 'OTP_DAILY_LIMIT',
  OTP_COOLDOWN: 'OTP_COOLDOWN',

  // Reels
  REEL_DAILY_LIMIT: 'REEL_DAILY_LIMIT',
  REEL_DUPLICATE: 'REEL_DUPLICATE',
});

module.exports = { ERROR_CODES };
