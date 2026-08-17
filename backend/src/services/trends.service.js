// const googleTrends = require('google-trends-api');
// const { withLimit, withRelatedLimit } = require('../utils/scrapeLimiter');

// const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
// const cache = new Map();
// const inFlight = new Map();

// const COOLDOWN_MS = 45 * 1000; // 45 seconds
// let interestCooldownUntil = 0;
// let relatedCooldownUntil = 0;

// const RANGE_TO_START_DATE = {
//   '24h': () => new Date(Date.now() - 24 * 60 * 60 * 1000),
//   '7d':  () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
//   '1m':  () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
//   '3m':  () => new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000),
//   '12m': () => new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
// };

// function getCacheKey(prefix, keyword, geo, range) {
//   return `${prefix}|${(keyword || '').toLowerCase().trim()}|${geo || ''}|${range || '7d'}`;
// }

// function getCached(key) {
//   const entry = cache.get(key);
//   if (!entry) return undefined;
//   if (Date.now() > entry.expiresAt) {
//     cache.delete(key);
//     return undefined;
//   }
//   return entry.data;
// }

// function getCachedIgnoreExpiry(key) {
//   const entry = cache.get(key);
//   return entry ? entry.data : undefined;
// }

// function setCached(key, data) {
//   cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
// }

// function isInCooldown(type) {
//   const active = Date.now() < (type === 'interest' ? interestCooldownUntil : relatedCooldownUntil);
//   if (active) {
//     console.warn(`[trends] ${type} cooldown active — Returning cached or empty data without making an actual request to Google`);
//   }
//   return active;
// }

// function triggerCooldown(type) {
//   console.warn(`[trends] ${type} COOLDOWN TRIGGERED — Google send  HTML/block ,  pause for sometime `);
//   const until = Date.now() + COOLDOWN_MS;
//   if (type === 'interest') interestCooldownUntil = until;
//   else relatedCooldownUntil = until;
// }

// function safeParseTrendsResponse(res, type) {
//   try {
//     return JSON.parse(res);
//   } catch {
//     triggerCooldown(type);
//     return null;
//   }
// }

// async function withCacheAndDedupe(key, fetcher) {
//   const cached = getCached(key);
//   if (cached !== undefined) return cached;

//   if (inFlight.has(key)) return inFlight.get(key);

//   const promise = (async () => {
//     try {
//       const data = await fetcher();
//       setCached(key, data);
//       return data;
//     } finally {
//       inFlight.delete(key);
//     }
//   })();

//   inFlight.set(key, promise);
//   return promise;
// }

// const EMPTY_INTEREST = { default: { timelineData: [] } };
// const EMPTY_RELATED = { top: [], rising: [] };

// exports.getInterest = async (keyword, geo, range) => {
//   const key = getCacheKey('interest', keyword, geo, range);

//   if (isInCooldown('interest')) {
//     const stale = getCachedIgnoreExpiry(key);
//     return stale || EMPTY_INTEREST;
//   }

//   try {
//     return await withCacheAndDedupe(key, async () => {
//       const getStartDate = RANGE_TO_START_DATE[range] || RANGE_TO_START_DATE['7d'];
//       const parsed = await withLimit(async () => {
//         const res = await googleTrends.interestOverTime({
//           keyword,
//           geo: geo || '',
//           startTime: getStartDate(),
//           endTime: new Date(),
//         });
//         return safeParseTrendsResponse(res, 'interest');
//       });

//       if (!parsed) throw new Error('BLOCKED_OR_INVALID_RESPONSE');
//       return parsed;
//     });
//   } catch {
//     const stale = getCachedIgnoreExpiry(key);
//     return stale || EMPTY_INTEREST;
//   }
// };

// function fillMaskedKeyword(query, seedKeyword) {
//   if (!query) return query;
//   return query.replace(/\.{2,}/g, seedKeyword).trim();
// }

// function mapRelatedItem(item, seedKeyword) {
//   return {
//     query: fillMaskedKeyword(item.query, seedKeyword),
//     value: item.value,
//     formattedValue: item.formattedValue,
//     isBreakout: item.hasData === false || item.formattedValue === 'Breakout',
//   };
// }

// exports.getRelatedQueries = async (keyword, geo, range) => {
//   const key = getCacheKey('related', keyword, geo, range);

//   if (isInCooldown('related')) {
//     const stale = getCachedIgnoreExpiry(key);
//     return stale || EMPTY_RELATED;
//   }

//   try {
//     return await withCacheAndDedupe(key, async () => {
//       const getStartDate = RANGE_TO_START_DATE[range] || RANGE_TO_START_DATE['7d'];

//       const parsed = await withRelatedLimit(async () => {
//         const res = await googleTrends.relatedQueries({
//           keyword,
//           geo: geo || '',
//           startTime: getStartDate(),
//           endTime: new Date(),
//         });
//         return safeParseTrendsResponse(res, 'related');
//       });

//       if (!parsed) throw new Error('BLOCKED_OR_INVALID_RESPONSE');

//       const rankedLists = parsed?.default?.rankedList || [];
//       const top = rankedLists[0]?.rankedKeyword || [];
//       const rising = rankedLists[1]?.rankedKeyword || [];

//       return {
//         top: top.map((item) => mapRelatedItem(item, keyword)),
//         rising: rising.map((item) => mapRelatedItem(item, keyword)),
//       };
//     });
//   } catch {
//     const stale = getCachedIgnoreExpiry(key);
//     return stale || EMPTY_RELATED;
//   }
// };

// const googleTrends = require('google-trends-api');
// const { withLimit, withRelatedLimit } = require('../utils/scrapeLimiter');

// const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
// const CACHE_MAX_ENTRIES = 500; // bounded cache - memory leak fix (#2)
// const CACHE_SWEEP_INTERVAL_MS = 30 * 60 * 1000;
// const COOLDOWN_MS = 45 * 1000; // 45 seconds



// class MemoryStore {
//   constructor(maxEntries) {
//     this.maxEntries = maxEntries;
//     this.map = new Map();
//   }

//   async get(key) {
//     const entry = this.map.get(key);
//     if (!entry) return undefined;
//     if (Date.now() > entry.expiresAt) {
//       this.map.delete(key);
//       return undefined;
//     }
//     // re-insert = "most recently used" (simple LRU-ish ordering)
//     this.map.delete(key);
//     this.map.set(key, entry);
//     return entry.data;
//   }

//   async getIgnoreExpiry(key) {
//     const entry = this.map.get(key);
//     return entry ? entry.data : undefined;
//   }

//   async set(key, data, ttlMs) {
//     this.map.delete(key);
//     this.map.set(key, { data, expiresAt: Date.now() + ttlMs });
//     while (this.map.size > this.maxEntries) {
//       const oldestKey = this.map.keys().next().value;
//       if (oldestKey === undefined) break;
//       this.map.delete(oldestKey);
//     }
//   }

//   sweepExpired() {
//     const now = Date.now();
//     for (const [key, entry] of this.map) {
//       if (now > entry.expiresAt) this.map.delete(key);
//     }
//   }
// }

// let RedisStoreClass = null;
// if (process.env.REDIS_URL) {
//   try {
//     // Optional dependency - sirf tab load hota hai jab REDIS_URL set ho.
//     const Redis = require('ioredis');
//     RedisStoreClass = class RedisStore {
//       constructor(url) {
//         this.client = new Redis(url);
//         this.client.on('error', (err) => {
//           console.error('[trends.service] Redis connection error:', err.message);
//         });
//       }
//       async get(key) {
//         const raw = await this.client.get(key);
//         return raw ? JSON.parse(raw) : undefined;
//       }
//       async getIgnoreExpiry(key) {
//         // Redis apne TTL se expired key khud hata deta hai, is liye
//         // "ignore expiry" ka concept yahan get() jaisa hi hai.
//         return this.get(key);
//       }
//       async set(key, data, ttlMs) {
//         await this.client.set(key, JSON.stringify(data), 'PX', ttlMs);
//       }
//       sweepExpired() {
//         // Redis apne TTL se khud expired keys clean karta hai - manual sweep ki zaroorat nahi.
//       }
//     };
//   } catch (err) {
//     console.warn(
//       '[trends.service] REDIS_URL set hai lekin "ioredis" package nahi mila — MemoryStore use ho raha hai.',
//       err.message
//     );
//   }
// }

// const cacheStore = RedisStoreClass
//   ? new RedisStoreClass(process.env.REDIS_URL)
//   : new MemoryStore(CACHE_MAX_ENTRIES);

// if (typeof cacheStore.sweepExpired === 'function') {
//   const sweepTimer = setInterval(() => cacheStore.sweepExpired(), CACHE_SWEEP_INTERVAL_MS);
//   if (typeof sweepTimer.unref === 'function') sweepTimer.unref();
// }

// // inFlight dedupe (same-key parallel request collapse) intentionally
// // per-process/in-memory hi rehta hai — ye sirf ek single instance ke andar
// // duplicate concurrent calls rokta hai; cross-instance dedupe ke liye
// // distributed lock chahiye hoga jo abhi scope se bahar hai.
// const inFlight = new Map();

// // =====================================================================
// // #1 - Per-keyword cooldown (pehle global tha)
// // =====================================================================
// // Pehle ek hi global timestamp (interestCooldownUntil / relatedCooldownUntil)
// // tha — ek keyword block hone par 45 sec tak SAARE keywords/users ke liye
// // data rok deta tha. Ab cooldown (type + keyword + geo) ki granularity par
// // lagta hai — sirf wahi specific combo cooldown mein jata hai.
// const cooldowns = new Map(); // key: "type|keyword|geo" -> untilTimestamp

// function cooldownKey(type, keyword, geo) {
//   return `${type}|${(keyword || '').toLowerCase().trim()}|${geo || ''}`;
// }

// function isInCooldown(type, keyword, geo) {
//   const key = cooldownKey(type, keyword, geo);
//   const until = cooldowns.get(key);
//   if (!until) return false;

//   const active = Date.now() < until;
//   if (active) {
//     console.warn(
//       `[trends] ${type} cooldown active for "${keyword}" (${geo || 'worldwide'}) — returning cached/empty data without hitting Google`
//     );
//   } else {
//     cooldowns.delete(key); // expired - cleanup so the map doesn't grow forever
//   }
//   return active;
// }

// function triggerCooldown(type, keyword, geo) {
//   console.warn(
//     `[trends] ${type} COOLDOWN TRIGGERED for "${keyword}" (${geo || 'worldwide'}) — Google sent HTML/block, pausing this keyword for ${COOLDOWN_MS / 1000}s`
//   );
//   cooldowns.set(cooldownKey(type, keyword, geo), Date.now() + COOLDOWN_MS);
// }

// const RANGE_TO_START_DATE = {
//   '24h': () => new Date(Date.now() - 24 * 60 * 60 * 1000),
//   '7d':  () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
//   '1m':  () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
//   '3m':  () => new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000),
//   '6m':  () => new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
//   '12m': () => new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
// };

// function getCacheKey(prefix, keyword, geo, range) {
//   return `${prefix}|${(keyword || '').toLowerCase().trim()}|${geo || ''}|${range || '7d'}`;
// }

// function safeParseTrendsResponse(res, type, keyword, geo) {
//   try {
//     return JSON.parse(res);
//   } catch {
//     triggerCooldown(type, keyword, geo);
//     return null;
//   }
// }

// async function withCacheAndDedupe(key, fetcher) {
//   const cached = await cacheStore.get(key);
//   if (cached !== undefined) return cached;

//   if (inFlight.has(key)) return inFlight.get(key);

//   const promise = (async () => {
//     try {
//       const data = await fetcher();
//       await cacheStore.set(key, data, CACHE_TTL_MS);
//       return data;
//     } finally {
//       inFlight.delete(key);
//     }
//   })();

//   inFlight.set(key, promise);
//   return promise;
// }

// const EMPTY_INTEREST = { default: { timelineData: [] } };
// const EMPTY_RELATED = { top: [], rising: [] };

// exports.getInterest = async (keyword, geo, range) => {
//   const key = getCacheKey('interest', keyword, geo, range);

//   if (isInCooldown('interest', keyword, geo)) {
//     const stale = await cacheStore.getIgnoreExpiry(key);
//     return stale || EMPTY_INTEREST;
//   }

//   try {
//     return await withCacheAndDedupe(key, async () => {
//       const getStartDate = RANGE_TO_START_DATE[range] || RANGE_TO_START_DATE['7d'];
//       const parsed = await withLimit(async () => {
//         const res = await googleTrends.interestOverTime({
//           keyword,
//           geo: geo || '',
//           startTime: getStartDate(),
//           endTime: new Date(),
//         });
//         return safeParseTrendsResponse(res, 'interest', keyword, geo);
//       });

//       if (!parsed) throw new Error('BLOCKED_OR_INVALID_RESPONSE');
//       return parsed;
//     });
//   } catch {
//     const stale = await cacheStore.getIgnoreExpiry(key);
//     return stale || EMPTY_INTEREST;
//   }
// };

// function fillMaskedKeyword(query, seedKeyword) {
//   if (!query) return query;
//   return query.replace(/\.{2,}/g, seedKeyword).trim();
// }

// function mapRelatedItem(item, seedKeyword) {
//   return {
//     query: fillMaskedKeyword(item.query, seedKeyword),
//     value: item.value,
//     formattedValue: item.formattedValue,
//     isBreakout: item.hasData === false || item.formattedValue === 'Breakout',
//   };
// }

// exports.getRelatedQueries = async (keyword, geo, range) => {
//   const key = getCacheKey('related', keyword, geo, range);

//   if (isInCooldown('related', keyword, geo)) {
//     const stale = await cacheStore.getIgnoreExpiry(key);
//     return stale || EMPTY_RELATED;
//   }

//   try {
//     return await withCacheAndDedupe(key, async () => {
//       const getStartDate = RANGE_TO_START_DATE[range] || RANGE_TO_START_DATE['7d'];

//       const parsed = await withRelatedLimit(async () => {
//         const res = await googleTrends.relatedQueries({
//           keyword,
//           geo: geo || '',
//           startTime: getStartDate(),
//           endTime: new Date(),
//         });
//         return safeParseTrendsResponse(res, 'related', keyword, geo);
//       });

//       if (!parsed) throw new Error('BLOCKED_OR_INVALID_RESPONSE');

//       const rankedLists = parsed?.default?.rankedList || [];
//       const top = rankedLists[0]?.rankedKeyword || [];
//       const rising = rankedLists[1]?.rankedKeyword || [];

//       return {
//         top: top.map((item) => mapRelatedItem(item, keyword)),
//         rising: rising.map((item) => mapRelatedItem(item, keyword)),
//       };
//     });
//   } catch {
//     const stale = await cacheStore.getIgnoreExpiry(key);
//     return stale || EMPTY_RELATED;
//   }
// };


const googleTrends = require('google-trends-api');
const { withRelatedLimit, withInterestLimit } = require('../utils/scrapeLimiter');

const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500; // bounded cache - memory leak fix (#2)
const CACHE_SWEEP_INTERVAL_MS = 30 * 60 * 1000;
const COOLDOWN_MS = 45 * 1000; // 45 seconds

// =====================================================================
// Global circuit breaker
// =====================================================================
// Per-keyword cooldown kaafi nahi hai agar Google ne humari poori IP hi
// flag kar di ho — us case mein alag-alag keywords baari-baari block hote
// rehte hain (jaisa logs mein dikha). Agar thodi der mein multiple ALAG
// keywords/geos block hon, to ye maan lo ke IP-level block hai aur SAARI
// Trends requests ko kuch der ke liye poori tarah rok do (Google ko call
// kiye bina), taake block aur severe na ho.
const GLOBAL_BREAKER_WINDOW_MS = 2 * 60 * 1000; // 2 minute ki window
const GLOBAL_BREAKER_THRESHOLD = 3; // is window mein itne cooldown-triggers = IP-level block
const GLOBAL_BREAKER_COOLDOWN_MS = 5 * 60 * 1000; // 5 minute ke liye sab kuch pause

let recentCooldownTimestamps = [];
let globalBreakerUntil = 0;

function recordCooldownEvent() {
  const now = Date.now();
  recentCooldownTimestamps.push(now);
  recentCooldownTimestamps = recentCooldownTimestamps.filter((t) => now - t < GLOBAL_BREAKER_WINDOW_MS);

  if (recentCooldownTimestamps.length >= GLOBAL_BREAKER_THRESHOLD && now > globalBreakerUntil) {
    globalBreakerUntil = now + GLOBAL_BREAKER_COOLDOWN_MS;
    console.warn(
      `[trends] GLOBAL CIRCUIT BREAKER TRIGGERED — ${recentCooldownTimestamps.length} blocks across different keywords in ${GLOBAL_BREAKER_WINDOW_MS / 1000}s. This looks like an IP-level block. Pausing ALL Trends requests for ${GLOBAL_BREAKER_COOLDOWN_MS / 1000}s.`
    );
  }
}

function isGloballyBroken() {
  return Date.now() < globalBreakerUntil;
}




class MemoryStore {
  constructor(maxEntries) {
    this.maxEntries = maxEntries;
    this.map = new Map();
  }

  async get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    // re-insert = "most recently used" (simple LRU-ish ordering)
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.data;
  }

  async getIgnoreExpiry(key) {
    const entry = this.map.get(key);
    return entry ? entry.data : undefined;
  }

  async set(key, data, ttlMs) {
    this.map.delete(key);
    this.map.set(key, { data, expiresAt: Date.now() + ttlMs });
    while (this.map.size > this.maxEntries) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey === undefined) break;
      this.map.delete(oldestKey);
    }
  }

  sweepExpired() {
    const now = Date.now();
    for (const [key, entry] of this.map) {
      if (now > entry.expiresAt) this.map.delete(key);
    }
  }
}

let RedisStoreClass = null;
if (process.env.REDIS_URL) {
  try {
    // Optional dependency - sirf tab load hota hai jab REDIS_URL set ho.
    const Redis = require('ioredis');
    RedisStoreClass = class RedisStore {
      constructor(url) {
        this.client = new Redis(url);
        this.client.on('error', (err) => {
          console.error('[trends.service] Redis connection error:', err.message);
        });
      }
      async get(key) {
        const raw = await this.client.get(key);
        return raw ? JSON.parse(raw) : undefined;
      }
      async getIgnoreExpiry(key) {
        // Redis apne TTL se expired key khud hata deta hai, is liye
        // "ignore expiry" ka concept yahan get() jaisa hi hai.
        return this.get(key);
      }
      async set(key, data, ttlMs) {
        await this.client.set(key, JSON.stringify(data), 'PX', ttlMs);
      }
      sweepExpired() {
        // Redis apne TTL se khud expired keys clean karta hai - manual sweep ki zaroorat nahi.
      }
    };
  } catch (err) {
    console.warn(
      '[trends.service] REDIS_URL set hai lekin "ioredis" package nahi mila — MemoryStore use ho raha hai.',
      err.message
    );
  }
}

const cacheStore = RedisStoreClass
  ? new RedisStoreClass(process.env.REDIS_URL)
  : new MemoryStore(CACHE_MAX_ENTRIES);

if (typeof cacheStore.sweepExpired === 'function') {
  const sweepTimer = setInterval(() => cacheStore.sweepExpired(), CACHE_SWEEP_INTERVAL_MS);
  if (typeof sweepTimer.unref === 'function') sweepTimer.unref();
}

// inFlight dedupe (same-key parallel request collapse) intentionally
// per-process/in-memory hi rehta hai — ye sirf ek single instance ke andar
// duplicate concurrent calls rokta hai; cross-instance dedupe ke liye
// distributed lock chahiye hoga jo abhi scope se bahar hai.
const inFlight = new Map();

// =====================================================================
// #1 - Per-keyword cooldown (pehle global tha)
// =====================================================================
// Pehle ek hi global timestamp (interestCooldownUntil / relatedCooldownUntil)
// tha — ek keyword block hone par 45 sec tak SAARE keywords/users ke liye
// data rok deta tha. Ab cooldown (type + keyword + geo) ki granularity par
// lagta hai — sirf wahi specific combo cooldown mein jata hai.
const cooldowns = new Map(); // key: "type|keyword|geo" -> untilTimestamp

function cooldownKey(type, keyword, geo) {
  return `${type}|${(keyword || '').toLowerCase().trim()}|${geo || ''}`;
}

function isInCooldown(type, keyword, geo) {
  const key = cooldownKey(type, keyword, geo);
  const until = cooldowns.get(key);
  if (!until) return false;

  const active = Date.now() < until;
  if (active) {
    console.warn(
      `[trends] ${type} cooldown active for "${keyword}" (${geo || 'worldwide'}) — returning cached/empty data without hitting Google`
    );
  } else {
    cooldowns.delete(key); // expired - cleanup so the map doesn't grow forever
  }
  return active;
}

function triggerCooldown(type, keyword, geo) {
  console.warn(
    `[trends] ${type} COOLDOWN TRIGGERED for "${keyword}" (${geo || 'worldwide'}) — Google sent HTML/block, pausing this keyword for ${COOLDOWN_MS / 1000}s`
  );
  cooldowns.set(cooldownKey(type, keyword, geo), Date.now() + COOLDOWN_MS);
  recordCooldownEvent();
}

const RANGE_TO_START_DATE = {
  '24h': () => new Date(Date.now() - 24 * 60 * 60 * 1000),
  '7d':  () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  '1m':  () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  '3m':  () => new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000),
  '6m':  () => new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
  '12m': () => new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
};

function getCacheKey(prefix, keyword, geo, range) {
  return `${prefix}|${(keyword || '').toLowerCase().trim()}|${geo || ''}|${range || '7d'}`;
}

function safeParseTrendsResponse(res, type, keyword, geo) {
  try {
    return JSON.parse(res);
  } catch {
    triggerCooldown(type, keyword, geo);
    return null;
  }
}

async function withCacheAndDedupe(key, fetcher) {
  const cached = await cacheStore.get(key);
  if (cached !== undefined) return cached;

  if (inFlight.has(key)) return inFlight.get(key);

  const promise = (async () => {
    try {
      const data = await fetcher();
      await cacheStore.set(key, data, CACHE_TTL_MS);
      return data;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

const EMPTY_INTEREST = { default: { timelineData: [] } };
const EMPTY_RELATED = { top: [], rising: [] };

exports.getInterest = async (keyword, geo, range) => {
  const key = getCacheKey('interest', keyword, geo, range);

  if (isGloballyBroken()) {
    console.warn(`[trends] interest "${keyword}" (${geo || 'worldwide'}) — global circuit breaker active, skipping Google entirely`);
    const stale = await cacheStore.getIgnoreExpiry(key);
    if (stale) return stale;
    return { ...EMPTY_INTEREST, rateLimited: true };
  }

  if (isInCooldown('interest', keyword, geo)) {
    const stale = await cacheStore.getIgnoreExpiry(key);
    if (stale) return stale;
    return { ...EMPTY_INTEREST, rateLimited: true };
  }

  try {
    return await withCacheAndDedupe(key, async () => {
      const getStartDate = RANGE_TO_START_DATE[range] || RANGE_TO_START_DATE['7d'];
      const parsed = await withInterestLimit(async () => {
        const res = await googleTrends.interestOverTime({
          keyword,
          geo: geo || '',
          startTime: getStartDate(),
          endTime: new Date(),
        });
        return safeParseTrendsResponse(res, 'interest', keyword, geo);
      });

      if (!parsed) throw new Error('BLOCKED_OR_INVALID_RESPONSE');
      return parsed;
    });
  } catch {
    const stale = await cacheStore.getIgnoreExpiry(key);
    if (stale) return stale;
    return { ...EMPTY_INTEREST, rateLimited: true };
  }
};

function fillMaskedKeyword(query, seedKeyword) {
  if (!query) return query;
  return query.replace(/\.{2,}/g, seedKeyword).trim();
}

function mapRelatedItem(item, seedKeyword) {
  return {
    query: fillMaskedKeyword(item.query, seedKeyword),
    value: item.value,
    formattedValue: item.formattedValue,
    isBreakout: item.hasData === false || item.formattedValue === 'Breakout',
  };
}

exports.getRelatedQueries = async (keyword, geo, range) => {
  const key = getCacheKey('related', keyword, geo, range);

  if (isGloballyBroken()) {
    console.warn(`[trends] related "${keyword}" (${geo || 'worldwide'}) — global circuit breaker active, skipping Google entirely`);
    const stale = await cacheStore.getIgnoreExpiry(key);
    if (stale) return stale;
    return { ...EMPTY_RELATED, rateLimited: true };
  }

  // FIX: cooldown active hone par pehle "stale" (purana cached, lekin
  // real) data try karo. Agar wo bhi nahi hai, tabhi khaali data ke sath
  // `rateLimited: true` flag bhejo — taake frontend "No data" ki jagah
  // sahi "Google rate-limited" wala message dikha sake.
  if (isInCooldown('related', keyword, geo)) {
    const stale = await cacheStore.getIgnoreExpiry(key);
    if (stale) return stale;
    return { ...EMPTY_RELATED, rateLimited: true };
  }

  try {
    return await withCacheAndDedupe(key, async () => {
      const getStartDate = RANGE_TO_START_DATE[range] || RANGE_TO_START_DATE['7d'];

      const parsed = await withRelatedLimit(async () => {
        const res = await googleTrends.relatedQueries({
          keyword,
          geo: geo || '',
          startTime: getStartDate(),
          endTime: new Date(),
        });
        return safeParseTrendsResponse(res, 'related', keyword, geo);
      });

      if (!parsed) throw new Error('BLOCKED_OR_INVALID_RESPONSE');

      const rankedLists = parsed?.default?.rankedList || [];
      const top = rankedLists[0]?.rankedKeyword || [];
      const rising = rankedLists[1]?.rankedKeyword || [];

      return {
        top: top.map((item) => mapRelatedItem(item, keyword)),
        rising: rising.map((item) => mapRelatedItem(item, keyword)),
      };
    });
  } catch {
    // FIX: yahan bhi wahi treatment - stale data prefer karo, warna
    // rateLimited flag ke sath khaali data bhejo (silently khaali nahi).
    const stale = await cacheStore.getIgnoreExpiry(key);
    if (stale) return stale;
    return { ...EMPTY_RELATED, rateLimited: true };
  }
};


