// Bob Prompt: "Set up a production-grade logger for an Express backend."
// Bob Output: Recommended Winston with console + file transports, colored dev output.
// Bob Guidance: Separate log levels per environment; always log timestamps for session tracing.
// ---- Actual Code Below ----

const { createLogger, format, transports } = require('winston');

const { combine, timestamp, colorize, printf, json } = format;

// Custom readable format for development
const devFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
  transports: [
    // Console output — colorized in dev, plain JSON in prod
    new transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? combine(timestamp(), json())
          : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), devFormat),
    }),

    // Always write errors to a log file
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), json()),
    }),

    // Write all logs to combined log file
    new transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), json()),
    }),
  ],
});

module.exports = logger;