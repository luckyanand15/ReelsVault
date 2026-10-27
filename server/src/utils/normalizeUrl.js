// For known platforms the reel is identified by the path (plus these params),
// so every other param is share/tracking noise. Platforms rotate those names
// (Instagram has used igsh, igshid, obrf, cplk...), so keep-lists are safer
// than block-lists here.
const KEEP_PARAMS_BY_DOMAIN = {
  'instagram.com': [],
  'instagr.am': [],
  'tiktok.com': [],
  'youtube.com': ['v'],
  'youtu.be': [],
  'facebook.com': ['v'],
  'fb.watch': [],
};

// Fallback for other sites, where params may matter: strip only known trackers.
const TRACKING_PARAMS = new Set([
  'igsh',
  'igshid',
  'si',
  'feature',
  'fbclid',
  'mibextid',
  'gclid',
  '_r',
  '_t',
  'is_from_webapp',
  'sender_device',
  'share_app_id',
]);

// Matches subdomains too (m.youtube.com, vm.tiktok.com, web.facebook.com).
const findKnownDomain = hostname =>
  Object.keys(KEEP_PARAMS_BY_DOMAIN).find(
    domain => hostname === domain || hostname.endsWith(`.${domain}`),
  );

// Reduces the different share links for one reel to a single canonical form,
// so the { userId, url } unique index catches duplicates.
const normalizeUrl = raw => {
  const url = new URL(raw);

  url.hostname = url.hostname.replace(/^www\./, '');
  url.hash = '';

  const domain = findKnownDomain(url.hostname);
  if (domain) {
    const keep = KEEP_PARAMS_BY_DOMAIN[domain];
    // Mobile/alternate subdomains serve the same reel, except short-link hosts
    // like vm.tiktok.com whose paths only resolve there.
    if (/^(m|web|mobile)\./.test(url.hostname)) {
      url.hostname = domain;
    }
    [...url.searchParams.keys()]
      .filter(key => !keep.includes(key))
      .forEach(key => url.searchParams.delete(key));
  } else {
    [...url.searchParams.keys()]
      .filter(key => key.toLowerCase().startsWith('utm_') || TRACKING_PARAMS.has(key.toLowerCase()))
      .forEach(key => url.searchParams.delete(key));
  }
  url.searchParams.sort();

  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, '');
  }

  return url.toString();
};

module.exports = normalizeUrl;
