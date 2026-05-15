// Bob Prompt: "Create a service layer to interact with IBM Bob's API for repo summarization, doc generation, and test scaffolding."
// Bob Output: Axios-based service with dedicated methods for each Bob capability.
// Bob Guidance: Isolate all Bob API calls in a service layer so routes stay clean; always log session IDs for the Bob report export.
// ---- Actual Code Below ----

require('dotenv').config();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// ─── Bob API Client ────────────────────────────────────────────────────────────
const bobClient = axios.create({
  baseURL: process.env.BOB_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.BOB_API_KEY}`,
    'Content-Type': 'application/json',
    'X-Project-ID': process.env.BOB_PROJECT_ID,
  },
  timeout: 30000, // 30s timeout for AI responses
});

// ─── Session Tracker (in-memory for demo; use DB in production) ────────────────
const sessionLog = [];

/**
 * Logs a Bob session to the in-memory store.
 * This data is used to generate the /bob-report/ export.
 */
const logSession = (type, prompt, response) => {
  const session = {
    id: uuidv4(),
    type,
    prompt,
    response,
    timestamp: new Date().toISOString(),
  };
  sessionLog.push(session);
  logger.info(`Bob session logged [${type}] — ID: ${session.id}`);
  return session;
};

// ─── 1. Summarize Repo Context ─────────────────────────────────────────────────
/**
 * Sends repo file tree + README to Bob and gets a plain-language summary.
 * @param {string} repoName - e.g. "owner/repo"
 * @param {string} fileTree - stringified file tree
 * @param {string} readme   - README content
 */
const summarizeRepo = async (repoName, fileTree, readme) => {
  const prompt = `
    You are a senior software architect. Analyze this GitHub repository and provide:
    1. A 2-sentence plain-language summary of what this repo does.
    2. The main tech stack used.
    3. Three key areas a new contributor should focus on.

    Repository: ${repoName}
    File Tree:
    ${fileTree}

    README:
    ${readme}
  `;

  try {
    logger.debug(`Calling Bob API — summarizeRepo for ${repoName}`);

    const res = await bobClient.post('/generate', {
      prompt,
      max_tokens: 500,
      temperature: 0.3,
    });

    const output = res.data?.output || res.data?.text || 'No summary returned.';
    const session = logSession('repo-summary', prompt, output);

    return { success: true, summary: output, sessionId: session.id };
  } catch (err) {
    logger.error(`Bob summarizeRepo failed: ${err.message}`);
    throw new Error(`Bob API error (summarize): ${err.message}`);
  }
};

// ─── 2. Generate Documentation ─────────────────────────────────────────────────
/**
 * Sends a code file to Bob and receives JSDoc/markdown documentation.
 * @param {string} filename - name of the file
 * @param {string} code     - raw source code content
 */
const generateDocs = async (filename, code) => {
  const prompt = `
    You are a technical writer. Generate complete JSDoc comments and a markdown documentation block for the following code file.
    
    Rules:
    - Add JSDoc above every function/class.
    - Write a markdown summary at the top explaining what this file does.
    - Keep it concise but complete.
    
    Filename: ${filename}
    Code:
    \`\`\`
    ${code}
    \`\`\`
  `;

  try {
    logger.debug(`Calling Bob API — generateDocs for ${filename}`);

    const res = await bobClient.post('/generate', {
      prompt,
      max_tokens: 1000,
      temperature: 0.2,
    });

    const output = res.data?.output || res.data?.text || 'No documentation returned.';
    const session = logSession('doc-generation', prompt, output);

    return { success: true, documentation: output, sessionId: session.id };
  } catch (err) {
    logger.error(`Bob generateDocs failed: ${err.message}`);
    throw new Error(`Bob API error (docs): ${err.message}`);
  }
};

// ─── 3. Scaffold Unit Tests ────────────────────────────────────────────────────
/**
 * Sends a code file to Bob and receives a Jest test scaffold.
 * @param {string} filename - name of the file being tested
 * @param {string} code     - raw source code content
 */
const generateTests = async (filename, code) => {
  const prompt = `
    You are a senior QA engineer. Generate a complete Jest unit test file for the following code.

    Rules:
    - Use describe/it blocks with clear test names.
    - Cover happy paths, edge cases, and error scenarios.
    - Mock external dependencies (axios, fs, etc.) where needed.
    - Add a comment above each test explaining what it verifies.

    Filename: ${filename}
    Code:
    \`\`\`
    ${code}
    \`\`\`
  `;

  try {
    logger.debug(`Calling Bob API — generateTests for ${filename}`);

    const res = await bobClient.post('/generate', {
      prompt,
      max_tokens: 1200,
      temperature: 0.2,
    });

    const output = res.data?.output || res.data?.text || 'No tests returned.';
    const session = logSession('test-scaffold', prompt, output);

    return { success: true, tests: output, sessionId: session.id };
  } catch (err) {
    logger.error(`Bob generateTests failed: ${err.message}`);
    throw new Error(`Bob API error (tests): ${err.message}`);
  }
};

// ─── 4. PR Assistant ───────────────────────────────────────────────────────────
/**
 * Sends a PR diff to Bob and receives a review summary + suggestions.
 * @param {string} prTitle   - title of the pull request
 * @param {string} prBody    - description of the PR
 * @param {string} diff      - raw git diff string
 */
const reviewPR = async (prTitle, prBody, diff) => {
  const prompt = `
    You are an expert code reviewer. Review this pull request and provide:
    1. A one-paragraph summary of what this PR does.
    2. A list of potential issues or bugs (if any).
    3. Three concrete improvement suggestions.
    4. An overall rating: Approve / Request Changes / Needs Discussion.

    PR Title: ${prTitle}
    PR Description: ${prBody}

    Diff:
    \`\`\`diff
    ${diff}
    \`\`\`
  `;

  try {
    logger.debug(`Calling Bob API — reviewPR for "${prTitle}"`);

    const res = await bobClient.post('/generate', {
      prompt,
      max_tokens: 800,
      temperature: 0.3,
    });

    const output = res.data?.output || res.data?.text || 'No review returned.';
    const session = logSession('pr-review', prompt, output);

    return { success: true, review: output, sessionId: session.id };
  } catch (err) {
    logger.error(`Bob reviewPR failed: ${err.message}`);
    throw new Error(`Bob API error (pr-review): ${err.message}`);
  }
};

// ─── Export Session Log (for /bob-report/) ─────────────────────────────────────
const getSessions = () => sessionLog;

module.exports = {
  summarizeRepo,
  generateDocs,
  generateTests,
  reviewPR,
  getSessions,
};