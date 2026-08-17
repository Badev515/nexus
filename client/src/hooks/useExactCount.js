import { useEffect, useRef, useState } from 'react';
import { getSuggestions } from '../api/playstore.api';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const LETTER_CONCURRENCY = 4;   // ek word ke 26 letters mein se max 4 parallel
const WORD_CONCURRENCY = 2;     // ek time pe sirf 1 word process ho (letters khud hi 4 parallel hain)

const countCache = new Map();
const inFlightPromises = new Map();

let activeWords = 0;
const wordQueue = [];

function acquireWordSlot() {
  if (activeWords < WORD_CONCURRENCY) {
    activeWords++;
    return Promise.resolve();
  }
  return new Promise((resolve) => wordQueue.push(resolve));
}

function releaseWordSlot() {
  activeWords--;
  const next = wordQueue.shift();
  if (next) {
    activeWords++;
    next();
  }
}

async function runWithConcurrency(items, worker, limit) {
  let idx = 0;
  async function next() {
    while (idx < items.length) {
      const current = idx++;
      await worker(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
}

function getCacheKey(word, country) {
  return `${(word || '').toLowerCase().trim()}|${country || ''}`;
}

async function fetchExactCountRaw(word, country) {
  let sum = 0;
  await runWithConcurrency(
    LETTERS,
    async (l) => {
      try {
        const data = await getSuggestions(`${word} ${l}`, country);
        if (Array.isArray(data)) sum += data.length;
      } catch {
        // is letter ko skip karo, baaki continue rahenge
      }
    },
    LETTER_CONCURRENCY
  );
  return sum;
}

export async function fetchExactCount(word, country) {
  const key = getCacheKey(word, country);

  if (countCache.has(key)) return countCache.get(key);
  if (inFlightPromises.has(key)) return inFlightPromises.get(key);

  const promise = (async () => {
    await acquireWordSlot();
    try {
      const total = await fetchExactCountRaw(word, country);
      countCache.set(key, total);
      return total;
    } catch {
      countCache.set(key, 0);
      return 0;
    } finally {
      releaseWordSlot();
      inFlightPromises.delete(key);
    }
  })();

  inFlightPromises.set(key, promise);
  return promise;
}

export function getCachedExactCount(word, country) {
  return countCache.get(getCacheKey(word, country));
}

export function useLazyExactCount(word, country) {
  const key = getCacheKey(word, country);
  const [count, setCount] = useState(() => countCache.get(key));
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    setCount(countCache.get(getCacheKey(word, country)));
    startedRef.current = false;
  }, [word, country]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !word) return;

    const cachedVal = countCache.get(key);
    if (cachedVal !== undefined) {
      setCount(cachedVal);
      return;
    }

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            setLoading(true);
            fetchExactCount(word, country).then((total) => {
              if (!cancelled) {
                setCount(total);
                setLoading(false);
              }
            });
            observer.disconnect();
          }
        });
      },
      { rootMargin: '150px' }
    );

    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [word, country, key]);

  return { ref, count, loading };
}