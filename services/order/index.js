require('dotenv').config();
const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const { pool } = require('./utils/db');
const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();
register.setDefaultLabels({ app: 'order-service' });
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
app.use(express.urlencoded({ extended: true }));

// Middleware to count requests
app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.path !== '/metrics') {
      httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
    }
  });
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'order-service' });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Internal stock update endpoint for Product Service
app.put('/api/internal/stock', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const { query } = require('./utils/db');
    await query('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', [quantity, productId, quantity]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found in Order Service' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong in Order Service!' });
});

const PORT = process.env.PORT || 3003;

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected');
    connection.release();
    app.listen(PORT, () => console.log(`📦 Order Service running on port ${PORT}`));
  } catch (error) {
    console.error('❌ DB connection failed:', error.message);
    process.exit(1);
  }
};

startServer();