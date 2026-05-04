require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const { pool } = require('./utils/db');

const app = express();

// --- METRICS START ---
const client = require('prom-client');

// Initialize metrics
const register = client.register;
client.collectDefaultMetrics({ register });

// Custom counter for HTTP requests
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Expose /metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    console.log(`[Metrics] Scraping metrics from User Service...`);
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
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'user-service' });
});

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found in User Service' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong in User Service!' });
});

const PORT = process.env.PORT || 3004;

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected');
    connection.release();
    app.listen(PORT, () => console.log(`👤 User Service running on port ${PORT}`));
  } catch (error) {
    console.error('❌ DB connection failed:', error.message);
    process.exit(1);
  }
};

startServer();