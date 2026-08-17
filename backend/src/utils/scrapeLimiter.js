
// const MAX_CONCURRENT = 5;

// let active = 0;
// const queue = [];

// function acquire() {
//   if (active < MAX_CONCURRENT) {
//     active++;
//     return Promise.resolve();
//   }
//   return new Promise((resolve) => queue.push(resolve));
// }

// function release() {
//   active--;
//   const next = queue.shift();
//   if (next) {
//     active++;
//     next();
//   }
// }

// async function withLimit(fn) {
//   await acquire();
//   try {
//     return await fn();
//   } finally {
//     release();
//   }
// }

// // Google Trends "related queries" endpoint bohot sensitive hai — isko sirf
// // 1 concurrent request + minimum gap chahiye, warna Google turant block kar deta hai.
// const RELATED_MIN_GAP_MS = 1500; // har call ke beech kam se kam 1.5 second
// let relatedActive = 0;
// const relatedQueue = [];
// let lastRelatedCallAt = 0;

// function acquireRelated() {
//   if (relatedActive < 1) {
//     relatedActive++;
//     return Promise.resolve();
//   }
//   return new Promise((resolve) => relatedQueue.push(resolve));
// }

// function releaseRelated() {
//   relatedActive--;
//   const next = relatedQueue.shift();
//   if (next) {
//     relatedActive++;
//     next();
//   }
// }

// async function withRelatedLimit(fn) {
//   await acquireRelated();
//   try {
//     const elapsed = Date.now() - lastRelatedCallAt;
//     if (elapsed < RELATED_MIN_GAP_MS) {
//       await new Promise((r) => setTimeout(r, RELATED_MIN_GAP_MS - elapsed));
//     }
//     lastRelatedCallAt = Date.now();
//     return await fn();
//   } finally {
//     releaseRelated();
//   }
// }

// module.exports = { withLimit, withRelatedLimit };


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

// Play Store scraping ke liye - is endpoint ko zyada requests bardasht
// karne ki tolerance hai, isliye zyada concurrency theek hai.
async function withLimit(fn) {
  await acquire();
  try {
    return await fn();
  } finally {
    release();
  }
}


const RELATED_MIN_GAP_MS = 1500; 
let relatedActive = 0;
const relatedQueue = [];
let lastRelatedCallAt = 0;

function acquireRelated() {
  if (relatedActive < 1) {
    relatedActive++;
    return Promise.resolve();
  }
  return new Promise((resolve) => relatedQueue.push(resolve));
}

function releaseRelated() {
  relatedActive--;
  const next = relatedQueue.shift();
  if (next) {
    relatedActive++;
    next();
  }
}

async function withRelatedLimit(fn) {
  await acquireRelated();
  try {
    const elapsed = Date.now() - lastRelatedCallAt;
    if (elapsed < RELATED_MIN_GAP_MS) {
      await new Promise((r) => setTimeout(r, RELATED_MIN_GAP_MS - elapsed));
    }
    lastRelatedCallAt = Date.now();
    return await fn();
  } finally {
    releaseRelated();
  }
}

const INTEREST_MIN_GAP_MS = 1500;
let interestActive = 0;
const interestQueue = [];
let lastInterestCallAt = 0;

function acquireInterest() {
  if (interestActive < 1) {
    interestActive++;
    return Promise.resolve();
  }
  return new Promise((resolve) => interestQueue.push(resolve));
}

function releaseInterest() {
  interestActive--;
  const next = interestQueue.shift();
  if (next) {
    interestActive++;
    next();
  }
}

async function withInterestLimit(fn) {
  await acquireInterest();
  try {
    const elapsed = Date.now() - lastInterestCallAt;
    if (elapsed < INTEREST_MIN_GAP_MS) {
      await new Promise((r) => setTimeout(r, INTEREST_MIN_GAP_MS - elapsed));
    }
    lastInterestCallAt = Date.now();
    return await fn();
  } finally {
    releaseInterest();
  }
}

module.exports = { withLimit, withRelatedLimit, withInterestLimit };
