const pool = require('../config/db');

async function testSlots(date, staffId, serviceId) {
    const SLOT_DURATION = 30;
    const allSlots = [
        "09:00", "09:30", "10:00", "10:30",
        "11:00", "11:30", "12:00", "12:30",
        "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30",
        "17:00", "17:30", "18:00", "18:30",
        "19:00"
    ];

    const [bookings] = await pool.query(
        `SELECT start_time, end_time 
         FROM appointments
         WHERE staff_id = ?
         AND DATE(appointment_date) = DATE(?)
         AND status NOT IN ('cancelled','no_show')`,
        [staffId, date]
    );

    console.log(`\nTesting: Date=${date}, StaffID=${staffId}`);
    console.log(`Found ${bookings.length} bookings.`);

    const toMin = (t) => {
        const [h, m] = t.substring(0, 5).split(':').map(Number);
        return h * 60 + m;
    };

    let booked = new Set();
    bookings.forEach(b => {
        const start = toMin(b.start_time);
        const end = toMin(b.end_time);
        console.log(`  Booking: ${b.start_time} - ${b.end_time} (${start} - ${end} mins)`);

        allSlots.forEach(slot => {
            const slotStart = toMin(slot);
            const slotEnd = slotStart + SLOT_DURATION;
            if (slotStart < end && slotEnd > start) {
                booked.add(slot);
            }
        });
    });

    const results = allSlots.filter(s => booked.has(s));
    console.log(`Blocked slots: ${results.join(', ') || 'None'}`);
}

async function runTests() {
    // Test for April 16 (IST) / April 15 (UTC)
    await testSlots('2026-04-16', 1, 1);
    await testSlots('2026-04-16', 2, 1);
    await testSlots('2026-04-16', 0, 1); // Any Stylist
    
    // Test for April 17 (IST) / April 16 (UTC)
    await testSlots('2026-04-17', 1, 1);
    
    process.exit(0);
}

runTests();
