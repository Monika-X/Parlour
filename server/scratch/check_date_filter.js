const pool = require('./config/db');

async function checkDateFiltering(staffId, date1, date2) {
    const query = `
        SELECT start_time, end_time, appointment_date
        FROM appointments
        WHERE staff_id = ?
        AND DATE(appointment_date) = DATE(?)
        AND status NOT IN ('cancelled','no_show')
    `;

    console.log(`--- Checking Date: ${date1} ---`);
    const [rows1] = await pool.query(query, [staffId, date1]);
    console.log(`Count: ${rows1.length}`);
    rows1.forEach(r => console.log(`  ${r.appointment_date} | ${r.start_time}`));

    console.log(`\n--- Checking Date: ${date2} ---`);
    const [rows2] = await pool.query(query, [staffId, date2]);
    console.log(`Count: ${rows2.length}`);
    rows2.forEach(r => console.log(`  ${r.appointment_date} | ${r.start_time}`));
}

async function run() {
    // Check Staff 1 for April 16 and April 17
    await checkDateFiltering(1, '2026-04-16', '2026-04-17');
    process.exit(0);
}

run();
