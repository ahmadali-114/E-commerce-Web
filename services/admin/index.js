require('dotenv').config();
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin');
const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();
register.setDefaultLabels({ app: 'admin-service' });
client.collectDefaultMetrics({ register });

// Create a custom counter metric
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestCounter);

const app = express();
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.path !== '/metrics') {
      httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
    }
  });
  next();
});

app.use((req, res, next) => {
  console.log(`[Admin] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', service: 'admin-service' }));

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found in Admin Service' });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`📊 Admin Service running on port ${PORT}`);
});