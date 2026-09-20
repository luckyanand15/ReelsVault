import axiosClient from './axiosClient';

export const sendOtp = async email => {
  const { data } = await axiosClient.post('/otp/send', { email });
  return data;
};

export const verifyOtp = async (email, code) => {
  const { data } = await axiosClient.post('/otp/verify', { email, code });
  return data;
};
