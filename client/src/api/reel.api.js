import axiosClient from './axiosClient';

export const fetchReels = async () => {
  const { data } = await axiosClient.get('/reels');
  return data?.data;
};

export const createReel = async ({ categoryId, title, url }) => {
  const { data } = await axiosClient.post('/reels', { categoryId, title, url });
  return data?.data;
};

// Asks the server to look the thumbnail up again; returns the updated reel.
export const refreshReelThumbnail = async id => {
  const { data } = await axiosClient.post(`/reels/${id}/thumbnail`);
  return data?.data;
};
