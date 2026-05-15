// Bob Prompt: "Write Jest unit tests for githubService.js covering metadata, file tree, README, file content, PRs, diffs, and health endpoints."
// Bob Output: Full test suite with mocked axios instance, Buffer decoding tests, and 404 error handling.
// Bob Guidance: GitHub returns base64-encoded content for files — test the Buffer.from decoding logic explicitly since it's a common bug source.
// ---- Actual Code Below ----

const axios = require('axios');

jest.mock('axios', () => {
  const mockClient = {
    get: jest.fn(),
  };
  return {
    create: jest.fn(() => mockClient),
    ...mockClient,
  };
});

const githubService = require('../backend/services/githubService');
const mockAxiosInstance = axios.create();

describe('githubService', () => {

  beforeEach(() => jest.clearAllMocks());

  // ─── getRepoMetadata ─────────────────────────────────────────────────────────
  describe('getRepoMetadata()', () => {

    it('returns formatted metadata on success', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          full_name:          'facebook/react',
          description:        'A JavaScript library for building UIs',
          stargazers_count:   220000,
          forks_count:        45000,
          open_issues_count:  700,
          language:           'JavaScript',
          default_branch:     'main',
          license:            { name: 'MIT License' },
          created_at:         '2013-05-24T16:15:54Z',
          updated_at:         '2024-01-01T00:00:00Z',
          html_url:           'https://github.com/facebook/react',
          topics:             ['react', 'javascript', 'ui'],
        },
      });

      const result = await githubService.getRepoMetadata('facebook', 'react');

      expect(result.success).toBe(true);
      expect(result.metadata.name).toBe('facebook/react');
      expect(result.metadata.stars).toBe(220000);
      expect(result.metadata.language).toBe('JavaScript');
      expect(result.metadata.license).toBe('MIT License');
      expect(result.metadata.topics).toContain('react');
    });

    it('throws a friendly error on 404', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({ response: { status: 404 } });

      await expect(
        githubService.getRepoMetadata('nobody', 'nonexistent')
      ).rejects.toThrow('Repository nobody/nonexistent not found or is private.');
    });

    it('handles repos with no license', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          full_name: 'user/repo', description: '', stargazers_count: 0,
          forks_count: 0, open_issues_count: 0, language: null,
          default_branch: 'main', license: null,
          created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
          html_url: 'https://github.com/user/repo', topics: [],
        },
      });

      const result = await githubService.getRepoMetadata('user', 'repo');
      expect(result.metadata.license).toBe('None');
    });
  });

  // ─── getFileTree ─────────────────────────────────────────────────────────────
  describe('getFileTree()', () => {

    it('returns files array and treeString on success', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          tree: [
            { path: 'src/index.js',   type: 'blob' },
            { path: 'src/app.js',     type: 'blob' },
            { path: 'src',            type: 'tree' }, // should be filtered out
            { path: 'package.json',   type: 'blob' },
          ],
        },
      });

      const result = await githubService.getFileTree('facebook', 'react', 'main');

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(3);               // tree node filtered
      expect(result.files).toContain('src/index.js');
      expect(result.files).not.toContain('src');          // no tree-type entries
      expect(result.treeString).toContain('package.json');
    });

    it('throws a friendly error when branch not found', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({ response: { status: 404 } });

      await expect(
        githubService.getFileTree('owner', 'repo', 'nonexistent-branch')
      ).rejects.toThrow('Branch "nonexistent-branch" not found in owner/repo.');
    });
  });

  // ─── getReadme ───────────────────────────────────────────────────────────────
  describe('getReadme()', () => {

    it('decodes base64 README content correctly', async () => {
      const rawContent = '# Hello World\nThis is a test README.';
      const encoded    = Buffer.from(rawContent).toString('base64');

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { content: encoded },
      });

      const result = await githubService.getReadme('owner', 'repo');

      expect(result.success).toBe(true);
      expect(result.readme).toBe(rawContent);
    });

    it('returns fallback message when README not found (404)', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({ response: { status: 404 } });

      const result = await githubService.getReadme('owner', 'repo');
      expect(result.success).toBe(true);
      expect(result.readme).toBe('No README found.');
    });
  });

  // ─── getFileContent ──────────────────────────────────────────────────────────
  describe('getFileContent()', () => {

    it('decodes base64 file content correctly', async () => {
      const code    = 'const x = 42;\nmodule.exports = x;';
      const encoded = Buffer.from(code).toString('base64');

      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { content: encoded },
      });

      const result = await githubService.getFileContent('owner', 'repo', 'src/x.js');

      expect(result.success).toBe(true);
      expect(result.content).toBe(code);
      expect(result.filename).toBe('src/x.js');
    });

    it('throws a friendly error when file not found', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({ response: { status: 404 } });

      await expect(
        githubService.getFileContent('owner', 'repo', 'nonexistent.js')
      ).rejects.toThrow('File "nonexistent.js" not found in owner/repo.');
    });
  });

  // ─── getPullRequests ─────────────────────────────────────────────────────────
  describe('getPullRequests()', () => {

    it('returns formatted PR list on success', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: [
          {
            number:        42,
            title:         'Add dark mode',
            body:          'Implements dark theme across all pages.',
            user:          { login: 'devuser' },
            created_at:    '2024-06-01T10:00:00Z',
            html_url:      'https://github.com/owner/repo/pull/42',
            additions:     150,
            deletions:     30,
            changed_files: 8,
          },
        ],
      });

      const result = await githubService.getPullRequests('owner', 'repo');

      expect(result.success).toBe(true);
      expect(result.pullRequests).toHaveLength(1);
      expect(result.pullRequests[0].number).toBe(42);
      expect(result.pullRequests[0].author).toBe('devuser');
      expect(result.pullRequests[0].additions).toBe(150);
    });

    it('returns empty array when no open PRs', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: [] });

      const result = await githubService.getPullRequests('owner', 'repo');
      expect(result.pullRequests).toHaveLength(0);
    });
  });

  // ─── getRepoHealth ───────────────────────────────────────────────────────────
  describe('getRepoHealth()', () => {

    it('calculates issue close rate correctly', async () => {
      mockAxiosInstance.get
        // commits
        .mockResolvedValueOnce({
          data: Array(15).fill({ commit: { author: { date: '2024-06-01' } } }),
        })
        // contributors
        .mockResolvedValueOnce({
          data: [{ login: 'alice' }, { login: 'bob' }],
        })
        // issues (20 closed, 5 open = 80% close rate)
        .mockResolvedValueOnce({
          data: [
            ...Array(20).fill({ state: 'closed' }),
            ...Array(5).fill({ state: 'open' }),
          ],
        });

      const result = await githubService.getRepoHealth('owner', 'repo');

      expect(result.success).toBe(true);
      expect(result.health.recentCommits).toBe(15);
      expect(result.health.totalContributors).toBe(2);
      expect(result.health.topContributor).toBe('alice');
      expect(result.health.issueCloseRate).toBe(80);
      expect(result.health.openIssues).toBe(5);
      expect(result.health.closedIssues).toBe(20);
    });

    it('handles zero issues without division errors', async () => {
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: [] })   // commits
        .mockResolvedValueOnce({ data: [] })   // contributors
        .mockResolvedValueOnce({ data: [] });  // issues

      const result = await githubService.getRepoHealth('owner', 'repo');
      expect(result.health.issueCloseRate).toBe(0);
      expect(result.health.topContributor).toBe('N/A');
    });
  });
});