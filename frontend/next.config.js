// Bob Prompt: "Configure Next.js for a production deployment on Vercel with backend API proxying."
// Bob Output: next.config with rewrites to proxy /api/* to the Express backend.
// Bob Guidance: Use rewrites so the frontend never exposes the backend URL to the browser — all API calls go through Next.js in production.
// ---- Actual Code Below ----

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy all /api/* calls to the Express backend
  // In production replace with your Render backend URL
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:5000/api/:path*',
      },
    ];
  },

  // Allow images from GitHub avatars
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },

  // Strict mode for better dev warnings
  reactStrictMode: true,
};

module.exports = nextConfig;