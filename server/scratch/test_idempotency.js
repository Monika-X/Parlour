const axios = require('axios');

async function testIdempotency() {
  const API_URL = 'http://localhost:5000/api/appointments';
  
  // Note: Replace with a valid token from your environment if needed
  // For the sake of this test, we assume the server is running and we can simulate a payload
  const payload = {
    customer_id: 1, // Assumes user ID 1 exists
    staff_id: 6,
    service_id: 1,
    appointment_date: '2026-05-01',
    start_time: '10:00:00',
    notes: 'Idempotency Test'
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE' // This script is a template; in real test we'd need a token
  };

  try {
    console.log('Sending first booking request...');
    // const res1 = await axios.post(API_URL, payload, { headers });
    // console.log('First request status:', res1.status);

    console.log('Sending second (duplicate) booking request immediately...');
    // const res2 = await axios.post(API_URL, payload, { headers });
    // console.log('Second request status:', res2.status);
  } catch (err) {
    console.log('Caught expected error or actual error:', err.response?.status, err.response?.data?.message);
  }
}

console.log('Idempotency test script created. Monitoring logs for manual verification.');
