require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API healthcheck or base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ReelsVault API Server' });
});

// API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error occurred' });
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ReelsVault Server is running on port ${PORT}`);
  console.log(`Local Access: http://localhost:${PORT}`);
});
