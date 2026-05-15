// Bob Prompt: "Build a GitHub repo search input component that fetches repo metadata and file tree on submit."
// Bob Output: Input form with owner/repo fields, loading state, and error handling.
// Bob Guidance: Parse "owner/repo" format from a single input for better UX — split on "/" to extract both values automatically.
// ---- Actual Code Below ----

'use client';

import { useState } from 'react';
import { githubAPI, bobAPI } from '../lib/api';

export default function RepoInput({ onRepoLoaded, loading, setLoading }) {
  const [input, setInput]   = useState('');   // "owner/repo" string
  const [branch, setBranch] = useState('main');
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ─── Validate Input ──────────────────────────────────────────────────────
    const trimmed = input.trim();
    if (!trimmed.includes('/')) {
      setError('Please enter a valid repo in the format: owner/repo');
      return;
    }

    const [owner, repo] = trimmed.split('/');
    if (!owner || !repo) {
      setError('Both owner and repo name are required.');
      return;
    }

    setLoading(true);

    try {
      // ─── Fetch GitHub Data in Parallel ──────────────────────────────────────
      const [metaRes, treeRes, readmeRes, healthRes] = await Promise.all([
        githubAPI.getMetadata(owner, repo),
        githubAPI.getFileTree(owner, repo, branch),
        githubAPI.getReadme(owner, repo),
        githubAPI.getRepoHealth(owner, repo),
      ]);

      // ─── Send to Bob for Summarization ──────────────────────────────────────
      const summaryRes = await bobAPI.summarize(
        `${owner}/${repo}`,
        treeRes.treeString,
        readmeRes.readme
      );

      // ─── Pass full data up to page ───────────────────────────────────────────
      onRepoLoaded(
        {
          metadata: metaRes.metadata,
          health:   healthRes.health,
          files:    treeRes.files,
          readme:   readmeRes.readme,
          summary:  summaryRes.summary,
          sessionId: summaryRes.sessionId,
        },
        owner,
        repo
      );
    } catch (err) {
      setError(err.message || 'Failed to load repository. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '8px',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-blue)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(88,166,255,0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* GitHub icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '8px',
            color: 'var(--text-muted)',
          }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </div>

          {/* Repo input */}
          <input
            className="input"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              padding: '6px 4px',
              fontSize: '15px',
              fontFamily: 'var(--font-mono)',
            }}
            type="text"
            placeholder="owner/repository  (e.g. facebook/react)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />

          {/* Branch input */}
          <input
            className="input"
            style={{
              width: '90px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-muted)',
              padding: '6px 10px',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              borderRadius: 'var(--radius-md)',
            }}
            type="text"
            placeholder="branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            disabled={loading}
          />

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !input.trim()}
            style={{ whiteSpace: 'nowrap', minWidth: '120px' }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '14px', height: '14px' }} />
                Analyzing...
              </>
            ) : (
              <>⚡ Analyze with Bob</>
            )}
          </button>
        </div>
      </form>

      {/* Error message */}
      {error && (
        <div
          className="alert alert-error animate-fade-in"
          style={{ marginTop: '12px', textAlign: 'left' }}
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Helper text */}
      <p style={{
        marginTop: '10px',
        fontSize: '12px',
        color: 'var(--text-muted)',
        textAlign: 'center',
      }}>
        Works with any public GitHub repository. IBM Bob will analyze it instantly.
      </p>
    </div>
  );
}