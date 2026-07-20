export const mapCategory = doc => ({
  id: doc?._id,
  label: doc?.title,
  icon: doc?.icon,
});
