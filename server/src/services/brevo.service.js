const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendOtpEmail = async (email, code, ttlMinutes) => {
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email }],
      subject: 'Your ReelsVault verification code',
      htmlContent: `<p>Your ReelsVault verification code is <strong>${code}</strong>.</p><p>This code expires in ${ttlMinutes} minutes.</p>`,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send OTP email: ${errorBody}`);
  }
};

module.exports = { sendOtpEmail };
