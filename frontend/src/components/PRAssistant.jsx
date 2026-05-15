// Bob Prompt: "Build a PR Review Assistant component that fetches open PRs from GitHub and sends diffs to IBM Bob for AI review."
// Bob Output: Two-panel component — left shows open PR list, right shows Bob's AI review output.
// Bob Guidance: Fetch the PR list first, let the user pick one, then lazily fetch the diff only when they click Review — avoids unnecessary API calls.
// ---- Actual Code Below ----

'use client';

import { useState } from 'react';
import { githubAPI, bobAPI } from '../lib/api';

export default function PRAssistant({ owner, repo }) {
  const [prs, setPrs]             = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);
  const [review, setReview]       = useState('');
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [error, setError]         = useState('');
  const [fetched, setFetched]     = useState(false);

  // ─── Fetch Open PRs ─────────────────────────────────────────────────────────
  const fetchPRs = async () => {
    setLoadingPRs(true);
    setError('');
    try {
      const res = await githubAPI.getPullRequests(owner, repo);
      setPrs(res.pullRequests);
      setFetched(true);
      if (res.pullRequests.length === 0) {
        setError('No open pull requests found for this repository.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPRs(false);
    }
  };

  // ─── Review Selected PR with Bob ────────────────────────────────────────────
  const handleReview = async (pr) => {
    setSelectedPR(pr);
    setReview('');
    setLoadingReview(true);
    setError('');

    try {
      // Step 1 — get the raw diff
      const diffRes = await githubAPI.getPRDiff(owner, repo, pr.number);

      // Step 2 — send to Bob for review
      const reviewRes = await bobAPI.reviewPR(pr.title, pr.body, diffRes.diff);
      setReview(reviewRes.review);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingReview(false);
    }
  };

  // ─── Rating Badge Color ──────────────────────────────────────────────────────
  const getRatingBadge = (text) => {
    if (!text) return null;
    if (text.toLowerCase().includes('approve')) return { label: '✅ Approve', cls: 'badge-green' };
    if (text.toLowerCase().includes('request changes')) return { label: '🔄 Request Changes', cls: 'badge-orange' };
    if (text.toLowerCase().includes('needs discussion')) return { label: '💬 Needs Discussion', cls: 'badge-blue' };
    return null;
  };

  const rating = getRatingBadge(review);

  return (
    <div id="pr" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ─── Header Card ───────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🔀 PR Review Assistant — IBM Bob</span>
          <span className="badge badge-purple">AI Powered</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          Select an open pull request and IBM Bob will analyze the diff, identify issues,
          and provide actionable improvement suggestions.
        </p>
        {!fetched && (
          <button
            className="btn btn-primary"
            onClick={fetchPRs}
            disabled={loadingPRs}
          >
            {loadingPRs ? (
              <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Loading PRs...</>
            ) : '🔀 Load Open Pull Requests'}
          </button>
        )}
      </div>

      {/* ─── PR List ───────────────────────────────────────────────────────── */}
      {fetched && prs.length > 0 && (
        <div className="card animate-fade-in">
          <div className="card-header">
            <span className="card-title">Open Pull Requests</span>
            <span className="badge badge-blue">{prs.length} open</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {prs.map((pr) => (
              <div
                key={pr.number}
                style={{
                  padding: '14px 16px',
                  background: selectedPR?.number === pr.number
                    ? 'rgba(88,166,255,0.08)'
                    : 'var(--bg-secondary)',
                  border: `1px solid ${selectedPR?.number === pr.number
                    ? 'var(--accent-blue)'
                    : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
                onMouseEnter={(e) => {
                  if (selectedPR?.number !== pr.number) {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPR?.number !== pr.number) {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                  }
                }}
              >
                {/* PR info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px',
                    flexWrap: 'wrap',
                  }}>
                    <span style={{
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      #{pr.number}
                    </span>
                    <span style={{
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {pr.title}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    flexWrap: 'wrap',
                  }}>
                    <span>👤 {pr.author}</span>
                    <span>📅 {new Date(pr.createdAt).toLocaleDateString()}</span>
                    {pr.changedFiles && (
                      <span>📝 {pr.changedFiles} files changed</span>
                    )}
                    {pr.additions != null && (
                      <span style={{ color: 'var(--accent-green)' }}>+{pr.additions}</span>
                    )}
                    {pr.deletions != null && (
                      <span style={{ color: 'var(--accent-red)' }}>-{pr.deletions}</span>
                    )}
                  </div>
                </div>

                {/* Review button */}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleReview(pr)}
                  disabled={loadingReview}
                  style={{ flexShrink: 0 }}
                >
                  {loadingReview && selectedPR?.number === pr.number ? (
                    <><div className="spinner" style={{ width: '12px', height: '12px' }} /> Reviewing...</>
                  ) : '⚡ Review'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Bob Review Output ─────────────────────────────────────────────── */}
      {review && selectedPR && (
        <div className="card animate-fade-in">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="card-title">⚡ Bob's Review</span>
              <span style={{
                color: 'var(--text-muted)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
              }}>
                PR #{selectedPR.number}
              </span>
              {rating && <span className={`badge ${rating.cls}`}>{rating.label}</span>}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigator.clipboard.writeText(review)}
            >
              Copy Review
            </button>
          </div>

          {/* PR title bar */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>{selectedPR.title}</strong>
            {selectedPR.body && (
              <p style={{
                marginTop: '6px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--border-muted)',
                paddingTop: '6px',
              }}>
                {selectedPR.body.slice(0, 200)}
                {selectedPR.body.length > 200 && '...'}
              </p>
            )}
          </div>

          {/* Review text */}
          <div className="code-block" style={{
            background: 'var(--bg-overlay)',
            lineHeight: 1.8,
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            whiteSpace: 'pre-wrap',
          }}>
            {review}
          </div>

          {/* View on GitHub link */}
          <div style={{ marginTop: '16px' }}>
            <a
              href={selectedPR.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              View PR on GitHub →
            </a>
          </div>
        </div>
      )}

      {/* Loading review skeleton */}
      {loadingReview && (
        <div className="card animate-fade-in">
          <div className="card-header">
            <span className="card-title">⚡ Bob is reviewing the diff...</span>
            <div className="spinner" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[80, 60, 90, 50, 70].map((w, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: '14px', width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error animate-fade-in">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}
    </div>
  );
}