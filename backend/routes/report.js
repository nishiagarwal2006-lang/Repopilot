// Bob Prompt: "Create Express routes to export, list, and view IBM Bob session reports."
// Bob Output: Three routes — POST to export, GET to list saved reports, GET to view live sessions.
// Bob Guidance: The export route should trigger a file write and return the filename so the frontend can display a download confirmation.
// ---- Actual Code Below ----

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const {
  exportReport,
  listReports,
  getLiveSessions,
} = require('../services/reportService');

// ─── POST /api/report/export ──────────────────────────────────────────────────
/**
 * Exports all current Bob sessions to a JSON file in /bob-report/sessions/.
 * Returns the filename and session count.
 */
router.post('/export', async (req, res) => {
  try {
    logger.info('Bob report export triggered');
    const result = exportReport();
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/report/export error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/report/list ─────────────────────────────────────────────────────
/**
 * Lists all previously exported Bob report files.
 */
router.get('/list', async (req, res) => {
  try {
    logger.info('Listing saved Bob reports');
    const result = listReports();
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/report/list error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/report/live ─────────────────────────────────────────────────────
/**
 * Returns all in-memory Bob sessions (live, not yet exported).
 * Used by the frontend dashboard to show real-time Bob activity.
 */
router.get('/live', async (req, res) => {
  try {
    logger.info('Fetching live Bob sessions');
    const result = getLiveSessions();
    return res.status(200).json(result);
  } catch (err) {
    logger.error(`/report/live error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;