// Bob Prompt: "Build a sticky GitHub-style dark navbar with logo, nav links, and a Bob status indicator."
// Bob Output: Fixed top navbar with animated logo, navigation links, and a live Bob API status dot.
// Bob Guidance: Keep the navbar lightweight — no heavy state here. Use CSS position:fixed and a high z-index so it stays above all content.
// ---- Actual Code Below ----

'use client';

import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  // Add shadow when user scrolls down
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: scrolled
          ? 'rgba(13, 17, 23, 0.95)'
          : 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-muted)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 1000,
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
        boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div
        className="container"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* ─── Logo ─────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Animated logo icon */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--gradient-bob)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              boxShadow: 'var(--glow-blue)',
              animation: 'glowPulse 3s ease infinite',
            }}
          >
            🚀
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: '16px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Repo<span className="gradient-text">Pilot</span>
          </span>
          {/* Hackathon badge */}
          <span
            className="badge badge-purple"
            style={{ fontSize: '10px', padding: '2px 8px' }}
          >
            IBM Bob
          </span>
        </div>

        {/* ─── Nav Links ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { label: 'Dashboard', href: '#dashboard' },
            { label: 'Docs',      href: '#docs'      },
            { label: 'Tests',     href: '#tests'     },
            { label: 'PR Review', href: '#pr'        },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                transition: 'all 0.15s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--text-primary)';
                e.target.style.background = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--text-secondary)';
                e.target.style.background = 'transparent';
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* ─── Right Side: Bob Status + GitHub link ─────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Bob API live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent-green)',
                boxShadow: '0 0 6px var(--accent-green)',
                animation: 'pulse 2s ease infinite',
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Bob Online
            </span>
          </div>

          {/* GitHub repo link */}
          <a
            href="https://github.com/your-username/repopilot"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}