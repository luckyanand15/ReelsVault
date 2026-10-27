import axiosClient from './axiosClient';

export const fetchReels = async () => {
  const { data } = await axiosClient.get('/reels');
  return data?.data;
};

export const createReel = async ({ categoryId, title, url }) => {
  const { data } = await axiosClient.post('/reels', { categoryId, title, url });
  return data?.data;
};
