const express = require("express");
const { summarizeChat } = require("../controllers/summarize.controller.js");
const summarizeLimiter = require("../middlewares/rateLimiter.js");

const router = express.Router();

router.post("/summarize", summarizeLimiter, summarizeChat);

module.exports = router;