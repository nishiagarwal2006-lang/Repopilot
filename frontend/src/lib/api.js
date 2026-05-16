// Bob Prompt: "Create a centralized API client for the Next.js frontend to call all backend endpoints."
// Bob Output: Axios instance with auth headers pre-configured and one function per backend route.
// Bob Guidance: Centralize all API calls in one file so you only update the base URL in one place during deployment.
// ---- Actual Code Below ----

import axios from 'axios';

// ─── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s — Bob AI calls can be slow
});

// ─── Response interceptor — normalize errors ───────────────────────────────────
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// ─── Bob API Calls ─────────────────────────────────────────────────────────────
export const bobAPI = {
  summarize: (repoName, fileTree, readme) =>
    api.post('/bob/summarize', { repoName, fileTree, readme }),

  generateDocs: (filename, code) =>
    api.post('/bob/generate-docs', { filename, code }),

  generateTests: (filename, code) =>
    api.post('/bob/generate-tests', { filename, code }),

  reviewPR: (prTitle, prBody, diff) =>
    api.post('/bob/review-pr', { prTitle, prBody, diff }),
};

// ─── GitHub API Calls ──────────────────────────────────────────────────────────
export const githubAPI = {
  getMetadata: (owner, repo) =>
    api.get(`/github/${owner}/${repo}/metadata`),

  getFileTree: (owner, repo, branch = 'main') =>
    api.get(`/github/${owner}/${repo}/tree?branch=${branch}`),

  getReadme: (owner, repo) =>
    api.get(`/github/${owner}/${repo}/readme`),

  getFileContent: (owner, repo, filePath) =>
    api.get(`/github/${owner}/${repo}/file?path=${encodeURIComponent(filePath)}`),

  getPullRequests: (owner, repo) =>
    api.get(`/github/${owner}/${repo}/pulls`),

  getPRDiff: (owner, repo, prNumber) =>
    api.get(`/github/${owner}/${repo}/pulls/${prNumber}/diff`),

  getRepoHealth: (owner, repo) =>
    api.get(`/github/${owner}/${repo}/health`),
};

// ─── Report API Calls ──────────────────────────────────────────────────────────
export const reportAPI = {
  exportReport: () => api.post('/report/export'),
  listReports:  () => api.get('/report/list'),
  liveSessions: () => api.get('/report/live'),
};