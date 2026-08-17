


const MAX_CONCURRENT = 5;

let active = 0;
const queue = [];

function acquire() {
  if (active < MAX_CONCURRENT) {
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


async function withLimit(fn) {
  await acquire();
  try {
    return await fn();
  } finally {
    release();
  }
}


// interest aur related pehle do ALAG queues the (apna-apna 1-at-a-time lock) -
// iska matlab ek hi range/country change par dono TYPES ek sath (parallel)
// Google Trends ko hit kar sakte the (aur google-trends-api har call mein
// khud 2 real HTTP requests bhejta hai - explore token + widgetdata).
// Yani ek click par 4+ simultaneous requests same IP se Google ko jaate the,
// jo IP block trigger karta tha. Ab dono ek hi shared queue/gap se guzarte
// hain taake kisi bhi waqt sirf EK Google Trends request in-flight ho.
const TRENDS_MIN_GAP_MS = 2000;
let trendsActive = 0;
const trendsQueue = [];
let lastTrendsCallAt = 0;

function acquireTrends() {
  if (trendsActive < 1) {
    trendsActive++;
    return Promise.resolve();
  }
  return new Promise((resolve) => trendsQueue.push(resolve));
}

function releaseTrends() {
  trendsActive--;
  const next = trendsQueue.shift();
  if (next) {
    trendsActive++;
    next();
  }
}

async function withTrendsLimit(fn) {
  await acquireTrends();
  try {
    const elapsed = Date.now() - lastTrendsCallAt;
    if (elapsed < TRENDS_MIN_GAP_MS) {
      await new Promise((r) => setTimeout(r, TRENDS_MIN_GAP_MS - elapsed));
    }
    lastTrendsCallAt = Date.now();
    return await fn();
  } finally {
    releaseTrends();
  }
}

const withRelatedLimit = withTrendsLimit;
const withInterestLimit = withTrendsLimit;

module.exports = { withLimit, withRelatedLimit, withInterestLimit };
