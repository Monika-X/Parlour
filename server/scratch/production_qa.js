const API_BASE = 'http://localhost:5000/api';

async function runQA() {
  console.log('🚀 Starting Production QA Verification...');
  const results = [];

  // Helper: Test Endpoint
  async function test(name, endpoint, method = 'GET', body = null, token = null) {
    console.log(`\n[${name}] ${method} ${endpoint}`);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });

      const data = await res.json();
      const status = res.status;
      
      console.log(`Status: ${status}`);
      console.log('Response:', JSON.stringify(data).substring(0, 100) + '...');

      results.push({ name, status, success: data.success, data });
      return { status, data };
    } catch (err) {
      console.error(`Error in ${name}:`, err.message);
      results.push({ name, status: 'ERROR', success: false, message: err.message });
      return null;
    }
  }

  // 1. AVAILABILITY API TESTS
  await test('Availability - Valid Staff', '/appointments/available?staff_id=1&date=2026-05-20&service_id=1');
  await test('Availability - Any Stylist', '/appointments/available?date=2026-05-20&service_id=1');
  await test('Availability - Invalid Staff', '/appointments/available?staff_id=9999&date=2026-05-20&service_id=1');
  await test('Availability - String Null', '/appointments/available?staff_id=null&date=2026-05-20&service_id=1');

  // 2. AUTHENTICATION (For Booking)
  // Attempt login with known admin (we'll try common password or just register a new one)
  let token = null;
  const loginRes = await test('Auth - Login admin', '/auth/login', 'POST', {
    email: 'admin@parlour1.com',
    password: 'admin123'
  });

  if (loginRes?.status === 200) {
    token = loginRes.data.token;
  } else {
    console.log('Admin login failed, registering guest test user...');
    const registerRes = await test('Auth - Register Test User', '/auth/register', 'POST', {
      name: 'QA Tester',
      email: `qa_test_${Date.now()}@example.com`,
      password: 'password123',
      phone: '1234567890'
    });
    token = registerRes?.data?.token;
  }

  if (!token) {
    console.error('CRITICAL: Failed to obtain auth token. Skipping booking tests.');
  } else {
    // Determine the actual user ID from the token (JWT decode simplified)
    const base64Payload = token.split('.')[1];
    const userPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    const actualUserId = userPayload.id;

    // 3. BOOKING API TESTS
    const start_time = `${10 + Math.floor(Math.random() * 8)}:00:00`;
    const bookingPayload = {
      staff_id: 1,
      service_id: 1,
      appointment_date: '2027-12-12',
      start_time,
      notes: 'QA PRODUCTION TEST'
    };

    const book1 = await test('Booking - Valid Creation', '/appointments', 'POST', bookingPayload, token);
    
    if (book1?.status === 201) {
      console.log('--- TESTING IDEMPOTENCY ---');
      await test('Booking - Duplicate Prevention', '/appointments', 'POST', bookingPayload, token);
    }

    // 4. VALIDATION TESTS
    await test('Validation - Past Time', '/appointments', 'POST', {
      ...bookingPayload,
      appointment_date: '2020-01-01',
      start_time: '10:00:00'
    }, token);

    await test('Validation - Invalid Date Format', '/appointments', 'POST', {
      ...bookingPayload,
      appointment_date: '20-05-2026'
    }, token);

    await test('Validation - String ID', '/appointments', 'POST', {
      ...bookingPayload,
      service_id: 'one'
    }, token);
  }

  console.log('\n--- FINAL QA SUMMARY ---');
  results.forEach(r => {
    const icon = (r.status === 200 || r.status === 201 || (r.name.includes('Prevention') && r.status === 409) || (r.name.includes('Validation') && r.status === 422)) ? '✅' : '❌';
    console.log(`${icon} [${r.status}] ${r.name}`);
  });
}

runQA().catch(err => {
  console.error('Fatal QA Error:', err);
  process.exit(1);
});
