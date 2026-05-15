// Bob Prompt: "Build a report service that exports all Bob sessions to a JSON file for the hackathon Bob report requirement."
// Bob Output: Service that collects session logs and writes them to /bob-report/sessions/ as timestamped JSON files.
// Bob Guidance: Include metadata (project name, export time, session count) at the top of each report for easy auditing.
// ---- Actual Code Below ----

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { getSessions } = require('./bobService');

// ─── Report Output Directory ───────────────────────────────────────────────────
const REPORT_DIR = path.resolve(
  process.env.REPORT_OUTPUT_DIR || path.join(__dirname, '../../bob-report/sessions')
);

/**
 * Ensures the report output directory exists.
 */
const ensureReportDir = () => {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
    logger.info(`Created report directory: ${REPORT_DIR}`);
  }
};

// ─── Export Bob Session Report ─────────────────────────────────────────────────
/**
 * Exports all current Bob sessions to a timestamped JSON file.
 * @returns {object} - export metadata including file path and session count
 */
const exportReport = () => {
  ensureReportDir();

  const sessions = getSessions();
  const reportId = uuidv4();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `bob-session-${timestamp}.json`;
  const filepath = path.join(REPORT_DIR, filename);

  // Build the report object
  const report = {
    reportId,
    projectName: 'RepoPilot',
    exportedAt: new Date().toISOString(),
    totalSessions: sessions.length,
    sessionTypes: {
      'repo-summary': sessions.filter((s) => s.type === 'repo-summary').length,
      'doc-generation': sessions.filter((s) => s.type === 'doc-generation').length,
      'test-scaffold': sessions.filter((s) => s.type === 'test-scaffold').length,
      'pr-review': sessions.filter((s) => s.type === 'pr-review').length,
    },
    sessions,
  };

  // Write to file
  fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf-8');
  logger.info(`Bob report exported: ${filepath}`);

  return {
    success: true,
    reportId,
    filename,
    filepath,
    totalSessions: sessions.length,
    exportedAt: report.exportedAt,
  };
};

// ─── Get All Saved Reports ─────────────────────────────────────────────────────
/**
 * Lists all previously exported report files.
 * @returns {Array} - list of report filenames and their sizes
 */
const listReports = () => {
  ensureReportDir();

  const files = fs.readdirSync(REPORT_DIR).filter((f) => f.endsWith('.json'));

  const reports = files.map((file) => {
    const filePath = path.join(REPORT_DIR, file);
    const stats = fs.statSync(filePath);
    return {
      filename: file,
      sizeKB: Math.round(stats.size / 1024),
      createdAt: stats.birthtime,
    };
  });

  return { success: true, reports };
};

// ─── Get Live Session Summary ──────────────────────────────────────────────────
/**
 * Returns in-memory Bob sessions (not yet exported to file).
 */
const getLiveSessions = () => {
  const sessions = getSessions();
  return {
    success: true,
    totalSessions: sessions.length,
    sessions,
  };
};

module.exports = {
  exportReport,
  listReports,
  getLiveSessions,
};