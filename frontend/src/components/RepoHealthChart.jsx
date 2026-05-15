// Bob Prompt: "Build a repo health analytics dashboard with charts for issue close rate, commit frequency, and contributor breakdown."
// Bob Output: Recharts-based dashboard with RadialBar, Bar, and stat cards showing repo health metrics.
// Bob Guidance: Use Recharts ResponsiveContainer so charts resize correctly on all screen sizes without fixed pixel widths.
// ---- Actual Code Below ----

'use client';

import {
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 12px',
        fontSize: '12px',
        color: 'var(--text-primary)',
      }}>
        {label && <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>}
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RepoHealthChart({ health, metadata }) {
  if (!health) {
    return (
      <div className="card">
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
          No health data available.
        </p>
      </div>
    );
  }

  // ─── Chart Data ──────────────────────────────────────────────────────────────
  const issueData = [
    {
      name: 'Issue Close Rate',
      value: health.issueCloseRate,
      fill: health.issueCloseRate >= 70
        ? '#3fb950'
        : health.issueCloseRate >= 40
        ? '#d29922'
        : '#f85149',
    },
  ];

  const issueBreakdown = [
    { name: 'Open',   value: health.openIssues,   fill: '#f85149' },
    { name: 'Closed', value: health.closedIssues,  fill: '#3fb950' },
  ];

  const activityData = [
    { name: 'Commits (30d)',    value: health.recentCommits     },
    { name: 'Contributors',     value: health.totalContributors },
    { name: 'Open Issues',      value: health.openIssues        },
    { name: 'Closed Issues',    value: health.closedIssues      },
  ];

  // ─── Health Score (simple formula) ──────────────────────────────────────────
  const healthScore = Math.min(
    100,
    Math.round(
      (health.issueCloseRate * 0.4) +
      (Math.min(health.recentCommits, 30) / 30 * 40) +
      (Math.min(health.totalContributors, 10) / 10 * 20)
    )
  );

  const scoreColor =
    healthScore >= 70 ? '#3fb950' :
    healthScore >= 40 ? '#d29922' :
    '#f85149';

  return (
    <div id="health" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ─── Health Score Banner ─────────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          background: `linear-gradient(135deg, ${scoreColor}15 0%, var(--bg-primary) 100%)`,
          borderColor: `${scoreColor}40`,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div className="card-title" style={{ marginBottom: '8px' }}>
              📊 Repository Health Score
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Calculated from commit frequency, issue close rate, and contributor activity.
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '56px',
              fontWeight: 800,
              color: scoreColor,
              lineHeight: 1,
              fontFamily: 'var(--font-mono)',
              textShadow: `0 0 20px ${scoreColor}50`,
            }}>
              {healthScore}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              out of 100
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stat Cards Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-4 gap-4 stagger">
        {[
          {
            label: 'Recent Commits',
            value: health.recentCommits,
            sub: 'last 30 days',
            icon: '📝',
            color: 'var(--accent-blue)',
          },
          {
            label: 'Contributors',
            value: health.totalContributors,
            sub: 'total active',
            icon: '👥',
            color: 'var(--accent-purple)',
          },
          {
            label: 'Issue Close Rate',
            value: `${health.issueCloseRate}%`,
            sub: `${health.closedIssues} closed`,
            icon: '✅',
            color: scoreColor,
          },
          {
            label: 'Open Issues',
            value: health.openIssues,
            sub: 'need attention',
            icon: '🐛',
            color: health.openIssues > 20 ? 'var(--accent-red)' : 'var(--accent-orange)',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="stat-card animate-fade-in"
            style={{ borderColor: `${stat.color}30` }}
          >
            <div style={{ fontSize: '24px' }}>{stat.icon}</div>
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── Charts Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-2 gap-4">

        {/* Issue Close Rate — Radial */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🎯 Issue Close Rate</span>
            <span
              className={`badge ${
                health.issueCloseRate >= 70 ? 'badge-green' :
                health.issueCloseRate >= 40 ? 'badge-orange' :
                'badge-red'
              }`}
            >
              {health.issueCloseRate}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              data={[{ value: health.issueCloseRate, fill: issueData[0].fill }]}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: 'var(--bg-secondary)' }}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={issueData[0].fill}
                fontSize="22"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                {health.issueCloseRate}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
          <p style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '8px',
          }}>
            {health.closedIssues} closed · {health.openIssues} open
          </p>
        </div>

        {/* Activity Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📈 Activity Overview</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={activityData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(88,166,255,0.05)' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {activityData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={[
                      '#58a6ff',
                      '#bc8cff',
                      '#f85149',
                      '#3fb950',
                    ][index]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Issue Breakdown Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🐛 Issue Breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={issueBreakdown}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <XAxis
                type="number"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(88,166,255,0.05)' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {issueBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Last Commit + Top Contributor */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">👤 Contributor Info</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '14px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                TOP CONTRIBUTOR
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <img
                  src={`https://avatars.githubusercontent.com/${health.topContributor}`}
                  alt={health.topContributor}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid var(--accent-blue)',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-blue)',
                  fontWeight: 600,
                }}>
                  @{health.topContributor}
                </span>
              </div>
            </div>

            <div style={{
              padding: '14px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                LAST COMMIT
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}>
                {health.lastCommitDate !== 'N/A'
                  ? new Date(health.lastCommitDate).toLocaleString()
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}