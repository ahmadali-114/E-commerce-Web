require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const { pool } = require('./utils/db');

const app = express();

// --- METRICS START ---
const client = require('prom-client');

// Initialize metrics with a custom registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom counter for HTTP requests (registered to the custom registry)
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Expose /metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    console.log(`[Metrics] Scraping metrics from Auth Service...`);
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    console.error(`[Metrics Error] Failed to generate metrics:`, err);
    res.status(500).end(err.message);
  }
});

// Middleware to track request metrics
app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.path !== '/metrics') {
      httpRequestsTotal.inc({
        method: req.method,
        route: req.path,
        status_code: res.statusCode
      });
    }
  });
  next();
});
// --- METRICS END ---

app.use(cors());
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[Auth Service] ${req.method} ${req.url}`);
  next();
});

// Mount auth routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', service: 'auth-service' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found in Auth Service' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 3001;

// Start server only after successful database connection
const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    connection.release();

    // Verify JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined in environment variables');
      process.exit(1);
    }
    console.log('✅ JWT_SECRET is configured');

    app.listen(PORT, () => {
      console.log(`🔐 Auth Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
};

startServer();