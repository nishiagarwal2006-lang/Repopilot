// Bob Prompt: "Create an Express middleware to validate internal API requests securely."
// Bob Output: Middleware that checks Authorization header against an env-stored secret.
// Bob Guidance: Never hardcode secrets; use env vars and return generic errors to avoid leaking info.
// ---- Actual Code Below ----

const logger = require('../utils/logger');

/**
 * Auth middleware — validates the internal API_SECRET from the Authorization header.
 * Usage: app.use('/api', authMiddleware)
 * Header format: Authorization: Bearer <API_SECRET>
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check header exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`Unauthorized request from ${req.ip} — missing Authorization header`);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or malformed Authorization header.',
    });
  }

  const token = authHeader.split(' ')[1];

  // Compare against env secret
  if (token !== process.env.API_SECRET) {
    logger.warn(`Unauthorized request from ${req.ip} — invalid token`);
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Invalid API secret.',
    });
  }

  // All good — continue
  next();
};

module.exports = authMiddleware;