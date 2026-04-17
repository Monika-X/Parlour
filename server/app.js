require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const appointmentRoutes = require('./routes/appointments');
const staffRoutes = require('./routes/staff');
const customerRoutes = require('./routes/customers');
const analyticsRoutes = require('./routes/analytics');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// DB connection
require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// ── SECURITY MIDDLEWARE ──────────────────────────────────
// HTTP security headers (XSS filter, noSniff, frameguard, etc.)
app.use(helmet({
  contentSecurityPolicy: false,   // disabled so inline scripts & CDN work
  crossOriginEmbedderPolicy: false
}));

// Global API rate limiter: 200 requests per 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api', apiLimiter);

// Strict auth rate limiter: 15 attempts per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── CORE MIDDLEWARE ──────────────────────────────────────
app.use(cors({
  origin: true, // Allows all origins in production, or replace with your Render URL
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));  // Body size limit (prevents payload attacks)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan('dev'));

// Input sanitization middleware (strip HTML tags from all string inputs)
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<[^>]*>/g, '').trim();
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
    return obj;
  };
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
});

// ── PERFORMANCE ──────────────────────────────────────────
// Gzip compression for all responses (reduces transfer size ~70%)
app.use(compression());

// Static files with aggressive caching for assets
app.use(express.static(path.join(__dirname, '..', 'client'), {
  maxAge: '1h',                    // HTML pages: 1 hour cache
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // CSS, JS, images, fonts: cache for 1 year (immutable assets)
    if (/\.(css|js|png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// ── API ROUTES ────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Health check (cloud-ready: includes uptime and memory)
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'Parlour API is running',
    environment: process.env.NODE_ENV || 'development',
    uptime: `${Math.floor(process.uptime())}s`,
    memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    timestamp: new Date()
  });
});

// Optional Maintenance Mode Middleware
app.use((req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    // Exclude API if you still want API to work, or block everything
    if (!req.path.startsWith('/api')) {
      return res.sendFile(path.join(__dirname, '..', 'client', 'pages', 'maintenance.html'));
    }
  }
  next();
});

// 404 Fallback for non-API routes (Frontend 404 page)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(); // Let the API notFound middleware handle it
  }
  res.status(404).sendFile(path.join(__dirname, '..', 'client', 'pages', '404.html'));
});

// ── ERROR HANDLERS ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── CRON JOBS ─────────────────────────────────────────────
const cron = require('node-cron');
const { sendReminders } = require('./controllers/reminderController');

// Run appointment reminders daily at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running scheduled appointment reminders...');
  try {
    // Call controller function (handles null res gracefully)
    await sendReminders(null, null, (err) => console.error('Cron Reminder Error:', err));
  } catch (err) {
    console.error('Failed to execute scheduled reminders:', err.message);
  }
});

// ── START SERVER ──────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\nParlour Server running on http://localhost:${PORT}`);
  console.log(`API Base: http://localhost:${PORT}/api`);
  console.log(`Client: http://localhost:${PORT}`);
  console.log(`Scheduled Jobs: Daily Reminders at 09:00 AM\n`);
});

// ── GRACEFUL SHUTDOWN (cloud-ready) ──────────────────────
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  setTimeout(() => { console.error('Forced shutdown.'); process.exit(1); }, 10000);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;