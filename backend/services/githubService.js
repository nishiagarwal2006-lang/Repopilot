// Bob Prompt: "Build a GitHub API service to fetch repo metadata, file trees, README, and PR diffs."
// Bob Output: Axios-based service with clean methods for each GitHub data type.
// Bob Guidance: Use conditional requests and cache headers where possible; always handle 404s explicitly since repos can be private or nonexistent.
// ---- Actual Code Below ----

require('dotenv').config();
const axios = require('axios');
const logger = require('../utils/logger');

// ─── GitHub API Client ─────────────────────────────────────────────────────────
const githubClient = axios.create({
  baseURL: process.env.GITHUB_API_URL || 'https://api.github.com',
  headers: {
    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
  timeout: 15000,
});

// ─── 1. Get Repo Metadata ──────────────────────────────────────────────────────
/**
 * Fetches basic repo info: stars, forks, language, open issues, description.
 * @param {string} owner - GitHub username or org
 * @param {string} repo  - repository name
 */
const getRepoMetadata = async (owner, repo) => {
  try {
    logger.debug(`Fetching repo metadata for ${owner}/${repo}`);
    const res = await githubClient.get(`/repos/${owner}/${repo}`);
    const data = res.data;

    return {
      success: true,
      metadata: {
        name: data.full_name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        language: data.language,
        defaultBranch: data.default_branch,
        license: data.license?.name || 'None',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        url: data.html_url,
        topics: data.topics || [],
      },
    };
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`Repository ${owner}/${repo} not found or is private.`);
    }
    logger.error(`getRepoMetadata failed: ${err.message}`);
    throw new Error(`GitHub API error (metadata): ${err.message}`);
  }
};

// ─── 2. Get File Tree ──────────────────────────────────────────────────────────
/**
 * Fetches the full recursive file tree of the repo.
 * @param {string} owner  - GitHub username or org
 * @param {string} repo   - repository name
 * @param {string} branch - branch name (default: main)
 */
const getFileTree = async (owner, repo, branch = 'main') => {
  try {
    logger.debug(`Fetching file tree for ${owner}/${repo}@${branch}`);

    const res = await githubClient.get(
      `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );

    // Filter to only show files (not tree nodes) and limit depth for readability
    const files = res.data.tree
      .filter((item) => item.type === 'blob')
      .map((item) => item.path);

    // Format as a readable tree string for Bob
    const treeString = files.join('\n');

    return { success: true, files, treeString };
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`Branch "${branch}" not found in ${owner}/${repo}.`);
    }
    logger.error(`getFileTree failed: ${err.message}`);
    throw new Error(`GitHub API error (file tree): ${err.message}`);
  }
};

// ─── 3. Get README Content ─────────────────────────────────────────────────────
/**
 * Fetches and decodes the README.md of a repo.
 * @param {string} owner - GitHub username or org
 * @param {string} repo  - repository name
 */
const getReadme = async (owner, repo) => {
  try {
    logger.debug(`Fetching README for ${owner}/${repo}`);

    const res = await githubClient.get(`/repos/${owner}/${repo}/readme`);

    // GitHub returns README content as base64
    const content = Buffer.from(res.data.content, 'base64').toString('utf-8');

    return { success: true, readme: content };
  } catch (err) {
    if (err.response?.status === 404) {
      return { success: true, readme: 'No README found.' };
    }
    logger.error(`getReadme failed: ${err.message}`);
    throw new Error(`GitHub API error (readme): ${err.message}`);
  }
};

// ─── 4. Get File Content ───────────────────────────────────────────────────────
/**
 * Fetches the raw content of a specific file from the repo.
 * @param {string} owner    - GitHub username or org
 * @param {string} repo     - repository name
 * @param {string} filePath - path to the file in the repo
 */
const getFileContent = async (owner, repo, filePath) => {
  try {
    logger.debug(`Fetching file content: ${owner}/${repo}/${filePath}`);

    const res = await githubClient.get(
      `/repos/${owner}/${repo}/contents/${filePath}`
    );

    const content = Buffer.from(res.data.content, 'base64').toString('utf-8');

    return { success: true, content, filename: filePath };
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`File "${filePath}" not found in ${owner}/${repo}.`);
    }
    logger.error(`getFileContent failed: ${err.message}`);
    throw new Error(`GitHub API error (file content): ${err.message}`);
  }
};

// ─── 5. Get Open Pull Requests ────────────────────────────────────────────────
/**
 * Fetches a list of open PRs for a repo.
 * @param {string} owner - GitHub username or org
 * @param {string} repo  - repository name
 */
const getPullRequests = async (owner, repo) => {
  try {
    logger.debug(`Fetching PRs for ${owner}/${repo}`);

    const res = await githubClient.get(`/repos/${owner}/${repo}/pulls`, {
      params: { state: 'open', per_page: 10 },
    });

    const prs = res.data.map((pr) => ({
      number: pr.number,
      title: pr.title,
      body: pr.body || '',
      author: pr.user.login,
      createdAt: pr.created_at,
      url: pr.html_url,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
    }));

    return { success: true, pullRequests: prs };
  } catch (err) {
    logger.error(`getPullRequests failed: ${err.message}`);
    throw new Error(`GitHub API error (pull requests): ${err.message}`);
  }
};

// ─── 6. Get PR Diff ────────────────────────────────────────────────────────────
/**
 * Fetches the raw diff of a specific pull request.
 * @param {string} owner    - GitHub username or org
 * @param {string} repo     - repository name
 * @param {number} prNumber - PR number
 */
const getPRDiff = async (owner, repo, prNumber) => {
  try {
    logger.debug(`Fetching diff for PR #${prNumber} in ${owner}/${repo}`);

    const res = await githubClient.get(
      `/repos/${owner}/${repo}/pulls/${prNumber}`,
      {
        headers: { Accept: 'application/vnd.github.v3.diff' },
      }
    );

    return { success: true, diff: res.data };
  } catch (err) {
    logger.error(`getPRDiff failed: ${err.message}`);
    throw new Error(`GitHub API error (pr diff): ${err.message}`);
  }
};

// ─── 7. Repo Health Stats ──────────────────────────────────────────────────────
/**
 * Fetches combined health stats: commit frequency, contributor count, issue ratio.
 * @param {string} owner - GitHub username or org
 * @param {string} repo  - repository name
 */
const getRepoHealth = async (owner, repo) => {
  try {
    logger.debug(`Fetching repo health for ${owner}/${repo}`);

    const [commitsRes, contributorsRes, issuesRes] = await Promise.all([
      githubClient.get(`/repos/${owner}/${repo}/commits?per_page=30`),
      githubClient.get(`/repos/${owner}/${repo}/contributors?per_page=10`),
      githubClient.get(`/repos/${owner}/${repo}/issues?state=all&per_page=30`),
    ]);

    const commits = commitsRes.data;
    const contributors = contributorsRes.data;
    const issues = issuesRes.data;

    const openIssues = issues.filter((i) => i.state === 'open').length;
    const closedIssues = issues.filter((i) => i.state === 'closed').length;
    const issueCloseRate =
      issues.length > 0
        ? Math.round((closedIssues / issues.length) * 100)
        : 0;

    return {
      success: true,
      health: {
        recentCommits: commits.length,
        totalContributors: contributors.length,
        topContributor: contributors[0]?.login || 'N/A',
        openIssues,
        closedIssues,
        issueCloseRate,
        lastCommitDate: commits[0]?.commit?.author?.date || 'N/A',
      },
    };
  } catch (err) {
    logger.error(`getRepoHealth failed: ${err.message}`);
    throw new Error(`GitHub API error (repo health): ${err.message}`);
  }
};

module.exports = {
  getRepoMetadata,
  getFileTree,
  getReadme,
  getFileContent,
  getPullRequests,
  getPRDiff,
  getRepoHealth,
};