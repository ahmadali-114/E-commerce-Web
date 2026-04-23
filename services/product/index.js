require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');

const app = express();
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