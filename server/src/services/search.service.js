const Reel = require('../models/Reel');
const SavedReel = require('../models/SavedReel');
const { withCategories } = require('./reel.service');
const {
  queryWords,
  makeFuzzyScorer,
  canFuzzyMatch,
} = require('../utils/searchText');

// All of search lives here: the routes only call searchSavedReels, so moving
// to another database means rewriting the two queries below and nothing
// else. Matching rules are in utils/searchText.

// Upper bound on matches looked at for one query, so a one-letter query on a
// huge library stays cheap. Nobody pages past this many results.
const MAX_MATCHES = 1000;

const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A reel saved in several categories can match more than once; it's listed
// once, at its best place, remembering which save (and so title) matched.
const uniqueReels = saves => {
  const seen = new Map();
  for (const save of saves) {
    if (!seen.has(save.reelId)) {
      seen.set(save.reelId, save.categoryId);
    }
  }
  return [...seen].map(([reelId, categoryId]) => ({ reelId, categoryId }));
};

// Every query word must start a word of the title. Newest save first.
// (SQL equivalent: title_normalized LIKE 'w%' OR LIKE '% w%', per word.)
const findPrefixMatches = (scope, words) =>
  SavedReel.find({
    ...scope,
    $and: words.map(w => ({
      titleNormalized: { $regex: `(^| )${escapeRegex(w)}` },
    })),
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(MAX_MATCHES)
    .select('reelId categoryId')
    .lean();

// Only when the prefix search found nothing: every title in scope is scored
// in JS, allowing one typo per word of 4+ letters. Fewest typos first, then
// newest. A user's titles are short, so even 10k of them take milliseconds.
const findFuzzyMatches = async (scope, words) => {
  const saves = await SavedReel.find(scope)
    .sort({ createdAt: -1, _id: -1 })
    .select('reelId categoryId titleNormalized')
    .lean();
  const score = makeFuzzyScorer(words);
  return saves
    .map(save => ({ save, score: score(save.titleNormalized || '') }))
    .filter(({ score }) => score !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_MATCHES)
    .map(({ save }) => save);
};

// One page of the user's reels whose titles match q, within categoryId when
// given. Each reel has the same shape as in the reel list, plus
// matchedCategoryId: the category whose title matched. fuzzy says the
// results are typo matches (nothing matched exactly). nextPage is null on
// the last page.
const searchSavedReels = async (userId, { q, categoryId, page, limit }) => {
  const words = queryWords(q);
  if (words.length === 0) {
    return { reels: [], nextPage: null, fuzzy: false };
  }
  const scope = categoryId ? { userId, categoryId } : { userId };

  let matches = uniqueReels(await findPrefixMatches(scope, words));
  let fuzzy = false;
  if (matches.length === 0 && canFuzzyMatch(words)) {
    matches = uniqueReels(await findFuzzyMatches(scope, words));
    fuzzy = matches.length > 0;
  }

  const start = (page - 1) * limit;
  const pageMatches = matches.slice(start, start + limit);
  const nextPage = matches.length > start + limit ? page + 1 : null;

  const reels = await Reel.find({
    _id: { $in: pageMatches.map(m => m.reelId) },
    userId,
  });
  const byId = new Map(reels.map(r => [r.id, r]));
  const ordered = pageMatches.filter(m => byId.has(m.reelId));
  const withSaves = await withCategories(ordered.map(m => byId.get(m.reelId)));

  return {
    reels: withSaves.map((reel, i) => ({
      ...reel,
      matchedCategoryId: ordered[i].categoryId,
    })),
    nextPage,
    fuzzy,
  };
};

module.exports = { searchSavedReels };
