const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connectionUrl = "mysql://root:gbEjGWELDeupAXWZvCdEvAOrScZJpHbj@nozomi.proxy.rlwy.net:29513/railway";
  const conn = await mysql.createConnection(connectionUrl);
  console.log('Connected to Railway');

  await conn.query('DELETE FROM staff_services');
  
  const assignments = [
    { sid: 1, cats: [1, 5] }, // Ananya: Hair & Bridal
    { sid: 5, cats: [1, 5] }, // Sneha: Hair & Bridal
    { sid: 2, cats: [2] },    // Vikram: Skin
    { sid: 6, cats: [2] },    // Rahul: Skin
    { sid: 3, cats: [3] },    // Priya: Nails
    { sid: 4, cats: [4] }     // David: Massage
  ];

  for (const a of assignments) {
      await conn.query(
          `INSERT INTO staff_services (staff_id, service_id) 
           SELECT ?, id FROM services WHERE category_id IN (?)`,
          [a.sid, a.cats]
      );
  }

  console.log('✅ Staff-Service links updated successfully.');
  await conn.end();
}

run().catch(console.error);
