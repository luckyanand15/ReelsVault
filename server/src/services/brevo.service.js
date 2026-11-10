const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async (email, subject, htmlContent) => {
  try {
    await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
      },
    );
  } catch (err) {
    const errorBody = err.response ? JSON.stringify(err.response.data) : err.message;
    throw new Error(`Failed to send email: ${errorBody}`);
  }
};

const sendOtpEmail = (email, code, ttlMinutes) =>
  sendEmail(
    email,
    'Your ReelsVault verification code',
    `<p>Your ReelsVault verification code is <strong>${code}</strong>.</p><p>This code expires in ${ttlMinutes} minutes.</p>`,
  );

const sendPasswordResetEmail = (email, code, ttlMinutes) =>
  sendEmail(
    email,
    'Reset your ReelsVault password',
    `<p>Your ReelsVault password reset code is <strong>${code}</strong>.</p><p>This code expires in ${ttlMinutes} minutes.</p><p>If you didn't ask to reset your password, you can ignore this email. Your password won't change.</p>`,
  );

// keptCurrentDevice: the change was made from inside the app, which stays
// logged in; every other device is logged out.
const sendPasswordChangedEmail = (email, { keptCurrentDevice = false } = {}) =>
  sendEmail(
    email,
    'Your ReelsVault password was changed',
    `<p>The password for your ReelsVault account was just changed, and you've been logged out on ${keptCurrentDevice ? 'your other devices' : 'every device'}.</p><p>If this was you, you don't need to do anything.</p><p>If it wasn't, reset your password right away from the login screen using "Forgot password".</p>`,
  );

const sendPasswordChangeOtpEmail = (email, code, ttlMinutes) =>
  sendEmail(
    email,
    'Confirm your ReelsVault password change',
    `<p>Your ReelsVault code to change your password is <strong>${code}</strong>.</p><p>This code expires in ${ttlMinutes} minutes.</p><p>If you didn't ask to change your password, someone may know your current one. Reset it from the login screen using "Forgot password".</p>`,
  );

const sendEmailChangeOtpEmail = (email, code, ttlMinutes) =>
  sendEmail(
    email,
    'Confirm your new ReelsVault email',
    `<p>Your ReelsVault code to confirm this email address is <strong>${code}</strong>.</p><p>This code expires in ${ttlMinutes} minutes.</p><p>If you didn't ask for this, you can ignore this email.</p>`,
  );

// Sent to the old address, so its owner notices a change they didn't make.
const sendEmailChangedEmail = (oldEmail, newEmail) =>
  sendEmail(
    oldEmail,
    'Your ReelsVault email was changed',
    `<p>The email for your ReelsVault account was just changed to <strong>${newEmail}</strong>. This address will no longer be used to log in.</p><p>If this wasn't you, someone else may have access to your account.</p>`,
  );

const sendAccountDeleteOtpEmail = (email, code, ttlMinutes) =>
  sendEmail(
    email,
    'Confirm deleting your ReelsVault account',
    `<p>Your ReelsVault code to delete your account is <strong>${code}</strong>.</p><p>This code expires in ${ttlMinutes} minutes.</p><p>If you didn't ask to delete your account, don't share this code with anyone. Your account stays as it is.</p>`,
  );

const sendAccountDeletedEmail = email =>
  sendEmail(
    email,
    'Your ReelsVault account was deleted',
    `<p>Your ReelsVault account has been deleted, along with all your saved reels and categories.</p><p>Thanks for using ReelsVault. You're welcome to sign up again any time.</p>`,
  );

module.exports = {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendPasswordChangeOtpEmail,
  sendEmailChangeOtpEmail,
  sendEmailChangedEmail,
  sendAccountDeleteOtpEmail,
  sendAccountDeletedEmail,
};
