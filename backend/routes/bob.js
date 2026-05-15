// Bob Prompt: "Create Express routes for all IBM Bob AI features: repo summary, doc generation, test scaffolding, and PR review."
// Bob Output: Four POST routes with input validation and clean error responses.
// Bob Guidance: Validate all required fields before calling the service layer; return consistent response shapes so the frontend can handle them uniformly.
// ---- Actual Code Below ----

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const {
  summarizeRepo,
  generateDocs,
  generateTests,
  reviewPR,
} = require('../services/bobService');

// ─── Helper: Validate required fields ─────────────────────────────────────────
const validateFields = (fields, body) => {
  const missing = fields.filter((f) => !body[f]);
  return missing;
};

// ─── POST /api/bob/summarize ───────────────────────────────────────────────────
/**
 * Summarizes a GitHub repo using IBM Bob.
 * Body: { repoName, fileTree, readme }
 */
router.post('/summarize', async (req, res) => {
  const missing = validateFields(['repoName', 'fileTree', 'readme'], req.body);
  if (missing.length) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  try {
    const { repoName, fileTree, readme } = req.body;
    logger.info(`Bob summarize request for repo: ${repoName}`);

    const result = await summarizeRepo(repoName, fileTree, readme);
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/bob/summarize error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/bob/generate-docs ──────────────────────────────────────────────
/**
 * Generates JSDoc + markdown documentation for a code file using IBM Bob.
 * Body: { filename, code }
 */
router.post('/generate-docs', async (req, res) => {
  const missing = validateFields(['filename', 'code'], req.body);
  if (missing.length) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  try {
    const { filename, code } = req.body;
    logger.info(`Bob generate-docs request for file: ${filename}`);

    const result = await generateDocs(filename, code);
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/bob/generate-docs error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/bob/generate-tests ─────────────────────────────────────────────
/**
 * Scaffolds Jest unit tests for a code file using IBM Bob.
 * Body: { filename, code }
 */
router.post('/generate-tests', async (req, res) => {
  const missing = validateFields(['filename', 'code'], req.body);
  if (missing.length) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  try {
    const { filename, code } = req.body;
    logger.info(`Bob generate-tests request for file: ${filename}`);

    const result = await generateTests(filename, code);
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/bob/generate-tests error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/bob/review-pr ──────────────────────────────────────────────────
/**
 * Reviews a pull request diff using IBM Bob.
 * Body: { prTitle, prBody, diff }
 */
router.post('/review-pr', async (req, res) => {
  const missing = validateFields(['prTitle', 'diff'], req.body);
  if (missing.length) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  try {
    const { prTitle, prBody = '', diff } = req.body;
    logger.info(`Bob review-pr request for PR: "${prTitle}"`);

    const result = await reviewPR(prTitle, prBody, diff);
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/bob/review-pr error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;