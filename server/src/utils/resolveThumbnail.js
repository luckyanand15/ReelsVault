const axios = require('axios');
const dns = require('dns');
const http = require('http');
const https = require('https');
const net = require('net');

const FETCH_TIMEOUT_MS = 5000;
// Most we read of a page whose <head> never seems to end.
const MAX_PAGE_BYTES = 2 * 1024 * 1024;
const MAX_THUMBNAIL_URL_LENGTH = 2048;
// Same cap as a reel title (reel.validator.js).
const MAX_TITLE_LENGTH = 100;

// Users choose these URLs, so never let the server be pointed at itself or
// the internal network (cloud metadata endpoints, localhost services...).
const blockedAddresses = new net.BlockList();
[
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
].forEach(([address, prefix]) => blockedAddresses.addSubnet(address, prefix, 'ipv4'));
[
  ['::', 128],
  ['::1', 128],
  ['fc00::', 7],
  ['fe80::', 10],
].forEach(([address, prefix]) => blockedAddresses.addSubnet(address, prefix, 'ipv6'));

// BlockList matches IPv4 rules against IPv4-mapped IPv6 too (::ffff:7f00:1
// hits 127.0.0.0/8), so mapped addresses need no rules of their own.
const isBlockedAddress = address => {
  const family = net.isIP(address);
  if (family === 0) {
    return true;
  }
  return blockedAddresses.check(address, family === 6 ? 'ipv6' : 'ipv4');
};

// Runs on every connection, redirects included, so a public host can't
// resolve or redirect its way to a private address.
const safeLookup = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) {
      return callback(err);
    }
    const allowed = addresses.filter(({ address }) => !isBlockedAddress(address));
    if (allowed.length === 0) {
      return callback(new Error(`Blocked address for ${hostname}`));
    }
    if (options?.all) {
      return callback(null, allowed);
    }
    return callback(null, allowed[0].address, allowed[0].family);
  });
};

const httpAgent = new http.Agent({ lookup: safeLookup });
const httpsAgent = new https.Agent({ lookup: safeLookup });

// Literal IPs skip the DNS lookup entirely, so check them up front.
const assertFetchable = rawUrl => {
  const { protocol, hostname } = new URL(rawUrl);
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error(`Unsupported protocol ${protocol}`);
  }
  const host = hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) && isBlockedAddress(host)) {
    throw new Error(`Blocked address ${host}`);
  }
};

// Where <head> ends; every tag we read sits before it.
const HEAD_END = /<\/head\s*>|<body[\s>]/gi;

// Reads the page only up to the end of <head> and then drops the
// connection, so most of a large page (Instagram's is ~550KB) is never
// downloaded. The timeout covers the whole read, not just the headers.
const fetchText = async url => {
  assertFetchable(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const { data: stream } = await axios.get(url, {
      signal: controller.signal,
      maxRedirects: 5,
      responseType: 'stream',
      httpAgent,
      httpsAgent,
      beforeRedirect: options => assertFetchable(options.href),
      headers: { Accept: 'text/html,application/xhtml+xml' },
    });
    const decoder = new TextDecoder();
    let html = '';
    let bytes = 0;
    // Leaving the loop early destroys the stream, closing the connection.
    for await (const chunk of stream) {
      bytes += chunk.length;
      // Look back a little so a tag split across chunks is still found.
      HEAD_END.lastIndex = Math.max(0, html.length - 16);
      html += decoder.decode(chunk, { stream: true });
      if (HEAD_END.test(html) || bytes >= MAX_PAGE_BYTES) {
        break;
      }
    }
    return html;
  } finally {
    clearTimeout(timer);
  }
};

const fromCodePoint = code =>
  code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';

// &amp; goes last so "&amp;lt;" stays "&lt;" instead of becoming "<".
// Numeric entities matter for captions, which encode emoji that way.
const decodeHtmlEntities = value =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

// Matches <meta property="..." content="..."> with attributes in either
// order; the first name with a value wins.
const findMeta = (html, names) => {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const name of names) {
    for (const tag of tags) {
      const key = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1];
      if (key?.toLowerCase() !== name) {
        continue;
      }
      const content = tag.match(/\bcontent\s*=\s*(["'])(.*?)\1/i)?.[2];
      if (content) {
        return decodeHtmlEntities(content.trim());
      }
    }
  }
  return null;
};

const findMetaImage = html =>
  findMeta(html, ['og:image', 'og:image:secure_url', 'twitter:image']);

// Login walls and error pages carry just the site's name.
const GENERIC_TITLE = /^(instagram|tiktok|youtube|facebook|log ?in\b.*)$/i;

// Turns a page/oEmbed title into a short reel title, or null: trailing
// hashtags are dropped and long titles cut at a word.
const toTitle = raw => {
  if (typeof raw !== 'string') {
    return null;
  }
  let title = raw.replace(/\s+/g, ' ').trim();
  title = title.replace(/(?:\s*#[^\s#]+)+$/u, '').trim();
  if (!title || GENERIC_TITLE.test(title)) {
    return null;
  }
  if (title.length > MAX_TITLE_LENGTH) {
    title = title.slice(0, MAX_TITLE_LENGTH - 1);
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > MAX_TITLE_LENGTH / 2) {
      title = title.slice(0, lastSpace);
    }
    // Don't leave half an emoji behind.
    title = `${title.replace(/[\uD800-\uDBFF]$/, '').trim()}…`;
  }
  return title;
};

const findPageTitle = html =>
  findMeta(html, ['og:title', 'twitter:title']) ||
  decodeHtmlEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || '');

// Instagram's og:title is only the account ("Name (@handle) • Instagram
// reel"); the caption is in og:description as
// `1,234 likes, 56 comments - handle on March 1, 2024: "caption".`
// Its first line is the title. No caption means no suggestion.
const instagramCaption = html => {
  const description = findMeta(html, ['og:description']);
  const caption = description?.match(/:\s*"([\s\S]*)"\.?\s*$/)?.[1];
  return caption
    ?.split('\n')
    .map(line => line.trim())
    .find(Boolean);
};

// Only absolute http(s) URLs are worth storing; relative og:image paths are
// resolved against the page.
const toThumbnailUrl = (candidate, pageUrl) => {
  if (!candidate) {
    return null;
  }
  try {
    const url = new URL(candidate, pageUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    const value = url.toString();
    return value.length <= MAX_THUMBNAIL_URL_LENGTH ? value : null;
  } catch {
    return null;
  }
};

const hostMatches = (hostname, domain) =>
  hostname === domain || hostname.endsWith(`.${domain}`);

const youtubeId = url => {
  const { hostname, pathname, searchParams } = url;
  let id = null;
  if (hostMatches(hostname, 'youtu.be')) {
    id = pathname.split('/')[1];
  } else if (hostMatches(hostname, 'youtube.com')) {
    id =
      searchParams.get('v') ||
      pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1];
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
};

// YouTube thumbnails live at a fixed address per video, so no request needed.
const youtubeThumbnail = url => {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
};

// Fixed, public endpoints (YouTube/TikTok), so no SSRF guard needed.
const fetchOembed = async (endpoint, url) => {
  const { data } = await axios.get(endpoint, {
    params: { url },
    timeout: FETCH_TIMEOUT_MS,
    maxContentLength: MAX_PAGE_BYTES,
  });
  return data || {};
};

// TikTok pages don't reliably carry og:image, but its public oEmbed does.
const tiktokThumbnail = async url => {
  const data = await fetchOembed('https://www.tiktok.com/oembed', url);
  return toThumbnailUrl(data.thumbnail_url, url);
};

const pageThumbnail = async url => {
  const html = await fetchText(url);
  return toThumbnailUrl(findMetaImage(html), url);
};

// Returns an image URL for the reel, or null. Never throws: a missing
// thumbnail must not stop a reel from being saved. Instagram/TikTok image
// URLs are signed and expire, so callers refresh them when they stop loading.
const resolveThumbnail = async rawUrl => {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();

    const youtube = youtubeThumbnail(url);
    if (youtube) {
      return youtube;
    }
    if (hostMatches(hostname, 'tiktok.com')) {
      return await tiktokThumbnail(rawUrl);
    }
    return await pageThumbnail(rawUrl);
  } catch (err) {
    console.warn(`Thumbnail lookup failed for ${rawUrl}: ${err.message}`);
    return null;
  }
};

// Returns a suggested title for the reel, or null. Never throws, like
// resolveThumbnail.
const resolveTitle = async rawUrl => {
  try {
    const url = new URL(rawUrl);
    if (youtubeId(url)) {
      const data = await fetchOembed('https://www.youtube.com/oembed', rawUrl);
      return toTitle(data.title);
    }
    if (hostMatches(url.hostname, 'tiktok.com')) {
      const data = await fetchOembed('https://www.tiktok.com/oembed', rawUrl);
      return toTitle(data.title);
    }
    const html = await fetchText(rawUrl);
    if (
      hostMatches(url.hostname, 'instagram.com') ||
      hostMatches(url.hostname, 'instagr.am')
    ) {
      return toTitle(instagramCaption(html));
    }
    return toTitle(findPageTitle(html));
  } catch (err) {
    console.warn(`Title lookup failed for ${rawUrl}: ${err.message}`);
    return null;
  }
};

module.exports = resolveThumbnail;
module.exports.resolveTitle = resolveTitle;
