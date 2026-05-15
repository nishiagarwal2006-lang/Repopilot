// Bob Prompt: "Create Express routes to expose GitHub repo data: metadata, file tree, README, file content, PRs, diffs, and repo health."
// Bob Output: Seven GET routes with owner/repo path params and clean error handling.
// Bob Guidance: Use path params for owner/repo (RESTful), query params for optional filters like branch or filePath. Always sanitize inputs.
// ---- Actual Code Below ----

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const {
  getRepoMetadata,
  getFileTree,
  getReadme,
  getFileContent,
  getPullRequests,
  getPRDiff,
  getRepoHealth,
} = require('../services/githubService');

// ─── Helper: sanitize owner/repo ──────────────────────────────────────────────
// Prevents path traversal attacks by only allowing alphanumeric, dash, dot, underscore
const sanitize = (str) => str.replace(/[^a-zA-Z0-9\-_.]/g, '');

// ─── GET /api/github/:owner/:repo/metadata ────────────────────────────────────
/**
 * Returns basic repo info: stars, forks, language, issues, license.
 */
router.get('/:owner/:repo/metadata', async (req, res) => {
  try {
    const owner = sanitize(req.params.owner);
    const repo = sanitize(req.params.repo);
    logger.info(`GitHub metadata request: ${owner}/${repo}`);

    const result = await getRepoMetadata(owner, repo);
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/github/metadata error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/github/:owner/:repo/tree ────────────────────────────────────────
/**
 * Returns the full recursive file tree.
 * Query: ?branch=main (optional, defaults to main)
 */
router.get('/:owner/:repo/tree', async (req, res) => {
  try {
    const owner = sanitize(req.params.owner);
    const repo = sanitize(req.params.repo);
    const branch = req.query.branch || 'main';
    logger.info(`GitHub file tree request: ${owner}/${repo}@${branch}`);

    const result = await getFileTree(owner, repo, branch);
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/github/tree error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/github/:owner/:repo/readme ──────────────────────────────────────
/**
 * Returns the decoded README.md content.
 */
router.get('/:owner/:repo/readme', async (req, res) => {
  try {
    const owner = sanitize(req.params.owner);
    const repo = sanitize(req.params.repo);
    logger.info(`GitHub README request: ${owner}/${repo}`);

    const result = await getReadme(owner, repo);
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/github/readme error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/github/:owner/:repo/file ────────────────────────────────────────
/**
 * Returns the decoded content of a specific file.
 * Query: ?path=src/index.js (required)
 */
router.get('/:owner/:repo/file', async (req, res) => {
  const filePath = req.query.path;

  if (!filePath) {
    return res.status(400).json({
      success: false,
      error: 'Query param "path" is required. e.g. ?path=src/index.js',
    });
  }

  try {
    const owner = sanitize(req.params.owner);
    const repo = sanitize(req.params.repo);
    logger.info(`GitHub file content request: ${owner}/${repo}/${filePath}`);

    const result = await getFileContent(owner, repo, filePath);
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/github/file error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/github/:owner/:repo/pulls ───────────────────────────────────────
/**
 * Returns a list of open pull requests (max 10).
 */
router.get('/:owner/:repo/pulls', async (req, res) => {
  try {
    const owner = sanitize(req.params.owner);
    const repo = sanitize(req.params.repo);
    logger.info(`GitHub PRs request: ${owner}/${repo}`);

    const result = await getPullRequests(owner, repo);
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/github/pulls error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/github/:owner/:repo/pulls/:prNumber/diff ────────────────────────
/**
 * Returns the raw diff of a specific pull request.
 */
router.get('/:owner/:repo/pulls/:prNumber/diff', async (req, res) => {
  try {
    const owner = sanitize(req.params.owner);
    const repo = sanitize(req.params.repo);
    const prNumber = parseInt(req.params.prNumber, 10);

    if (isNaN(prNumber)) {
      return res.status(400).json({
        success: false,
        error: 'PR number must be a valid integer.',
      });
    }

    logger.info(`GitHub PR diff request: ${owner}/${repo} #${prNumber}`);
    const result = await getPRDiff(owner, repo, prNumber);
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/github/pulls/diff error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/github/:owner/:repo/health ──────────────────────────────────────
/**
 * Returns repo health stats: commit frequency, contributors, issue close rate.
 */
router.get('/:owner/:repo/health', async (req, res) => {
  try {
    const owner = sanitize(req.params.owner);
    const repo = sanitize(req.params.repo);
    logger.info(`GitHub repo health request: ${owner}/${repo}`);

    const result = await getRepoHealth(owner, repo);
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/github/health error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;