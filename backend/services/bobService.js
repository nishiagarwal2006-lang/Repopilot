// Bob Prompt: "Create a service layer to interact with AI API for repo summarization, doc generation, and test scaffolding."
// Bob Output: Axios-based service with dedicated methods for each capability.
// Bob Guidance: Isolate all AI API calls in a service layer so routes stay clean.
// ---- Actual Code Below ----

require('dotenv').config();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// ─── Session Tracker ───────────────────────────────────────────────────────────
const sessionLog = [];

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

// ─── AI API Call ───────────────────────────────────────────────────────────────
const callAI = async (prompt, maxTokens = 500) => {
  const res = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.BOB_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data.choices[0].message.content;
};

// ─── 1. Summarize Repo ─────────────────────────────────────────────────────────
const summarizeRepo = async (repoName, fileTree, readme) => {
  const prompt = `
    You are a senior software architect. Analyze this GitHub repository and provide:
    1. A 2-sentence plain-language summary of what this repo does.
    2. The main tech stack used.
    3. Three key areas a new contributor should focus on.

    Repository: ${repoName}
    File Tree (sample):
    ${fileTree.slice(0, 500)}

    README (summary):
    ${readme.slice(0, 1000)}
  `;

  try {
    logger.debug(`Calling AI — summarizeRepo for ${repoName}`);
    const output = await callAI(prompt, 500);
    const session = logSession('repo-summary', prompt, output);
    return { success: true, summary: output, sessionId: session.id };
  } catch (err) {
    logger.error(`Bob summarizeRepo failed: ${err.message}`);
    logger.error(`Groq error: ${JSON.stringify(err.response?.data)}`);
    throw new Error(`Bob API error (summarize): ${err.message}`);
  }
};

// ─── 2. Generate Docs ──────────────────────────────────────────────────────────
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
    logger.debug(`Calling AI — generateDocs for ${filename}`);
    const output = await callAI(prompt, 1000);
    const session = logSession('doc-generation', prompt, output);
    return { success: true, documentation: output, sessionId: session.id };
  } catch (err) {
    logger.error(`Bob generateDocs failed: ${err.message}`);
    throw new Error(`Bob API error (docs): ${err.message}`);
  }
};

// ─── 3. Generate Tests ─────────────────────────────────────────────────────────
const generateTests = async (filename, code) => {
  const prompt = `
    You are a senior QA engineer. Generate a complete Jest unit test file for the following code.

    Rules:
    - Use describe/it blocks with clear test names.
    - Cover happy paths, edge cases, and error scenarios.
    - Mock external dependencies where needed.
    - Add a comment above each test explaining what it verifies.

    Filename: ${filename}
    Code:
    \`\`\`
    ${code}
    \`\`\`
  `;

  try {
    logger.debug(`Calling AI — generateTests for ${filename}`);
    const output = await callAI(prompt, 1200);
    const session = logSession('test-scaffold', prompt, output);
    return { success: true, tests: output, sessionId: session.id };
  } catch (err) {
    logger.error(`Bob generateTests failed: ${err.message}`);
    throw new Error(`Bob API error (tests): ${err.message}`);
  }
};

// ─── 4. PR Review ──────────────────────────────────────────────────────────────
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
    ${diff.slice(0, 3000)}
    \`\`\`
  `;

  try {
    logger.debug(`Calling AI — reviewPR for "${prTitle}"`);
    const output = await callAI(prompt, 800);
    const session = logSession('pr-review', prompt, output);
    return { success: true, review: output, sessionId: session.id };
  } catch (err) {
    logger.error(`Bob reviewPR failed: ${err.message}`);
    throw new Error(`Bob API error (pr-review): ${err.message}`);
  }
};

// ─── Export Sessions ───────────────────────────────────────────────────────────
const getSessions = () => sessionLog;

module.exports = {
  summarizeRepo,
  generateDocs,
  generateTests,
  reviewPR,
  getSessions,
};

// Made with Bob
