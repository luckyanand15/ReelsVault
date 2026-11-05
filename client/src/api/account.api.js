import axiosClient from './axiosClient';

// Returns the updated user.
export const updateName = async ({ firstName, lastName }) => {
  const { data } = await axiosClient.patch('/account/name', { firstName, lastName });
  return data?.data;
};

// Checks the current password; returns the short-lived reauthToken that the
// email and password change steps below all need.
export const reauthenticate = async password => {
  const { data } = await axiosClient.post('/account/reauth', { password });
  return data?.data?.reauthToken;
};

export const sendEmailChangeOtp = async ({ reauthToken, newEmail }) => {
  const { data } = await axiosClient.post('/account/email/otp', { reauthToken, newEmail });
  return data;
};

// Switches the email once the code is right; returns the updated user.
export const confirmEmailChange = async ({ reauthToken, newEmail, code }) => {
  const { data } = await axiosClient.post('/account/email/confirm', {
    reauthToken,
    newEmail,
    code,
  });
  return data?.data;
};

// The code goes to the account's current email.
export const sendPasswordChangeOtp = async ({ reauthToken }) => {
  const { data } = await axiosClient.post('/account/password/otp', { reauthToken });
  return data;
};

export const verifyPasswordChangeOtp = async ({ reauthToken, code }) => {
  const { data } = await axiosClient.post('/account/password/verify', { reauthToken, code });
  return data?.data?.changeToken;
};

// Returns a fresh { accessToken, refreshToken }: every session, this one
// included, is revoked on the server.
export const changePassword = async ({ reauthToken, changeToken, password, confirmPassword }) => {
  const { data } = await axiosClient.post('/account/password', {
    reauthToken,
    changeToken,
    password,
    confirmPassword,
  });
  return data?.data;
};
