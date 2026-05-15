// Bob Prompt: "Write Jest tests for reportService.js covering export, list, and live session endpoints with mocked file system."
// Bob Output: Tests using jest.mock for fs and bobService, verifying file writes and report structure.
// Bob Guidance: Always mock fs and bobService together — report service depends on both. Verify the written JSON structure, not just that writeFileSync was called.
// ---- Actual Code Below ----

const fs   = require('fs');
const path = require('path');

// Mock fs module
jest.mock('fs');

// Mock bobService to control sessions
jest.mock('../backend/services/bobService', () => ({
  getSessions: jest.fn(),
}));

const { getSessions } = require('../backend/services/bobService');
const reportService   = require('../backend/services/reportService');

describe('reportService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: directory already exists
    fs.existsSync.mockReturnValue(true);
    fs.writeFileSync.mockImplementation(() => {});
    fs.readdirSync.mockReturnValue([]);
    fs.statSync.mockReturnValue({ size: 2048, birthtime: new Date('2024-06-01') });
  });

  // ─── exportReport ────────────────────────────────────────────────────────────
  describe('exportReport()', () => {

    it('writes a JSON report file and returns metadata', () => {
      const mockSessions = [
        {
          id: 'abc-123', type: 'repo-summary',
          prompt: 'Summarize this repo', response: 'Summary here',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'def-456', type: 'doc-generation',
          prompt: 'Generate docs', response: 'Docs here',
          timestamp: new Date().toISOString(),
        },
      ];

      getSessions.mockReturnValue(mockSessions);

      const result = reportService.exportReport();

      // Returns correct metadata
      expect(result.success).toBe(true);
      expect(result.totalSessions).toBe(2);
      expect(result.filename).toMatch(/^bob-session-.*\.json$/);
      expect(result.reportId).toBeDefined();
      expect(result.exportedAt).toBeDefined();

      // Verify fs.writeFileSync was called
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);

      // Verify the written content is valid JSON with correct structure
      const writeCall  = fs.writeFileSync.mock.calls[0];
      const writtenStr = writeCall[1];
      const written    = JSON.parse(writtenStr);

      expect(written.projectName).toBe('RepoPilot');
      expect(written.totalSessions).toBe(2);
      expect(written.sessions).toHaveLength(2);
      expect(written.sessionTypes['repo-summary']).toBe(1);
      expect(written.sessionTypes['doc-generation']).toBe(1);
    });

    it('creates the report directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});
      getSessions.mockReturnValue([]);

      reportService.exportReport();

      expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    });

    it('exports an empty sessions array without errors', () => {
      getSessions.mockReturnValue([]);

      const result = reportService.exportReport();

      expect(result.success).toBe(true);
      expect(result.totalSessions).toBe(0);
    });
  });

  // ─── listReports ─────────────────────────────────────────────────────────────
  describe('listReports()', () => {

    it('returns a list of exported report files', () => {
      fs.readdirSync.mockReturnValue([
        'bob-session-2024-01-01.json',
        'bob-session-2024-01-02.json',
        'not-a-report.txt',   // should be filtered
      ]);

      const result = reportService.listReports();

      expect(result.success).toBe(true);
      expect(result.reports).toHaveLength(2);   // .txt filtered out
      expect(result.reports[0].filename).toBe('bob-session-2024-01-01.json');
      expect(result.reports[0].sizeKB).toBe(2); // 2048 bytes = 2KB
      expect(result.reports[0].createdAt).toBeInstanceOf(Date);
    });

    it('returns empty array when no reports exist', () => {
      fs.readdirSync.mockReturnValue([]);

      const result = reportService.listReports();
      expect(result.reports).toHaveLength(0);
    });
  });

  // ─── getLiveSessions ─────────────────────────────────────────────────────────
  describe('getLiveSessions()', () => {

    it('returns current in-memory sessions with count', () => {
      const mockSessions = [
        { id: '1', type: 'pr-review',      prompt: 'Review PR', response: 'Approved', timestamp: new Date().toISOString() },
        { id: '2', type: 'test-scaffold',  prompt: 'Gen tests', response: 'Tests...',  timestamp: new Date().toISOString() },
      ];
      getSessions.mockReturnValue(mockSessions);

      const result = reportService.getLiveSessions();

      expect(result.success).toBe(true);
      expect(result.totalSessions).toBe(2);
      expect(result.sessions).toHaveLength(2);
      expect(result.sessions[0].type).toBe('pr-review');
    });

    it('returns zero sessions when Bob has not been used yet', () => {
      getSessions.mockReturnValue([]);

      const result = reportService.getLiveSessions();
      expect(result.totalSessions).toBe(0);
      expect(result.sessions).toEqual([]);
    });
  });
});