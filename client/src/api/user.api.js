import axiosClient from './axiosClient';

export const createUser = async ({ firstName, lastName, email, verificationToken }) => {
  const { data } = await axiosClient.post('/users', {
    firstName,
    lastName,
    email,
    verificationToken,
  });
  return data?.data;
};
