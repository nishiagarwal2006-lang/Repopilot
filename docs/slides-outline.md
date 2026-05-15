# RepoPilot — IBM Bob Hackathon Presentation Slides

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

```
Browser (Next.js)
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
```

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

**Four Bob prompts shown as code blocks:**

**Prompt 1 — Repo Summary:**
```
"You are a senior software architect. Analyze this GitHub repository
and provide: 1. A 2-sentence summary. 2. The main tech stack.
3. Three key areas a new contributor should focus on."
```

**Prompt 2 — Documentation:**
```
"You are a technical writer. Generate complete JSDoc comments
and a markdown documentation block for the following code file."
```

**Prompt 3 — Test Scaffold:**
```
"You are a senior QA engineer. Generate a complete Jest unit test
file. Cover happy paths, edge cases, and error scenarios."
```

**Prompt 4 — PR Review:**
```
"You are an expert code reviewer. Review this pull request and
provide: summary, issues, suggestions, and an overall rating:
Approve / Request Changes / Needs Discussion."
```

**Speaker Note:**
> "We put a lot of thought into the prompts. Each one gives Bob
> a specific persona and structured output format, which makes
> the responses consistently actionable."

---

### Slide 7 — Bob Session Report

**Title:** Full Transparency — Every Bob Session Is Logged

**Show sample JSON from `session-example.json`:**
```json
{
  "reportId": "a1b2c3d4-...",
  "projectName": "RepoPilot",
  "totalSessions": 4,
  "sessionTypes": {
    "repo-summary": 1,
    "doc-generation": 1,
    "test-scaffold": 1,
    "pr-review": 1
  }
}
```

**Key Points:**
- Every Bob call is captured with full prompt + response
- Exportable in one click from the dashboard
- Stored in `/bob-report/sessions/` as timestamped JSON
- Used for hackathon compliance and auditability

---

### Slide 8 — Tech Stack Deep Dive

**Title:** Built With Modern, Production-Grade Tools

**Backend:**
- Node.js + Express — REST API
- Helmet + CORS + Rate Limiting — Security
- Winston — Structured logging
- Axios — IBM Bob + GitHub API calls
- Jest + Supertest — Testing

**Frontend:**
- Next.js 14 (App Router) — SSR + routing
- React 18 — UI components
- Recharts — Health analytics charts
- CSS Custom Properties — GitHub dark theme

**DevOps:**
- GitHub Actions — CI on every push/PR
- Vercel — Frontend hosting (auto-deploy)
- Render — Backend hosting

---

### Slide 9 — Results & Impact

**Title:** What RepoPilot Delivers

**Metrics (estimated time savings):**

| Task | Manual Time | With RepoPilot + Bob |
|------|------------|---------------------|
| Understand a new repo | 2–4 hours | < 30 seconds |
| Write JSDoc for a file | 20–30 min | < 15 seconds |
| Scaffold unit tests | 30–45 min | < 15 seconds |
| Review a PR diff | 15–30 min | < 30 seconds |

**Total estimated time saved per developer per week: 3–6 hours**

---

### Slide 10 — Roadmap

**Title:** What's Next for RepoPilot

**Phase 2 Features:**
- 🔌 GitHub App integration — install directly into repos
- 💬 Bob chat widget — ask questions about any repo in natural language
- 🔄 Auto PR description generator — Bob writes the PR body
- 📊 Multi-repo dashboard — track health across all your repos
- 🤖 GitHub Actions Bot — run RepoPilot checks in CI automatically
- 💾 Persistent session database — PostgreSQL instead of in-memory

---

### Slide 11 — Team & Closing

**Title:** Built for the IBM Bob Hackathon

**Points:**
- 🏆 Submission: IBM Bob Hackathon 2024
- 📂 Repo: `github.com/your-username/repopilot`
- 🌐 Demo: `repopilot.vercel.app`
- 📄 License: MIT — open source and free to use
- 📦 Bob Report: `/bob-report/sessions/`

**Closing line:**
> "RepoPilot makes IBM Bob a permanent member of every development team.
> Thank you."

---

## Presentation Tips

- Keep each slide to max 30 seconds of speaking time
- Lead with the live demo — show before you explain
- Emphasize the Bob Session Log — it proves IBM Bob usage
- Export a Bob report live during the demo for maximum impact
- Have a backup screen recording in case of live demo issues