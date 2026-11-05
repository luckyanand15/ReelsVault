// The platform a reel link is from, for the "Instagram" / "YouTube Shorts"
// label; unknown sites fall back to their host name.
const SOURCES = [
  { pattern: /(^|\.)instagram\.com$/i, label: 'Instagram' },
  { pattern: /(^|\.)(youtube\.com|youtu\.be)$/i, label: 'YouTube Shorts' },
  { pattern: /(^|\.)tiktok\.com$/i, label: 'TikTok' },
  { pattern: /(^|\.)(facebook\.com|fb\.watch)$/i, label: 'Facebook' },
];

export const getHost = url =>
  url?.match(/^https?:\/\/(?:www\.)?([^/?#:]+)/i)?.[1] || url || '';

export const reelSource = url => {
  const host = getHost(url);
  return SOURCES.find(s => s.pattern.test(host))?.label || host;
};
