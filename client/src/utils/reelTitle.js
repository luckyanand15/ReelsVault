// A reel has its own title in each category it's saved in. Shows the one
// for categoryId, or the first category's (e.g. under All).
export const reelTitle = (reel, categoryId) =>
  (
    reel?.categories?.find(c => c?.categoryId === categoryId) ||
    reel?.categories?.[0]
  )?.title || '';
