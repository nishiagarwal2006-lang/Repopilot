# RepoPilot 🚀

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![IBM Bob](https://img.shields.io/badge/IBM-Bob%20AI-054ADA.svg)
![CI](https://github.com/your-username/repopilot/actions/workflows/ci.yml/badge.svg)
![Hackathon](https://img.shields.io/badge/IBM%20Bob-Hackathon%202024-purple.svg)

> **RepoPilot** is a GitHub-native AI developer workflow assistant powered by
> IBM Bob. Drop in any public GitHub repo and instantly get an AI-generated
> summary, auto-documentation, unit test scaffolds, and intelligent PR reviews
> — all from a sleek GitHub dark-theme dashboard.

---

## 🎬 Live Demo

| Resource | Link |
|---|---|
| 🌐 Hosted Demo | `https://repopilot.vercel.app` |
| 📦 Backend API | `https://repopilot-api.onrender.com` |
| 📊 Bob Report | `/bob-report/sessions/session-example.json` |
| 🎥 Video Demo | `docs/demo-video-link.md` |

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 Repo Summarization | IBM Bob analyzes any GitHub repo's file tree + README |
| 📄 Auto Documentation | Paste code → Bob generates full JSDoc + markdown docs |
| 🧪 Test Scaffolding | Paste code → Bob writes a complete Jest test file |
| 🔀 PR Review Assistant | Bob reads PR diffs and gives structured code reviews |
| 📊 Repo Health Analytics | Visual charts for commits, issues, contributors |
| ⚡ Bob Session Log | Real-time log of all IBM Bob AI sessions |
| 📦 Report Export | One-click export of all Bob sessions to JSON |

---

## 🛠️ Tech Stack

```Frontend:   Next.js 14 · React 18 · Recharts · Lucide Icons
Backend:    Node.js · Express · Helmet · Morgan · Winston
AI:         IBM Bob API
Data:       GitHub REST API v3
Testing:    Jest · Supertest
Deployment: Vercel (frontend) · Render (backend)
CI/CD:      GitHub Actions
License:    MIT

---

## 📁 Project Structure
repopilot/
├── backend/
│   ├── routes/          # Express route handlers
│   ├── services/        # IBM Bob + GitHub + Report services
│   ├── middleware/       # Auth middleware
│   ├── utils/           # Winston logger
│   └── index.js         # Express server entry
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js app router
│   │   ├── components/  # React components
│   │   └── lib/         # API client
│   └── public/          # Static assets
├── bob-report/
│   └── sessions/        # Exported IBM Bob reports
├── tests/               # Jest test suites
├── docs/                # Slides + presentation materials
└── .github/workflows/   # CI/CD pipeline

---

## ⚡ IBM Bob Integration

RepoPilot uses IBM Bob as its core AI engine for four key workflows:

### 1. Repo Context SummarizationUser enters "facebook/react"
→ RepoPilot fetches file tree + README from GitHub API
→ Sends both to IBM Bob with a structured prompt
→ Bob returns: plain-language summary, tech stack, key areas
→ Displayed on the Overview dashboard tab

### 2. Auto Documentation GenerationUser pastes a code file
→ RepoPilot sends filename + code to IBM Bob
→ Bob returns: JSDoc comments + markdown documentation block
→ User copies the output directly into their codebase

### 3. Unit Test ScaffoldingUser pastes a code file
→ RepoPilot sends filename + code to IBM Bob
→ Bob returns: complete Jest describe/it blocks
→ Covers happy paths, edge cases, and error scenarios

### 4. PR Review AssistantUser selects an open PR
→ RepoPilot fetches the raw diff from GitHub API
→ Sends PR title + body + diff to IBM Bob
→ Bob returns: summary, issues found, suggestions, overall rating
→ Rating badge: Approve / Request Changes / Needs Discussion

### Bob Session Logging
Every IBM Bob call is logged with:
- Unique session ID
- Session type (repo-summary / doc-generation / test-scaffold / pr-review)
- Full prompt sent to Bob
- Full response received from Bob
- Timestamp

All sessions are viewable in the **⚡ Bob Sessions** dashboard tab and
exportable to `/bob-report/sessions/` as a timestamped JSON file.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- IBM Bob API key
- GitHub Personal Access Token

### 1. Clone the Repository

```bashgit clone https://github.com/your-username/repopilot.git
cd repopilot

### 2. Backend Setup

```bashcd backend
npm installCopy and fill in environment variables
cp .env.example .env

Edit `backend/.env`:

```envPORT=5000
NODE_ENV=development
BOB_API_URL=https://api.ibm.com/bob/v1
BOB_API_KEY=your_ibm_bob_api_key_here
BOB_PROJECT_ID=your_bob_project_id_here
GITHUB_TOKEN=your_github_personal_access_token_here
API_SECRET=any_random_secret_string_here
REPORT_OUTPUT_DIR=../bob-report/sessions

Start the backend:

```bashnpm run dev
Backend running on http://localhost:5000

Verify it's working:

```bashcurl http://localhost:5000/health
{"success":true,"status":"RepoPilot backend is running 🚀"}

### 3. Frontend Setup

```bashcd ../frontend
npm installCopy and fill in environment variables
cp .env.local.example .env.local

Edit `frontend/.env.local`:

```envNEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_SECRET=same_secret_as_backend_API_SECRET

Start the frontend:

```bashnpm run dev
Frontend running on http://localhost:3000

### 4. Run Tests

```bashBackend tests
cd backend
npm testWith coverage
npm test -- --coverage

---

## 🌐 Deployment Guide

### Frontend → Vercel

```bashInstall Vercel CLI
npm i -g vercelcd frontend
vercelSet environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL   = https://repopilot-api.onrender.com
NEXT_PUBLIC_API_SECRET = your_api_secret

Or connect your GitHub repo to Vercel for automatic deployments on push.

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set these fields:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables in Render dashboard:PORT              = 10000
NODE_ENV          = production
BOB_API_URL       = https://api.ibm.com/bob/v1
BOB_API_KEY       = your_ibm_bob_api_key
BOB_PROJECT_ID    = your_bob_project_id
GITHUB_TOKEN      = your_github_token
API_SECRET        = your_api_secret
REPORT_OUTPUT_DIR = ./bob-report/sessions

5. Update `backend/index.js` CORS origin with your Vercel URL.
6. Deploy — Render gives you a URL like `https://repopilot-api.onrender.com`

### Update Frontend for Production

In `frontend/.env.local` (or Vercel dashboard):

```envNEXT_PUBLIC_API_URL=https://repopilot-api.onrender.com

---

## 📦 Exporting the Bob Report

### From the Dashboard
1. Go to the **⚡ Bob Sessions** tab
2. Click **📦 Export Bob Report**
3. File is saved to `bob-report/sessions/`

### Via API
```bashcurl -X POST https://repopilot-api.onrender.com/api/report/export 
-H "Authorization: Bearer your_api_secret"

### View All Reports
```bashcurl https://repopilot-api.onrender.com/api/report/list 
-H "Authorization: Bearer your_api_secret"

---

## 🧪 API Reference

### Health CheckGET /health
→ { success: true, status: "RepoPilot backend is running 🚀" }

### IBM Bob EndpointsPOST /api/bob/summarize        { repoName, fileTree, readme }
POST /api/bob/generate-docs    { filename, code }
POST /api/bob/generate-tests   { filename, code }
POST /api/bob/review-pr        { prTitle, prBody, diff }

### GitHub EndpointsGET /api/github/:owner/:repo/metadata
GET /api/github/:owner/:repo/tree?branch=main
GET /api/github/:owner/:repo/readme
GET /api/github/:owner/:repo/file?path=src/index.js
GET /api/github/:owner/:repo/pulls
GET /api/github/:owner/:repo/pulls/:prNumber/diff
GET /api/github/:owner/:repo/health

### Report EndpointsPOST /api/report/export
GET  /api/report/list
GET  /api/report/live

All `/api/*` routes require:Authorization: Bearer <API_SECRET>

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🏆 IBM Bob Hackathon Submission

- ✅ IBM Bob API used for all core AI features
- ✅ Bob sessions logged and exportable
- ✅ MIT License
- ✅ Public GitHub repository
- ✅ Hosted demo on Vercel + Render
- ✅ Presentation slides in `/docs/`
- ✅ CI/CD via GitHub Actions
- ✅ Bob report in `/bob-report/sessions/`

---

<p align="center">
  Built with ❤️ for the IBM Bob Hackathon · RepoPilot Team
</p>File 35 — docs/slides-outline.mdmd# RepoPilot — IBM Bob Hackathon Presentation Slides

## Slide Outline & Speaker Notes

---

### Slide 1 — Cover

**Title:** RepoPilot 🚀
**Subtitle:** GitHub-Native AI Developer Workflow Assistant
**Tagline:** Powered by IBM Bob · Built for Developers · Made for Speed

**Visuals:**
- RepoPilot logo (logo.svg)
- GitHub dark background
- Animated gradient text on title

**Speaker Note:**
> "RepoPilot turns any GitHub repo into an AI-powered workspace.
> In under 30 seconds, IBM Bob can summarize a codebase, write docs,
> scaffold tests, and review pull requests — right from your browser."

---

### Slide 2 — The Problem

**Title:** Developer Workflows Are Broken

**Points:**
- 🕐 Developers spend 30–40% of time on repetitive tasks
- 📄 Documentation is always out of date
- 🧪 Test coverage is an afterthought
- 🔀 PR reviews are slow and inconsistent
- 🤯 Onboarding to a new repo takes days

**Visuals:**
- Split screen: messy repo vs clean RepoPilot dashboard
- Statistics as large numbers with accent colors

**Speaker Note:**
> "Every developer knows this pain. You clone a new repo and spend
> the first day just figuring out what it does. RepoPilot eliminates that."

---

### Slide 3 — The Solution

**Title:** RepoPilot + IBM Bob = Developer Superpowers

**Four feature tiles:**

| Icon | Feature | What Bob Does |
|------|---------|---------------|
| 🔍 | Repo Summarizer | Reads file tree + README → plain-language summary |
| 📄 | Auto Docs | Reads your code → JSDoc + markdown in seconds |
| 🧪 | Test Scaffold | Reads your code → complete Jest test file |
| 🔀 | PR Reviewer | Reads your diff → summary, issues, suggestions, rating |

**Speaker Note:**
> "IBM Bob is the brain. RepoPilot is the interface. Together they
> automate the four most time-consuming parts of a developer's day."

---

### Slide 4 — Live Demo

**Title:** See It In Action

**Demo Script (3 minutes):**

1. Open RepoPilot at `https://repopilot.vercel.app`
2. Type `vercel/next.js` → click **⚡ Analyze with Bob**
3. Show the **Overview tab** — Bob's summary, file tree, repo stats
4. Switch to **Docs tab** → paste a code snippet → generate docs
5. Switch to **Tests tab** → same snippet → generate tests
6. Switch to **PR Review tab** → load open PRs → click Review on one
7. Switch to **⚡ Bob Sessions tab** → show all logged sessions
8. Click **📦 Export Bob Report** → show the JSON export

**Visuals:**
- Screen recording of the above flow (embed as GIF or video)

**Speaker Note:**
> "Everything you just saw used IBM Bob under the hood.
> Every call is logged — you can see the exact prompts and responses
> in the Bob Sessions tab."

---

### Slide 5 — Architecture

**Title:** How RepoPilot Works

```Browser (Next.js)
│
▼
Next.js API Proxy  ──── Vercel
│
▼
Express Backend  ──────── Render
│        │
▼        ▼
IBM Bob    GitHub
API       API
│
▼
Bob Session
Logger
│
▼
/bob-report/
sessions/

**Key Points:**
- Frontend proxies all API calls — backend URL never exposed to browser
- Auth middleware on every `/api/*` route
- Rate limiting: 100 req / 15 min
- Winston logger with file + console transports
- Bob sessions stored in-memory + exportable to JSON

**Speaker Note:**
> "The architecture is production-ready. Security headers via Helmet,
> rate limiting, CORS configured for the specific Vercel domain,
> and a complete Winston logging setup."

---

### Slide 6 — IBM Bob Usage

**Title:** IBM Bob — The Core Intelligence

**Four Bob prompts shown aSonnet 4.6