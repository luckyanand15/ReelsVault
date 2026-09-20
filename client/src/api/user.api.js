import axiosClient from './axiosClient';

export const createUser = async ({ firstName, lastName, email }) => {
  const { data } = await axiosClient.post('/users', {
    firstName,
    lastName,
    email,
  });
  return data?.data;
};
