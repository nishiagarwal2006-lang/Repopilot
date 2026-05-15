// Bob Prompt: "Create a Next.js root layout with GitHub dark theme metadata, font loading, and a persistent Navbar."
// Bob Output: Root layout wrapping all pages with HTML metadata and the Navbar component.
// Bob Guidance: Set the viewport and theme-color meta tags so mobile browsers render the dark background correctly.
// ---- Actual Code Below ----

import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'RepoPilot — IBM Bob GitHub Assistant',
  description:
    'RepoPilot: AI-powered GitHub workflow automation using IBM Bob. Auto-generate docs, tests, and PR reviews.',
  keywords: ['IBM Bob', 'GitHub', 'AI', 'automation', 'developer tools', 'RepoPilot'],
  authors: [{ name: 'RepoPilot Team' }],
  themeColor: '#0d1117',
  openGraph: {
    title: 'RepoPilot — IBM Bob GitHub Assistant',
    description: 'AI-powered GitHub workflow automation using IBM Bob.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d1117',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-color-mode="dark">
      <body>
        {/* Persistent top navigation bar */}
        <Navbar />

        {/* Main page content */}
        <main style={{ minHeight: 'calc(100vh - 60px)', paddingTop: '60px' }}>
          {children}
        </main>

        {/* Footer */}
        <footer
          style={{
            borderTop: '1px solid var(--border-muted)',
            padding: '20px 24px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '12px',
            background: 'var(--bg-primary)',
          }}
        >
          RepoPilot · Built for IBM Bob Hackathon · MIT License ·{' '}
          <a
            href="https://github.com/your-username/repopilot"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-link)', textDecoration: 'none' }}
          >
            GitHub
          </a>
        </footer>
      </body>
    </html>
  );
}