import axiosClient from './axiosClient';

export const checkEmail = async email => {
  const { data } = await axiosClient.post('/auth/check-email', { email });
  return Boolean(data?.data?.exists);
};

export const login = async (email, password) => {
  const { data } = await axiosClient.post('/auth/login', { email, password });
  return data?.data;
};

export const logout = async refreshToken => {
  const { data } = await axiosClient.post('/auth/logout', { refreshToken });
  return data;
};
