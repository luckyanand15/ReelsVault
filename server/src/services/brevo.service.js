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

const sendPasswordChangedEmail = email =>
  sendEmail(
    email,
    'Your ReelsVault password was changed',
    `<p>The password for your ReelsVault account was just changed, and you've been logged out on every device.</p><p>If this was you, you don't need to do anything.</p><p>If it wasn't, reset your password right away from the login screen using "Forgot password".</p>`,
  );

module.exports = { sendOtpEmail, sendPasswordResetEmail, sendPasswordChangedEmail };
