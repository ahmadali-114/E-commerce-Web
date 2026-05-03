require('dotenv').config();
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin');

const app = express();

// --- METRICS START ---
const client = require('prom-client');
client.collectDefaultMetrics();
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

app.all('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

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