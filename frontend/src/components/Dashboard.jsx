// Bob Prompt: "Build a tabbed dashboard that shows repo summary, Bob tools, session logs, and health analytics."
// Bob Output: Tab-based layout with animated tab switching and a stat row at the top.
// Bob Guidance: Use a single activeTab state to control which panel renders — this keeps the component simple while supporting many panels.
// ---- Actual Code Below ----

'use client';

import { useState } from 'react';
import BobSessionLog from './BobSessionLog';
import PRAssistant from './PRAssistant';
import RepoHealthChart from './RepoHealthChart';
import { bobAPI } from '../lib/api';

const TABS = [
  { id: 'overview',  label: '🔍 Overview',    },
  { id: 'docs',      label: '📄 Docs',         },
  { id: 'tests',     label: '🧪 Tests',        },
  { id: 'pr',        label: '🔀 PR Review',    },
  { id: 'health',    label: '📊 Health',       },
  { id: 'sessions',  label: '⚡ Bob Sessions', },
];

export default function Dashboard({ repoData, owner, repo }) {
  const [activeTab, setActiveTab]   = useState('overview');

  // Docs state
  const [docFile, setDocFile]       = useState('');
  const [docCode, setDocCode]       = useState('');
  const [docResult, setDocResult]   = useState('');
  const [docLoading, setDocLoading] = useState(false);

  // Tests state
  const [testFile, setTestFile]     = useState('');
  const [testCode, setTestCode]     = useState('');
  const [testResult, setTestResult] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  const [error, setError] = useState('');

  // ─── Generate Docs ─────────────────────────────────────────────────────────
  const handleGenerateDocs = async () => {
    if (!docFile || !docCode) return;
    setDocLoading(true);
    setError('');
    try {
      const res = await bobAPI.generateDocs(docFile, docCode);
      setDocResult(res.documentation);
    } catch (err) {
      setError(err.message);
    } finally {
      setDocLoading(false);
    }
  };

  // ─── Generate Tests ────────────────────────────────────────────────────────
  const handleGenerateTests = async () => {
    if (!testFile || !testCode) return;
    setTestLoading(true);
    setError('');
    try {
      const res = await bobAPI.generateTests(testFile, testCode);
      setTestResult(res.tests);
    } catch (err) {
      setError(err.message);
    } finally {
      setTestLoading(false);
    }
  };

  const { metadata, health, summary, files } = repoData;

  return (
    <div id="dashboard" style={{ padding: '32px 24px' }} className="container">

      {/* ─── Repo Header ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{owner} /</span>
            <span>{repo}</span>
            {metadata.language && (
              <span className="badge badge-blue">{metadata.language}</span>
            )}
            {metadata.license && metadata.license !== 'None' && (
              <span className="badge badge-green">{metadata.license}</span>
            )}
          </h2>
          <p style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            {metadata.description || 'No description provided.'}
          </p>
        </div>
        <a
          href={metadata.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
        >
          View on GitHub →
        </a>
      </div>

      {/* ─── Stat Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-4 gap-4 stagger" style={{ marginBottom: '32px' }}>
        {[
          { label: 'Stars',        value: metadata.stars?.toLocaleString() || '0',    icon: '⭐' },
          { label: 'Forks',        value: metadata.forks?.toLocaleString() || '0',    icon: '🍴' },
          { label: 'Open Issues',  value: metadata.openIssues?.toLocaleString() || '0', icon: '🐛' },
          { label: 'Contributors', value: health?.totalContributors || '–',            icon: '👥' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card animate-fade-in">
            <div style={{ fontSize: '24px' }}>{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Tabs ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: '2px',
        borderBottom: '1px solid var(--border-muted)',
        marginBottom: '28px',
        overflowX: 'auto',
        paddingBottom: '0',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id
                ? '2px solid var(--accent-blue)'
                : '2px solid transparent',
              color: activeTab === tab.id
                ? 'var(--text-primary)'
                : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              fontFamily: 'var(--font-sans)',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab Panels ───────────────────────────────────────────────────── */}
      <div className="animate-fade-in" key={activeTab}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* Bob Summary Card */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <span className="card-title">
                  ⚡ IBM Bob Summary
                </span>
                <span className="badge badge-purple">AI Generated</span>
              </div>
              <p style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                fontSize: '14px',
              }}>
                {summary}
              </p>
            </div>

            {/* File Tree Card */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">📁 File Tree</span>
                <span className="badge badge-blue">{files.length} files</span>
              </div>
              <div className="code-block" style={{ maxHeight: '300px', overflow: 'auto' }}>
                {files.slice(0, 50).join('\n')}
                {files.length > 50 && `\n... and ${files.length - 50} more files`}
              </div>
            </div>

            {/* Repo Info Card */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">ℹ️ Repo Info</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Default Branch', value: metadata.defaultBranch },
                  { label: 'Last Updated',   value: new Date(metadata.updatedAt).toLocaleDateString() },
                  { label: 'Created',        value: new Date(metadata.createdAt).toLocaleDateString() },
                  { label: 'Top Contributor',value: health?.topContributor || 'N/A' },
                  { label: 'Issue Close Rate',value: `${health?.issueCloseRate || 0}%` },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border-muted)',
                  }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Topics */}
            {metadata.topics?.length > 0 && (
              <div className="card" style={{ gridColumn: '1 / -1' }}>
                <div className="card-header">
                  <span className="card-title">🏷️ Topics</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {metadata.topics.map((t) => (
                    <span key={t} className="badge badge-blue">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DOCS TAB */}
        {activeTab === 'docs' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">📄 Auto Documentation — IBM Bob</span>
              <span className="badge badge-purple">AI Powered</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Filename</label>
                <input
                  className="input input-mono"
                  placeholder="e.g. src/utils/helper.js"
                  value={docFile}
                  onChange={(e) => setDocFile(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Paste Your Code</label>
                <textarea
                  className="input input-mono"
                  placeholder="Paste the code you want Bob to document..."
                  value={docCode}
                  onChange={(e) => setDocCode(e.target.value)}
                  style={{ minHeight: '200px' }}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleGenerateDocs}
                disabled={docLoading || !docFile || !docCode}
                style={{ alignSelf: 'flex-start' }}
              >
                {docLoading ? (
                  <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Generating...</>
                ) : '⚡ Generate Docs with Bob'}
              </button>

              {docResult && (
                <div className="animate-fade-in">
                  <div className="card-header" style={{ marginTop: '8px' }}>
                    <span className="card-title">✅ Generated Documentation</span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigator.clipboard.writeText(docResult)}
                    >
                      Copy
                    </button>
                  </div>
                  <div className="code-block">{docResult}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TESTS TAB */}
        {activeTab === 'tests' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">🧪 Test Scaffolding — IBM Bob</span>
              <span className="badge badge-green">Jest</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Filename</label>
                <input
                  className="input input-mono"
                  placeholder="e.g. src/services/authService.js"
                  value={testFile}
                  onChange={(e) => setTestFile(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Paste Your Code</label>
                <textarea
                  className="input input-mono"
                  placeholder="Paste the code you want Bob to write tests for..."
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value)}
                  style={{ minHeight: '200px' }}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleGenerateTests}
                disabled={testLoading || !testFile || !testCode}
                style={{ alignSelf: 'flex-start' }}
              >
                {testLoading ? (
                  <><div className="spinner" style={{ width: '14px', height: '14px' }} /> Generating...</>
                ) : '⚡ Generate Tests with Bob'}
              </button>

              {testResult && (
                <div className="animate-fade-in">
                  <div className="card-header" style={{ marginTop: '8px' }}>
                    <span className="card-title">✅ Generated Test File</span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigator.clipboard.writeText(testResult)}
                    >
                      Copy
                    </button>
                  </div>
                  <div className="code-block">{testResult}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PR REVIEW TAB */}
        {activeTab === 'pr' && (
          <PRAssistant owner={owner} repo={repo} />
        )}

        {/* HEALTH TAB */}
        {activeTab === 'health' && (
          <RepoHealthChart health={health} metadata={metadata} />
        )}

        {/* BOB SESSIONS TAB */}
        {activeTab === 'sessions' && (
          <BobSessionLog />
        )}

      </div>

      {/* Global error */}
      {error && (
        <div className="alert alert-error animate-fade-in" style={{ marginTop: '16px' }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}
    </div>
  );
}