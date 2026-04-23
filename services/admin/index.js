require('dotenv').config();
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`[Admin] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', service: 'admin-service' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found in Admin Service' });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`📊 Admin Service running on port ${PORT}`);
});