const express = require('express');
const cors = require('cors');
const categoryRoutes = require('./routes/category.routes');
const userRoutes = require('./routes/user.routes');
const otpRoutes = require('./routes/otp.routes');

const app = express();

// Single trusted reverse-proxy hop (Railway) — needed so express-rate-limit
// reads the real client IP from X-Forwarded-For instead of the proxy's own IP.
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
