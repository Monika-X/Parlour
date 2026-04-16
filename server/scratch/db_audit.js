const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [rows] = await connection.execute('SELECT id, name, email, role FROM users');
    console.log('--- USERS ---');
    console.log(JSON.stringify(rows, null, 2));

    const [staff] = await connection.execute('SELECT id, user_id, specialization FROM staff');
    console.log('\n--- STAFF ---');
    console.log(JSON.stringify(staff, null, 2));

    const [mappings] = await connection.execute('SELECT * FROM staff_services');
    console.log('\n--- STAFF_SERVICES MAPPINGS ---');
    console.log(JSON.stringify(mappings, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

run();
