const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const categoryRoutes = require('./routes/category.routes');
const userRoutes = require('./routes/user.routes');
const otpRoutes = require('./routes/otp.routes');
const authRoutes = require('./routes/auth.routes');
const requireAuth = require('./middleware/requireAuth.middleware');

const app = express();

// Single trusted reverse-proxy hop (Railway) — needed so express-rate-limit
// reads the real client IP from X-Forwarded-For instead of the proxy's own IP.
app.set('trust proxy', 1);

// Standard security headers; also drops the X-Powered-By: Express banner.
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/categories', requireAuth, categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  // Only deliberate 4xx messages reach the client; 5xx details (e.g. raw
  // Brevo responses) stay in the server log.
  res.status(status).json({
    success: false,
    message: status < 500 && err.message ? err.message : 'Internal Server Error',
  });
});

module.exports = app;
