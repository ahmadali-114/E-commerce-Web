require('dotenv').config();
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin');

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
    console.log(`[Metrics] Scraping metrics from Admin Service...`);
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