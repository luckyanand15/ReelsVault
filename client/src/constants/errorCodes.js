// Values of `code` in the server's error responses. Match on these, never on
// `message`, which is for people and may change wording.
//
// Keep in sync with server/src/constants/errorCodes.js.
export const ERROR_CODES = Object.freeze({
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
