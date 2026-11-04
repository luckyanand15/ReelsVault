import axiosClient from './axiosClient';

// One page, newest first. Leave categoryId out for all reels; for the next
// page pass the nextCursor ({ createdAt, id }) the previous one returned,
// which is null on the last page.
export const fetchReels = async ({ categoryId, cursor, limit } = {}) => {
  const { data } = await axiosClient.get('/reels', {
    params: {
      categoryId,
      createdAt: cursor?.createdAt,
      id: cursor?.id,
      limit,
    },
  });
  return { reels: data?.data || [], nextCursor: data?.nextCursor || null };
};

export const createReel = async ({ categoryId, title, url }) => {
  const { data } = await axiosClient.post('/reels', { categoryId, title, url });
  return data?.data;
};

// A suggested title for a link about to be saved, or null when none was
// found (or the lookup failed).
export const fetchReelTitle = async url => {
  try {
    const { data } = await axiosClient.get('/reels/preview', {
      params: { url },
    });
    return data?.data?.title || null;
  } catch {
    return null;
  }
};

// Asks the server to look the thumbnail up again; returns the updated reel.
export const refreshReelThumbnail = async id => {
  const { data } = await axiosClient.post(`/reels/${id}/thumbnail`);
  return data?.data;
};

// Updates the title and/or categories (categoryIds is the full new list);
// returns the updated reel. categoryId is the open category, whose title is
// the one changed (the first category's when left out).
export const updateReel = async (id, { title, categoryIds, categoryId }) => {
  const { data } = await axiosClient.patch(`/reels/${id}`, {
    title,
    categoryIds,
    categoryId,
  });
  return data?.data;
};

// Removes the reel from the given categories, or deletes it everywhere when
// categoryIds is left out. Returns { reel, deleted }; deleted is also true
// when the reel's last category was removed.
export const deleteReel = async (id, categoryIds) => {
  const { data } = await axiosClient.delete(`/reels/${id}`, {
    data: categoryIds ? { categoryIds } : undefined,
  });
  return { reel: data?.data, deleted: !!data?.deleted };
};
