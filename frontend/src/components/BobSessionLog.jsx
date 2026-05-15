// Bob Prompt: "Build a live IBM Bob session log dashboard that shows all AI sessions and lets users export them as a report."
// Bob Output: Session log table with type badges, expandable prompt/response viewer, and an export button.
// Bob Guidance: Poll the /report/live endpoint every 10 seconds to keep the log fresh without requiring a page reload.
// ---- Actual Code Below ----

'use client';

import { useState, useEffect, useCallback } from 'react';
import { reportAPI } from '../lib/api';

// ─── Session Type Config ──────────────────────────────────────────────────────
const SESSION_TYPES = {
  'repo-summary':   { label: 'Repo Summary',   badge: 'badge-blue',   icon: '🔍' },
  'doc-generation': { label: 'Doc Generation', badge: 'badge-purple', icon: '📄' },
  'test-scaffold':  { label: 'Test Scaffold',  badge: 'badge-green',  icon: '🧪' },
  'pr-review':      { label: 'PR Review',      badge: 'badge-orange', icon: '🔀' },
};

export default function BobSessionLog() {
  const [sessions, setSessions]       = useState([]);
  const [expanded, setExpanded]       = useState(null);    // expanded session ID
  const [loading, setLoading]         = useState(false);
  const [exporting, setExporting]     = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [error, setError]             = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  // ─── Fetch Live Sessions ────────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportAPI.liveSessions();
      setSessions(res.sessions || []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount + poll every 10 seconds
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // ─── Export Report ──────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      const res = await reportAPI.exportReport();
      setExportResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  // ─── Toggle Session Expand ──────────────────────────────────────────────────
  const toggleExpand = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  // ─── Truncate long text ─────────────────────────────────────────────────────
  const truncate = (str, n = 120) =>
    str && str.length > n ? str.slice(0, n) + '...' : str;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ─── Header Card ──────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="card-title">⚡ IBM Bob Session Log</span>
            <span className="badge badge-blue">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </span>
            {loading && <div className="spinner" />}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Refresh button */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={fetchSessions}
              disabled={loading}
            >
              🔄 Refresh
            </button>

            {/* Export button */}
            <button
              className="btn btn-primary btn-sm"
              onClick={handleExport}
              disabled={exporting || sessions.length === 0}
            >
              {exporting ? (
                <><div className="spinner" style={{ width: '12px', height: '12px' }} /> Exporting...</>
              ) : '📦 Export Bob Report'}
            </button>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          All IBM Bob AI sessions are logged here in real time. Export them as a JSON
          report for your hackathon submission. Auto-refreshes every 10 seconds.
        </p>

        {lastRefresh && (
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '8px' }}>
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* ─── Export Success Banner ─────────────────────────────────────────── */}
      {exportResult && (
        <div className="alert alert-success animate-fade-in">
          <span>✅</span>
          <div>
            <strong>Report exported successfully!</strong>
            <p style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
              File: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                {exportResult.filename}
              </code>
              {' · '}{exportResult.totalSessions} sessions exported
              {' · '}{exportResult.exportedAt && new Date(exportResult.exportedAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* ─── Session Type Summary Row ──────────────────────────────────────── */}
      {sessions.length > 0 && (
        <div className="grid grid-4 gap-4">
          {Object.entries(SESSION_TYPES).map(([type, config]) => {
            const count = sessions.filter((s) => s.type === type).length;
            return (
              <div
                key={type}
                className="stat-card"
                style={{ textAlign: 'center', padding: '16px' }}
              >
                <div style={{ fontSize: '28px' }}>{config.icon}</div>
                <div className="stat-value" style={{ fontSize: '22px' }}>{count}</div>
                <div className="stat-label" style={{ fontSize: '11px' }}>{config.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Session List ──────────────────────────────────────────────────── */}
      {sessions.length === 0 && !loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
            No Bob sessions yet.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Use the Summarize, Docs, Tests, or PR Review features to create sessions.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.map((session, index) => {
            const typeConfig = SESSION_TYPES[session.type] || {
              label: session.type,
              badge: 'badge-blue',
              icon: '⚡',
            };
            const isExpanded = expanded === session.id;

            return (
              <div
                key={session.id}
                className="card animate-fade-in"
                style={{
                  padding: '0',
                  overflow: 'hidden',
                  animationDelay: `${index * 0.05}s`,
                  cursor: 'pointer',
                }}
                onClick={() => toggleExpand(session.id)}
              >
                {/* ─── Session Header Row ──────────────────────────────────── */}
                <div style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    {/* Type icon */}
                    <span style={{ fontSize: '18px' }}>{typeConfig.icon}</span>

                    {/* Type badge */}
                    <span className={`badge ${typeConfig.badge}`}>
                      {typeConfig.label}
                    </span>

                    {/* Session ID (truncated) */}
                    <span style={{
                      color: 'var(--text-muted)',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {session.id.slice(0, 8)}...
                    </span>

                    {/* Prompt preview */}
                    <span style={{
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '300px',
                    }}>
                      {truncate(session.prompt?.trim().replace(/\s+/g, ' '), 80)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Timestamp */}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(session.timestamp).toLocaleTimeString()}
                    </span>

                    {/* Expand arrow */}
                    <span style={{
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      transition: 'transform 0.2s ease',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* ─── Expanded Detail Panel ───────────────────────────────── */}
                {isExpanded && (
                  <div
                    className="animate-fade-in"
                    style={{
                      borderTop: '1px solid var(--border-muted)',
                      padding: '16px',
                      background: 'var(--bg-overlay)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Full session ID */}
                    <div style={{
                      marginBottom: '12px',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      Session ID: {session.id}
                      {' · '}
                      {new Date(session.timestamp).toLocaleString()}
                    </div>

                    {/* Prompt */}
                    <div style={{ marginBottom: '16px' }}>
                      <div className="input-label" style={{ marginBottom: '8px' }}>
                        📤 Bob Prompt
                      </div>
                      <div className="code-block" style={{
                        maxHeight: '160px',
                        overflow: 'auto',
                        fontSize: '12px',
                      }}>
                        {session.prompt}
                      </div>
                    </div>

                    {/* Response */}
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}>
                        <span className="input-label">📥 Bob Response</span>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigator.clipboard.writeText(session.response)}
                        >
                          Copy
                        </button>
                      </div>
                      <div className="code-block" style={{
                        maxHeight: '200px',
                        overflow: 'auto',
                        fontSize: '12px',
                        fontFamily: 'var(--font-sans)',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {session.response}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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