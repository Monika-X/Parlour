const mysql = require('mysql2/promise');
require('dotenv').config();

const mysqlUri = process.env.MYSQL_URL ? process.env.MYSQL_URL.trim() : null;

const connectionConfig = mysqlUri ? {
  uri: mysqlUri,
} : {
  host:     process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port:     process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user:     process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
};

const pool = mysql.createPool({
  ...connectionConfig,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone: '+05:30',
});

// Test connection on startup (non-fatal – server stays up for frontend preview)
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('MySQL connected – database:', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.warn('MySQL not connected:', err.message);
    console.warn('     ➜  Edit server/.env and set DB_PASSWORD, then restart.');
    console.warn('     ➜  Frontend is still served at http://localhost:5000\n');
    // Do NOT exit – frontend is still fully servable without DB
  }
})();

module.exports = pool;
