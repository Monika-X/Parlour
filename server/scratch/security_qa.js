// Using global fetch (available in Node 18+)
const pool = require('../config/db');

const API_BASE = 'http://localhost:5000/api';

async function runSecurityQA() {
  console.log('🚀 Starting Cross-User Security Verification...');

  // 1. Helper: Register & Login
  async function getAuth(email, name) {
    // Register
    await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: 'password123', phone: '1234567890' })
    });

    // Login
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' })
    });
    const data = await res.json();
    
    // Decode ID from token
    const base64Payload = data.token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    
    return { token: data.token, id: payload.id, email };
  }

  try {
    const timestamp = Date.now();
    const userA = await getAuth(`userA_${timestamp}@test.com`, 'User A');
    const userB = await getAuth(`userB_${timestamp}@test.com`, 'User B');

    console.log(`User A ID: ${userA.id}`);
    console.log(`User B ID: ${userB.id}`);

    // 2. Perform Bookings
    const bookingA = {
      staff_id: 1,
      service_id: 1,
      appointment_date: '2026-04-17',
      start_time: '10:00:00',
      notes: 'BOOKING USER A'
    };

    const bookingB = {
       staff_id: 1,
       service_id: 1,
       appointment_date: '2026-04-17',
       start_time: '11:00:00',
       notes: 'BOOKING USER B'
    };

    console.log('Booking for User A...');
    await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userA.token}` },
      body: JSON.stringify(bookingA)
    });

    console.log('Booking for User B...');
    await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userB.token}` },
      body: JSON.stringify(bookingB)
    });

    // 3. Database Verification
    console.log('\n--- DATABASE VERIFICATION ---');
    const [rows] = await pool.query(`
      SELECT a.id, c.user_id, u.email 
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      ORDER BY a.id DESC LIMIT 2
    `);

    // rows[0] is the latest (User B), rows[1] is previous (User A)
    const dbUserB = rows[0];
    const dbUserA = rows[1];

    console.log(`Latest 1 (Expected B): Appointment ID ${dbUserB.id}, User ID ${dbUserB.user_id}, Email ${dbUserB.email}`);
    console.log(`Latest 2 (Expected A): Appointment ID ${dbUserA.id}, User ID ${dbUserA.user_id}, Email ${dbUserA.email}`);

    const isAMatch = dbUserA.user_id === userA.id;
    const isBMatch = dbUserB.user_id === userB.id;

    if (isAMatch && isBMatch) {
      console.log('\n✅ SECURITY PASSED');
    } else {
      console.log('\n❌ SECURITY ISSUE: customer_id mismatch');
      console.log(`A Match: ${isAMatch} (DB: ${dbUserA.user_id} vs Token: ${userA.id})`);
      console.log(`B Match: ${isBMatch} (DB: ${dbUserB.user_id} vs Token: ${userB.id})`);
    }

  } catch (err) {
    console.error('Fatal Security QA Error:', err.message);
  } finally {
    pool.end();
  }
}

runSecurityQA();
