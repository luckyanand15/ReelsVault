const crypto = require('crypto');
const Otp = require('../models/Otp');

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const SEND_COOLDOWN_SECONDS = 30;

class OtpCooldownError extends Error {}
class EmailNotVerifiedError extends Error {}

const generateCode = () =>
  crypto.randomInt(0, 1000000).toString().padStart(6, '0');

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

  try {
    await Otp.findOneAndUpdate(
      { email, lastSentAt: { $lte: cooldownCutoff } },
      {
        $set: {
          code,
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
      throw new OtpCooldownError('Please wait before requesting another code.');
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

  if (otp.verified) {
    // Idempotent: also protects an already-verified-but-not-yet-consumed
    // record from being wiped out by a stray/duplicate guess before
    // account creation gets a chance to consume it.
    return { valid: true, verificationToken: otp.verificationToken };
  }

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

  if (claimed.code !== code) {
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
  EmailNotVerifiedError,
};
