const mysql = require('mysql2/promise');
require('dotenv').config();

async function update() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Connected to database.');

  const sql = `
    CREATE TABLE IF NOT EXISTS staff_schedules (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      staff_id     INT NOT NULL,
      day_of_week  TINYINT NOT NULL, -- 0 (Sun) to 6 (Sat)
      start_time   TIME DEFAULT '09:00:00',
      end_time     TIME DEFAULT '18:00:00',
      is_off       TINYINT(1) DEFAULT 0,
      UNIQUE KEY (staff_id, day_of_week),
      FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
    );
  `;

  await connection.query(sql);
  console.log('Table staff_schedules created successfully (if it didn\'t exist).');

  // Insert default 9-6 schedules for existing staff if they don't have any
  const [staff] = await connection.query('SELECT id FROM staff');
  for (const s of staff) {
    for (let i = 0; i < 7; i++) {
      await connection.query(
        'INSERT IGNORE INTO staff_schedules (staff_id, day_of_week, start_time, end_time, is_off) VALUES (?, ?, ?, ?, ?)',
        [s.id, i, '09:00:00', '18:00:00', 0]
      );
    }
  }
  console.log('Default schedules inserted for existing staff.');

  await connection.end();
}

update().catch(err => {
  console.error(err);
  process.exit(1);
});
