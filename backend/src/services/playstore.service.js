
const gplay = require('google-play-scraper').default;
const { withLimit } = require('../utils/scrapeLimiter');
const { getAll: getAllCountries } = require('./countries.service');

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map();
const inFlight = new Map();
const REQUEST_TIMEOUT_MS = 6000;


const COUNTRY_LANG_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // country/language data bohot kam badalta hai
let countryLangMapCache = null;
let countryLangMapExpiresAt = 0;

async function getCountryLangMap() {
  if (countryLangMapCache && Date.now() < countryLangMapExpiresAt) {
    return countryLangMapCache;
  }
  try {
    const countries = await getAllCountries();
    const map = {};
    (Array.isArray(countries) ? countries : []).forEach((c) => {
      const code = (c.alpha2Code || '').toLowerCase();
      const lang = c.languages?.[0]?.iso639_1;
      if (code && lang) map[code] = lang;
    });
    countryLangMapCache = map;
    countryLangMapExpiresAt = Date.now() + COUNTRY_LANG_CACHE_TTL_MS;
    return map;
  } catch {
    
    return countryLangMapCache || {};
  }
}

async function getLangForCountry(country) {
  const c = (country || 'us').toLowerCase();
  if (c === 'us' || c === 'gb' || !c) return 'en';
  const map = await getCountryLangMap();
  return map[c] || 'en';
}

function getCacheKey(term, country) {
  return `${(term || '').toLowerCase().trim()}|${country || 'us'}`;
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

exports.getSuggestions = async (term, country) => {
  const key = getCacheKey(term, country);

  const cached = getCached(key);
  if (cached !== undefined) return cached;

  if (inFlight.has(key)) return inFlight.get(key);

  const promise = (async () => {
    try {
      const lang = await getLangForCountry(country);
      const data = await withLimit(() =>
        withTimeout(gplay.suggest({ term, country: country || 'us', lang }), REQUEST_TIMEOUT_MS)
      );
      const result = Array.isArray(data) ? data : [];
      setCached(key, result);
      return result;
    } catch {
      setCached(key, []);
      return [];
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
};

exports.searchApps = async (term, country) => {
  try {
    const lang = await getLangForCountry(country);
    const data = await withLimit(() =>
      withTimeout(gplay.search({ term, country: country || 'us', lang, num: 5 }), REQUEST_TIMEOUT_MS)
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

// App details ke liye alag cache (thoda lamba TTL - details itni jaldi nahi badalte)
const DETAILS_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const detailsCache = new Map();

function getDetailsCacheKey(appId, country) {
  return `${appId}|${country || 'us'}`;
}

exports.getAppDetails = async (appId, country) => {
  const key = getDetailsCacheKey(appId, country);
  const cached = detailsCache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.data;

  try {
    const lang = await getLangForCountry(country);
    const data = await withLimit(() =>
      withTimeout(gplay.app({ appId, country: country || 'us', lang }), REQUEST_TIMEOUT_MS)
    );

    const result = {
      appId: data.appId,
      title: data.title,
      icon: data.icon,
      developer: data.developer,
      developerWebsite: data.developerWebsite,
      score: data.score,
      ratings: data.ratings,
      installs: data.installs,
      price: data.price,
      free: data.free,
      genre: data.genre,
      description: data.description,
      screenshots: Array.isArray(data.screenshots) ? data.screenshots.slice(0, 8) : [],
      headerImage: data.headerImage,
      released: data.released,
      updated: data.updated,
      version: data.version,
      url: data.url,
    };

    detailsCache.set(key, { data: result, expiresAt: Date.now() + DETAILS_CACHE_TTL_MS });
    return result;
  } catch {
    return null;
  }
};
