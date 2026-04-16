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
    console.log('--- Reseting Admin Password ---');
    // Admin@123 hash
    const adminHash = '$2b$10$9BlGvFj3.MoZ.Cxwxk7fIeCpEZHkXStz9lzchszR.4E062vk8OrRy';
    await connection.execute('UPDATE users SET password = ? WHERE email = ?', [adminHash, 'admin@parlour.com']);

    console.log('--- Cleaning up staff_services ---');
    await connection.execute('DELETE FROM staff_services');

    console.log('--- Mapping Services to Staff ---');
    const mappings = [
        // Hair Care (1,2,3,4) -> Staff 1, 20
        [1, 1], [1, 20], [2, 1], [2, 20], [3, 1], [3, 20], [4, 1], [4, 20],
        // Skin Care (5,6,7) -> Staff 2
        [2, 5], [2, 6], [2, 7],
        // Nail Care (8,9,10) -> Staff 6
        [6, 8], [6, 9], [6, 10], 
        // Body Wellness (11,12) -> Staff 6
        [6, 11], [6, 12],
        // Bridal (13,14) -> Staff 2
        [2, 13], [2, 14]
    ];

    for (const [staffId, serviceId] of mappings) {
        await connection.execute('INSERT IGNORE INTO staff_services (staff_id, service_id) VALUES (?, ?)', [staffId, serviceId]);
    }

    console.log('\n✅ Data fix complete!');

  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

run();
