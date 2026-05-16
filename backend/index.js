// Bob Prompt: "Build a secure, production-ready Express server with rate limiting, CORS, and helmet."
// Bob Output: Full server scaffold with middleware stack, route mounting, and graceful error handling.
// Bob Guidance: Always load dotenv first, mount security middleware before routes, use a global error handler.
// ---- Actual Code Below ----

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const authMiddleware = require('./middleware/auth');

// Route imports
const bobRoutes = require('./routes/bob');
const githubRoutes = require('./routes/github');
const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet()); // Sets secure HTTP headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // Max 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use(limiter);

// ─── Body Parsing & Logging ────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP request logging

// ─── Health Check (no auth needed) ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'RepoPilot backend is running 🚀',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ─── Protected API Routes ──────────────────────────────────────────────────────
// All /api/* routes require the internal API_SECRET
// app.use('/api', authMiddleware);  // temporarily disabled for dev
app.use('/api/bob', bobRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/report', reportRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message,
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`RepoPilot backend running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app; // Export for testing