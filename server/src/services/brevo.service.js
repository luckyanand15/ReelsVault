const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendOtpEmail = async (email, code, ttlMinutes) => {
  try {
    await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email }],
        subject: 'Your ReelsVault verification code',
        htmlContent: `<p>Your ReelsVault verification code is <strong>${code}</strong>.</p><p>This code expires in ${ttlMinutes} minutes.</p>`,
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
    throw new Error(`Failed to send OTP email: ${errorBody}`);
  }
};

module.exports = { sendOtpEmail };
