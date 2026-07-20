import axiosClient from './axiosClient';

export const fetchCategories = async () => {
  const { data } = await axiosClient.get('/categories');
  return data?.data;
};

export const createCategory = async ({ title, icon }) => {
  const { data } = await axiosClient.post('/categories', { title, icon });
  return data?.data;
};

export const updateCategory = async (id, { title, icon }) => {
  const { data } = await axiosClient.put(`/categories/${id}`, {
    title,
    icon,
  });
  return data?.data;
};

export const deleteCategory = async id => {
  const { data } = await axiosClient.delete(`/categories/${id}`);
  return data?.data;
};

export const reorderCategories = async order => {
  const { data } = await axiosClient.patch('/categories/reorder', { order });
  return data?.data;
};
