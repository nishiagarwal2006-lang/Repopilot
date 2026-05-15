// Bob Prompt: "Create the main Next.js page that ties together all RepoPilot components into a cohesive dashboard."
// Bob Output: Single-page app with hero section, repo input, and tabbed dashboard panels.
// Bob Guidance: Keep all shared state (repoData, owner, repo) at the page level and pass down as props so components stay clean and reusable.
// ---- Actual Code Below ----

'use client';

import { useState } from 'react';
import RepoInput from '../components/RepoInput';
import Dashboard from '../components/Dashboard';

export default function Home() {
  // ─── Shared State ────────────────────────────────────────────────────────────
  const [repoData, setRepoData] = useState(null);   // Full repo metadata + health
  const [owner, setOwner]       = useState('');      // GitHub owner/username
  const [repo, setRepo]         = useState('');      // Repo name
  const [loading, setLoading]   = useState(false);   // Global loading state

  // Called by RepoInput when a repo is successfully fetched
  const handleRepoLoaded = (data, ownerName, repoName) => {
    setRepoData(data);
    setOwner(ownerName);
    setRepo(repoName);
  };

  return (
    <div style={{ background: 'var(--bg-canvas)', minHeight: '100vh' }}>

      {/* ─── Hero Section ───────────────────────────────────────────────────── */}
      <section
        style={{
          padding: '60px 24px 40px',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-muted)',
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(88,166,255,0.08) 0%, transparent 70%),
            var(--bg-canvas)
          `,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--border-muted) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-muted) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.3,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* IBM Bob badge */}
          <div style={{ marginBottom: '16px' }}>
            <span className="badge badge-blue" style={{ fontSize: '12px', padding: '4px 12px' }}>
              ⚡ Powered by IBM Bob AI
            </span>
          </div>

          {/* Hero title */}
          <h1
            className="gradient-text"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '16px', fontWeight: 700 }}
          >
            RepoPilot
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)',
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            margin: '0 auto 32px',
            lineHeight: 1.7,
          }}>
            Your GitHub-native AI workflow assistant. Summarize repos, generate
            docs &amp; tests, and review PRs — all powered by IBM Bob.
          </p>

          {/* Feature pills */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '40px',
          }}>
            {[
              { icon: '🔍', label: 'Repo Summarization' },
              { icon: '📄', label: 'Auto Documentation' },
              { icon: '🧪', label: 'Test Scaffolding' },
              { icon: '🔀', label: 'PR Review Assistant' },
              { icon: '📊', label: 'Repo Health Analytics' },
              { icon: '📦', label: 'Bob Session Export' },
            ].map((f) => (
              <span
                key={f.label}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {f.icon} {f.label}
              </span>
            ))}
          </div>

          {/* Repo Input */}
          <RepoInput
            onRepoLoaded={handleRepoLoaded}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      </section>

      {/* ─── Dashboard (shown after repo is loaded) ──────────────────────────── */}
      {repoData && (
        <section className="animate-fade-in">
          <Dashboard
            repoData={repoData}
            owner={owner}
            repo={repo}
          />
        </section>
      )}

      {/* ─── Empty State (before repo is loaded) ────────────────────────────── */}
      {!repoData && !loading && (
        <section style={{
          padding: '80px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚀</div>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
            Enter a GitHub repository above to get started.
          </p>
          <p style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-muted)' }}>
            Example: <code style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>facebook/react</code> or <code style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>vercel/next.js</code>
          </p>
        </section>
      )}
    </div>
  );
}