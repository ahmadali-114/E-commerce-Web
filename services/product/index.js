require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();
register.setDefaultLabels({ app: 'product-service' });
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

// Middleware to count requests
app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.path !== '/metrics') {
      httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
    }
  });
  next();
});

// 🔍 DEBUG: Log every request
app.use((req, res, next) => {
  console.log(`[Product Service] ${req.method} ${req.url}`);
  next();
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK', service: 'product-service' }));

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found in Product Service' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));