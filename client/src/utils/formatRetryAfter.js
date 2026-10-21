// Turns a server `retryAfter` (seconds) into the end of a sentence:
// "in 18 seconds", "in 9 minutes", "in 23 hours", or "later" when the server
// didn't say.
export const formatRetryAfter = seconds => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 'later';
  }
  if (seconds < 60) {
    return `in ${seconds} second${seconds === 1 ? '' : 's'}`;
  }
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  const hours = Math.ceil(minutes / 60);
  return `in ${hours} hour${hours === 1 ? '' : 's'}`;
};
