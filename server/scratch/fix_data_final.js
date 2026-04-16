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
    console.log('--- Cleaning up staff_services (RETRY) ---');
    await connection.execute('DELETE FROM staff_services');

    console.log('--- Mapping Services to Staff (FINAL FIX) ---');
    // Mappings: [staff_id, service_id]
    const mappings = [
        // Hair Stylists (1 and 20) -> Hair Care (1, 2, 3, 4)
        [1, 1], [1, 2], [1, 3], [1, 4],
        [20, 1], [20, 2], [20, 3], [20, 4],
        
        // Makeup Artist (2) -> Skin Care (5, 6, 7) + Bridal (13, 14)
        [2, 5], [2, 6], [2, 7],
        [2, 13], [2, 14],
        
        // Spa Therapist (6) -> Nail Care (8, 9, 10) + Body Wellness (11, 12)
        [6, 8], [6, 9], [6, 10],
        [6, 11], [6, 12]
    ];

    for (const [staffId, serviceId] of mappings) {
        await connection.execute('INSERT IGNORE INTO staff_services (staff_id, service_id) VALUES (?, ?)', [staffId, serviceId]);
    }

    console.log(`\n✅ Successfully created ${mappings.length} mappings.`);

  } catch (err) {
    console.error('❌ Error during database update:', err);
  } finally {
    await connection.end();
  }
}

run();
