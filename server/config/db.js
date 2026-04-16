const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'parlour_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone: '+05:30',
});

// Test connection on startup (non-fatal – server stays up for frontend preview)
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅  MySQL connected – database:', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.warn('⚠️   MySQL not connected:', err.message);
    console.warn('     ➜  Edit server/.env and set DB_PASSWORD, then restart.');
    console.warn('     ➜  Frontend is still served at http://localhost:5000\n');
    // Do NOT exit – frontend is still fully servable without DB
  }
})();

module.exports = pool;
