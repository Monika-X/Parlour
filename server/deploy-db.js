require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function deploy() {
  const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
  
  if (!connectionUrl && !process.env.MYSQLHOST) {
    console.error('Error: No database connection string found.');
    console.log('Please set MYSQL_URL in your .env file or environment variables.');
    console.log('Example: MYSQL_URL=mysql://user:pass@host:port/database');
    process.exit(1);
  }

  const config = connectionUrl || {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
  };

  try {
    const connection = await mysql.createConnection({
        ... (typeof config === 'string' ? { uri: config } : config),
        multipleStatements: true
    });

    console.log('Connected to Railway MySQL!');

    const sqlPath = path.join(__dirname, 'config', 'railway_deploy.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Creating tables...');
    await connection.query(sql);
    
    console.log('Database setup successfully completed!');
    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
