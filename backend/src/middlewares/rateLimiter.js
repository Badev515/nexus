
const rateLimit = require('express-rate-limit');

exports.suggestionsLimiter = rateLimit({
  windowMs: 1000,
  max: 60,        // cached/fast responses ke liye realistic — asli Google-protection to scrapeLimiter (concurrency-5) kar raha hai
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' },
});