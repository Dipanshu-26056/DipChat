const rateLimit = require("express-rate-limit");

const summarizeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many summarize requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = summarizeLimiter;