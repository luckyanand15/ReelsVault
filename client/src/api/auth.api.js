import axiosClient from './axiosClient';

export const login = async (email, password) => {
  const { data } = await axiosClient.post('/auth/login', { email, password });
  return data?.data;
};

export const logout = async refreshToken => {
  const { data } = await axiosClient.post('/auth/logout', { refreshToken });
  return data;
};

export const requestPasswordReset = async email => {
  const { data } = await axiosClient.post('/auth/password/forgot', { email });
  return data;
};

export const verifyPasswordResetOtp = async (email, code) => {
  const { data } = await axiosClient.post('/auth/password/verify', { email, code });
  return data;
};

export const resetPassword = async ({ email, resetToken, password, confirmPassword }) => {
  const { data } = await axiosClient.post('/auth/password/reset', {
    email,
    resetToken,
    password,
    confirmPassword,
  });
  return data;
};
