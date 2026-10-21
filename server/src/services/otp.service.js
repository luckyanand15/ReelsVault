const crypto = require('crypto');
const Otp = require('../models/Otp');
const OtpUsage = require('../models/OtpUsage');

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const SEND_COOLDOWN_SECONDS = 30;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_DAILY_SENDS = 10;
const MAX_DAILY_VERIFY_ATTEMPTS = 20;

class OtpCooldownError extends Error {
  constructor(message, retryAfter) {
    super(message);
    this.retryAfter = retryAfter;
  }
}
class OtpDailyLimitError extends Error {
  constructor(message, retryAfter) {
    super(message);
    this.retryAfter = retryAfter;
  }
}
class EmailNotVerifiedError extends Error {}

// Takes one of today's `field` slots (sends or verifyAttempts) for this email,
// or throws OtpDailyLimitError once all `max` are used.
const claimDailySlot = async (email, field, max) => {
  const now = Date.now();

  // Mongo's TTL sweep only runs about once a minute, so an expired record
  // can still be around. Clear it so this starts a fresh 24h window.
  await OtpUsage.deleteOne({ email, expiresAt: { $lte: new Date(now) } });

  const filter = { email, [field]: { $lt: max } };
  const inc = { $inc: { [field]: 1 } };

  try {
    await OtpUsage.findOneAndUpdate(
      filter,
      { ...inc, $setOnInsert: { expiresAt: new Date(now + DAILY_WINDOW_MS) } },
      { upsert: true },
    );
    return;
  } catch (err) {
    if (err.code !== 11000) {
      throw err;
    }
  }

  // The duplicate key means a record exists that the filter didn't match:
  // either it's at the cap, or a concurrent request inserted it first.
  // Retry without upsert to tell which.
  const claimed = await OtpUsage.findOneAndUpdate(filter, inc);
  if (claimed) {
    return;
  }

  const usage = await OtpUsage.findOne({ email }).select('expiresAt').lean();
  const retryAfter = usage
    ? Math.max(Math.ceil((usage.expiresAt.getTime() - now) / 1000), 1)
    : 1;
  throw new OtpDailyLimitError('Daily OTP limit reached for this email.', retryAfter);
};

const generateCode = () =>
  crypto.randomInt(0, 1000000).toString().padStart(6, '0');

// Only this hash is stored, so a leaked database doesn't hand out live codes.
// Keyed with the server secret (HMAC, not a bare SHA-256): there are only a
// million 6-digit codes, so a plain hash could be reversed by trying them all.
const hashCode = code =>
  crypto.createHmac('sha256', process.env.JWT_SECRET).update(code).digest('hex');

// Constant-time so response timing can't leak how much of the hash matches.
const codesMatch = (expected, actual) =>
  expected.length === actual.length &&
  crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));

const createOtp = async email => {
  // Server-side enforcement: the client's own cooldown UI can be bypassed by
  // calling the API directly, so this is the real anti-spam boundary per address.
  //
  // This has to be a single atomic operation, not a find-then-write: two
  // concurrent requests for the same email could otherwise both pass the
  // cooldown check before either writes, sending two emails. findOneAndUpdate
  // is atomic per document, and the unique index on `email` (see Otp.js) means
  // a losing concurrent request fails with a duplicate-key error instead of
  // silently creating a second record.
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  const cooldownCutoff = new Date(Date.now() - SEND_COOLDOWN_SECONDS * 1000);

  // Claimed before the Otp write below, because that write resets the
  // per-code guess counter — which is exactly what this cap has to bound.
  await claimDailySlot(email, 'sends', MAX_DAILY_SENDS);

  try {
    await Otp.findOneAndUpdate(
      { email, lastSentAt: { $lte: cooldownCutoff } },
      {
        $set: {
          code: hashCode(code),
          expiresAt,
          attempts: 0,
          verified: false,
          verificationToken: null,
          lastSentAt: new Date(),
        },
      },
      { upsert: true },
    );
  } catch (err) {
    if (err.code === 11000) {
      // No code was sent, so give back the daily slot claimed above.
      await OtpUsage.updateOne({ email, sends: { $gt: 0 } }, { $inc: { sends: -1 } });

      // Tell the client how long is left so it can resume its countdown
      // instead of guessing. The record can vanish in between (expired or
      // deleted), in which case the user can retry right away.
      const existing = await Otp.findOne({ email }).select('lastSentAt').lean();
      const elapsedSeconds = existing
        ? (Date.now() - existing.lastSentAt.getTime()) / 1000
        : SEND_COOLDOWN_SECONDS;
      const retryAfter = Math.max(Math.ceil(SEND_COOLDOWN_SECONDS - elapsedSeconds), 1);
      throw new OtpCooldownError('Please wait before requesting another OTP.', retryAfter);
    }
    throw err;
  }

  return code;
};

const verifyOtp = async (email, code) => {
  const otp = await Otp.findOne({ email });

  if (!otp) {
    return { valid: false, message: 'OTP not found. Please request a new code.' };
  }

  // Expiry has to be checked before anything else, including the
  // already-verified short-circuit below — otherwise a verified-but-
  // unconsumed record stays usable past its stated expiry window.
  if (otp.expiresAt < new Date()) {
    await Otp.deleteOne({ _id: otp._id });
    return { valid: false, message: 'OTP has expired. Please request a new code.' };
  }

  // No early return for already-verified records: that handed the
  // verificationToken to anyone who knew the email, whatever code they sent.
  // A verified record goes through the same attempt cap and code check below,
  // and a correct retry still gets the original token via the
  // alreadyVerified fallback at the end.

  // The per-code cap below resets with every new code; this one doesn't, so
  // it bounds the total guesses one email can get per day.
  await claimDailySlot(email, 'verifyAttempts', MAX_DAILY_VERIFY_ATTEMPTS);

  // Atomic check-and-claim: `otp.attempts += 1; otp.save()` was a
  // read-modify-write in application code, so concurrent wrong guesses could
  // race past a stale attempts count and only one increment would stick.
  // findOneAndUpdate applies the filter and the $inc as one document-level
  // operation, so Mongo serializes concurrent guesses — only a request that
  // lands on a true attempts < MAX_ATTEMPTS state can claim a slot, same as
  // if they were processed one at a time. The cap check has to happen before
  // comparing the code (not after) so a correct guess arriving once the cap
  // is already hit still gets rejected, not silently allowed through.
  const claimed = await Otp.findOneAndUpdate(
    { _id: otp._id, attempts: { $lt: MAX_ATTEMPTS } },
    { $inc: { attempts: 1 } },
    { returnDocument: 'after' },
  );

  if (!claimed) {
    await Otp.deleteOne({ _id: otp._id });
    return { valid: false, message: 'Too many incorrect attempts. Please request a new code.' };
  }

  if (!codesMatch(claimed.code, hashCode(code))) {
    return { valid: false, message: 'Invalid OTP code.' };
  }

  // Mark verified rather than deleting: verification and account creation
  // are separate requests, so the proof has to survive until createUser
  // consumes it — otherwise "verified" only ever existed in the client's
  // local state, and nothing server-side stops a request to create a user
  // for an email that was never actually confirmed.
  //
  // The token matters as much as the flag: without it, "verified" is keyed
  // only by email, which isn't secret — any client that knows (or guesses)
  // the target email could race to consume someone else's verification via
  // createUser. Only the client that actually received this response knows
  // the token, so consumeVerifiedOtp can require proof of that, not just
  // proof that verification happened for this address at some point.
  // Conditional on verified: false — if two concurrent requests both submit
  // the correct code (e.g. a double-tap or client retry), only the first to
  // reach this point actually writes a token; the other's filter won't
  // match (verified is already true) and it falls through to reuse the
  // token that actually got persisted, instead of both callers walking away
  // with different tokens where only one matches the database.
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const nowVerified = await Otp.findOneAndUpdate(
    { _id: claimed._id, verified: false },
    { $set: { verified: true, verificationToken } },
    { returnDocument: 'after' },
  );

  if (nowVerified) {
    return { valid: true, verificationToken: nowVerified.verificationToken };
  }

  const alreadyVerified = await Otp.findOne({ _id: claimed._id });
  return { valid: true, verificationToken: alreadyVerified?.verificationToken };
};

const consumeVerifiedOtp = async (email, verificationToken) => {
  // Atomic find+delete: the record can only ever be spent once, requires
  // the exact token issued to the verifying client (not just "verified for
  // this email"), and must still be within its original expiry window even
  // though "verified" alone would otherwise never expire on its own.
  const consumed = await Otp.findOneAndDelete({
    email,
    verified: true,
    verificationToken,
    expiresAt: { $gt: new Date() },
  });
  return Boolean(consumed);
};

module.exports = {
  createOtp,
  verifyOtp,
  consumeVerifiedOtp,
  OTP_TTL_MINUTES,
  OtpCooldownError,
  OtpDailyLimitError,
  EmailNotVerifiedError,
};
