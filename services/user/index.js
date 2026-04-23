require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const { pool } = require('./utils/db');

const app = express();

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