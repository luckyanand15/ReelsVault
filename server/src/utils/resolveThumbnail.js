const axios = require('axios');
const dns = require('dns');
const http = require('http');
const https = require('https');
const net = require('net');

const FETCH_TIMEOUT_MS = 5000;
// Instagram reel pages are ~550KB; the og tags sit in <head>.
const MAX_PAGE_BYTES = 2 * 1024 * 1024;
const MAX_THUMBNAIL_URL_LENGTH = 2048;

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

const fetchText = async url => {
  assertFetchable(url);
  const { data } = await axios.get(url, {
    timeout: FETCH_TIMEOUT_MS,
    maxContentLength: MAX_PAGE_BYTES,
    maxRedirects: 5,
    responseType: 'text',
    httpAgent,
    httpsAgent,
    beforeRedirect: options => assertFetchable(options.href),
    headers: { Accept: 'text/html,application/xhtml+xml' },
  });
  return typeof data === 'string' ? data : '';
};

const decodeHtmlEntities = value =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;|&#47;/gi, '/');

// Matches <meta property="og:image" content="..."> with attributes in either
// order; og:image:secure_url and twitter:image are fallbacks.
const findMetaImage = html => {
  const names = ['og:image', 'og:image:secure_url', 'twitter:image'];
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

// YouTube thumbnails live at a fixed address per video, so no request needed.
const youtubeThumbnail = url => {
  const { hostname, pathname, searchParams } = url;
  let id = null;
  if (hostMatches(hostname, 'youtu.be')) {
    id = pathname.split('/')[1];
  } else if (hostMatches(hostname, 'youtube.com')) {
    id =
      searchParams.get('v') ||
      pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1];
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id)
    ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    : null;
};

// TikTok pages don't reliably carry og:image, but its public oEmbed does.
const tiktokThumbnail = async url => {
  const { data } = await axios.get('https://www.tiktok.com/oembed', {
    params: { url },
    timeout: FETCH_TIMEOUT_MS,
    maxContentLength: MAX_PAGE_BYTES,
  });
  return toThumbnailUrl(data?.thumbnail_url, url);
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

module.exports = resolveThumbnail;
