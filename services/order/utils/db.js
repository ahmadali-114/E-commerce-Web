const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easeshop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const getOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
};

const insert = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return result.insertId;
};

module.exports = { pool, query, getOne, insert };