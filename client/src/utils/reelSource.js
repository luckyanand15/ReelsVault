// The platform a reel link is from, for the "Instagram" / "YouTube Shorts"
// label; unknown sites fall back to their host name.
const SOURCES = [
  { id: 'instagram', pattern: /(^|\.)instagram\.com$/i, label: 'Instagram' },
  { id: 'youtube', pattern: /(^|\.)(youtube\.com|youtu\.be)$/i, label: 'YouTube Shorts' },
  { id: 'tiktok', pattern: /(^|\.)tiktok\.com$/i, label: 'TikTok' },
  { id: 'facebook', pattern: /(^|\.)(facebook\.com|fb\.watch)$/i, label: 'Facebook' },
];

export const getHost = url =>
  url?.match(/^https?:\/\/(?:www\.)?([^/?#:]+)/i)?.[1] || url || '';

export const reelSource = url => {
  const host = getHost(url);
  return SOURCES.find(s => s.pattern.test(host))?.label || host;
};

// The platform's id ('instagram', 'youtube', ...) for picking its logo; null
// for unknown sites.
export const reelSourceId = url => {
  const host = getHost(url);
  return SOURCES.find(s => s.pattern.test(host))?.id || null;
};
