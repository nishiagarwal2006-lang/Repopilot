// Bob Prompt: "Write complete Jest unit tests for bobService.js covering all four AI functions and the session logger."
// Bob Output: Full test suite with mocked axios, happy paths, error cases, and session log verification.
// Bob Guidance: Mock the entire axios module so tests never make real HTTP calls; verify session logs are populated after each call.
// ---- Actual Code Below ----

const axios = require('axios');

// Mock axios before importing the service
jest.mock('axios', () => {
  const mockClient = {
    post: jest.fn(),
    get:  jest.fn(),
  };
  return {
    create: jest.fn(() => mockClient),
    ...mockClient,
  };
});

const bobService = require('../backend/services/bobService');

// Get reference to the mocked axios instance
const mockAxiosInstance = axios.create();

describe('bobService', () => {

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── summarizeRepo ──────────────────────────────────────────────────────────
  describe('summarizeRepo()', () => {

    it('returns a summary and sessionId on success', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { output: 'This repo is a React UI library with TypeScript support.' },
      });

      const result = await bobService.summarizeRepo(
        'facebook/react',
        'src/index.js\npackage.json',
        '# React\nA JavaScript library for building UIs.'
      );

      expect(result.success).toBe(true);
      expect(result.summary).toBe('This repo is a React UI library with TypeScript support.');
      expect(result.sessionId).toBeDefined();
      expect(typeof result.sessionId).toBe('string');
    });

    it('throws an error when Bob API fails', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(
        bobService.summarizeRepo('owner/repo', 'tree', 'readme')
      ).rejects.toThrow('Bob API error (summarize): Network timeout');
    });

    it('handles missing output field gracefully', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: {} });

      const result = await bobService.summarizeRepo('owner/repo', 'tree', 'readme');
      expect(result.summary).toBe('No summary returned.');
    });
  });

  // ─── generateDocs ───────────────────────────────────────────────────────────
  describe('generateDocs()', () => {

    it('returns documentation and sessionId on success', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { output: '/** @module helper */\n\n## Helper Module\nProvides utility functions.' },
      });

      const result = await bobService.generateDocs('helper.js', 'const add = (a,b) => a+b;');

      expect(result.success).toBe(true);
      expect(result.documentation).toContain('@module helper');
      expect(result.sessionId).toBeDefined();
    });

    it('throws an error when Bob API fails', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Rate limit exceeded'));

      await expect(
        bobService.generateDocs('file.js', 'code')
      ).rejects.toThrow('Bob API error (docs): Rate limit exceeded');
    });

    it('handles empty code input', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { text: 'No functions found to document.' },
      });

      const result = await bobService.generateDocs('empty.js', '');
      expect(result.success).toBe(true);
      expect(result.documentation).toBe('No functions found to document.');
    });
  });

  // ─── generateTests ──────────────────────────────────────────────────────────
  describe('generateTests()', () => {

    it('returns a Jest test scaffold on success', async () => {
      const mockTests = `
        describe('add()', () => {
          it('adds two numbers correctly', () => {
            expect(add(2, 3)).toBe(5);
          });
        });
      `;
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { output: mockTests },
      });

      const result = await bobService.generateTests('math.js', 'const add = (a,b) => a+b;');

      expect(result.success).toBe(true);
      expect(result.tests).toContain("describe('add()'");
      expect(result.sessionId).toBeDefined();
    });

    it('throws an error when Bob API fails', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(
        bobService.generateTests('file.js', 'code')
      ).rejects.toThrow('Bob API error (tests): Unauthorized');
    });
  });

  // ─── reviewPR ───────────────────────────────────────────────────────────────
  describe('reviewPR()', () => {

    it('returns a PR review and sessionId on success', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          output: '1. This PR adds a login feature.\n2. No issues found.\n3. Overall: Approve',
        },
      });

      const result = await bobService.reviewPR(
        'Add login feature',
        'Implements JWT auth',
        '--- a/auth.js\n+++ b/auth.js\n@@ -1 +1,5 @@\n+const jwt = require("jsonwebtoken");'
      );

      expect(result.success).toBe(true);
      expect(result.review).toContain('Approve');
      expect(result.sessionId).toBeDefined();
    });

    it('throws an error when Bob API fails', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Service unavailable'));

      await expect(
        bobService.reviewPR('PR title', 'body', 'diff')
      ).rejects.toThrow('Bob API error (pr-review): Service unavailable');
    });

    it('works with empty PR body', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { output: 'No description but diff looks clean. Approve.' },
      });

      const result = await bobService.reviewPR('Fix typo', '', '- typo\n+ fixed');
      expect(result.success).toBe(true);
    });
  });

  // ─── getSessions ────────────────────────────────────────────────────────────
  describe('getSessions()', () => {

    it('returns an array of logged sessions', async () => {
      // Trigger a session by calling summarizeRepo
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { output: 'Summary here.' },
      });
      await bobService.summarizeRepo('test/repo', 'tree', 'readme');

      const sessions = bobService.getSessions();

      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(0);

      const last = sessions[sessions.length - 1];
      expect(last).toHaveProperty('id');
      expect(last).toHaveProperty('type', 'repo-summary');
      expect(last).toHaveProperty('prompt');
      expect(last).toHaveProperty('response');
      expect(last).toHaveProperty('timestamp');
    });

    it('accumulates sessions across multiple calls', async () => {
      mockAxiosInstance.post
        .mockResolvedValueOnce({ data: { output: 'Doc output.' } })
        .mockResolvedValueOnce({ data: { output: 'Test output.' } });

      const before = bobService.getSessions().length;

      await bobService.generateDocs('a.js', 'code a');
      await bobService.generateTests('b.js', 'code b');

      const after = bobService.getSessions().length;
      expect(after).toBe(before + 2);
    });
  });
});