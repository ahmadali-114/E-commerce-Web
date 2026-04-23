const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());

const createProxy = (targetPort) => (req, res) => {
  const options = {
    hostname: 'localhost',
    port: targetPort,
    path: req.originalUrl,
    method: req.method,
    headers: req.headers,
  };
  console.log(`[Gateway] ${req.method} ${req.originalUrl} -> ${targetPort}`);
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  req.pipe(proxyReq);
  proxyReq.on('error', (err) => {
    console.error(`Proxy error: ${err.message}`);
    res.status(500).json({ error: 'Proxy failed' });
  });
};

// Auth
app.use('/api/auth', createProxy(3001));

// Public product/category
app.use('/api/products', createProxy(3002));
app.use('/api/categories', createProxy(3002));

// Admin list endpoints (must be BEFORE any generic /api/admin)
app.use('/api/admin/products', createProxy(3002));
app.use('/api/admin/users', createProxy(3004));
app.use('/api/admin/orders', createProxy(3003));

// Admin dashboard and charts
app.use('/api/admin/dashboard', createProxy(3005));
app.use('/api/admin/charts', createProxy(3005));

// Health
app.get('/health', (req, res) => res.json({ status: 'OK' }));

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Gateway running on port ${PORT}`));