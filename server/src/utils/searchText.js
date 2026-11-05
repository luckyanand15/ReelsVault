// Text handling for search, in plain JS so it doesn't depend on the database.
// Titles and queries go through the same normalizeText, so the database only
// has to answer "does a word in this title start with X".

// Lowercase, accents removed (é -> e), apostrophes dropped (mom's -> moms),
// anything else that isn't a letter or digit (emoji, #, punctuation) turned
// into a space, and runs of spaces collapsed.
const normalizeText = text =>
  String(text ?? '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/['’‘`]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

// The distinct words of a query, as normalizeText splits them.
const queryWords = query => [
  ...new Set(normalizeText(query).split(' ').filter(Boolean)),
];

// Shorter words get no typo allowance: one edit on 2-3 letters matches
// almost anything.
const MIN_FUZZY_WORD_LENGTH = 4;

// Edit distance where a swap of two neighbouring letters counts as one
// (appel -> apple), capped: anything above max returns max + 1.
const editDistance = (a, b, max) => {
  if (Math.abs(a.length - b.length) > max) {
    return max + 1;
  }
  let prevPrev = null;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let d = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (
        prevPrev &&
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        d = Math.min(d, prevPrev[j - 2] + 1);
      }
      row.push(d);
      rowMin = Math.min(rowMin, d);
    }
    if (rowMin > max) {
      return max + 1;
    }
    prevPrev = prev;
    prev = row;
  }
  return Math.min(prev[b.length], max + 1);
};

// How far a query word is from being the start of a title word: 0 when the
// title word starts with it, 1 when one typo away, otherwise null. The query
// is compared with the title word's starts of about its own length, so a
// typo in a half-typed word still counts ("aple" -> "applesauce").
const wordDistance = (queryWord, titleWord) => {
  if (titleWord.startsWith(queryWord)) {
    return 0;
  }
  if (queryWord.length < MIN_FUZZY_WORD_LENGTH) {
    return null;
  }
  const n = queryWord.length;
  const best = Math.min(
    ...[n - 1, n, n + 1].map(len =>
      editDistance(queryWord, titleWord.slice(0, len), 1),
    ),
  );
  return best <= 1 ? best : null;
};

// Returns a scorer for one query: title -> total typos for the title to
// match every query word, or null when some word matches nothing in it.
// Titles share most of their words, so each title word is compared with
// each query word only once per search.
const makeFuzzyScorer = words => {
  const caches = words.map(() => new Map());
  const distanceTo = (i, titleWord) => {
    const cache = caches[i];
    if (!cache.has(titleWord)) {
      cache.set(titleWord, wordDistance(words[i], titleWord));
    }
    return cache.get(titleWord);
  };
  return titleNormalized => {
    const titleWords = titleNormalized.split(' ');
    let total = 0;
    for (let i = 0; i < words.length; i += 1) {
      let best = null;
      for (const titleWord of titleWords) {
        const d = distanceTo(i, titleWord);
        if (d !== null && (best === null || d < best)) {
          best = d;
          if (d === 0) break;
        }
      }
      if (best === null) {
        return null;
      }
      total += best;
    }
    return total;
  };
};

const canFuzzyMatch = words =>
  words.some(w => w.length >= MIN_FUZZY_WORD_LENGTH);

module.exports = { normalizeText, queryWords, makeFuzzyScorer, canFuzzyMatch };
