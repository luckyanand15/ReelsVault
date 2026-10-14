import axiosClient from './axiosClient';

export const createUser = async ({
  firstName,
  lastName,
  email,
  verificationToken,
  password,
  confirmPassword,
}) => {
  const { data } = await axiosClient.post('/users', {
    firstName,
    lastName,
    email,
    verificationToken,
    password,
    confirmPassword,
  });
  return data?.data;
};
