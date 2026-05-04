require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
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
    console.log(`[Metrics] Scraping metrics from Product Service...`);
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

// 🔍 DEBUG: Log every request
app.use((req, res, next) => {
  console.log(`[Product Service] ${req.method} ${req.url}`);
  next();
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'product-service' }));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found in Product Service' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));