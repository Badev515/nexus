

import api from './axios';

// Reusable queue factory — har feature ka apna independent concurrency-limiter
function createQueue(maxConcurrent) {
  let active = 0;
  const queue = [];

  function acquire() {
    if (active < maxConcurrent) {
      active++;
      return Promise.resolve();
    }
    return new Promise((resolve) => queue.push(resolve));
  }

  function release() {
    active--;
    const next = queue.shift();
    if (next) {
      active++;
      next();
    }
  }

  return { acquire, release };
}

// Grid ki apni A-Z listing ke liye alag queue
const gridQueue = createQueue(6);
// Exact-count feature (Grid word-hover + Top/Rising Queries) ke liye alag queue
const countQueue = createQueue(6);

// Grid ki A-Z listing ke liye use hoti hai (RelatedWordsGrid.jsx)
export const getSuggestions = async (term, country) => {
  await gridQueue.acquire();
  try {
    const res = await api.get('/playstore/suggestions', { params: { term, country } });
    return res.data;
  } finally {
    gridQueue.release();
  }
};

// Sirf exact-count calculation (useExactCount.js) ke liye — alag queue,
// taake Grid listing ke sath compete na kare
export const getSuggestionsForCount = async (term, country) => {
  await countQueue.acquire();
  try {
    const res = await api.get('/playstore/suggestions', { params: { term, country } });
    return res.data;
  } finally {
    countQueue.release();
  }
};

export const searchApps = (term, country) =>
  api.get('/playstore/search', { params: { term, country } }).then((res) => res.data);

export const getAppDetails = (appId, country) =>
  api.get('/playstore/details', { params: { appId, country } }).then((res) => res.data);