

const API_BASE = 'http://localhost:5000/api';

async function testPaymentIntent() {
  try {
    console.log('--- 1. Acquiring Test Token ---');
    // Login to get token using one of QA accounts just created
    const authRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@parlour.com', password: 'password123' })
    });
    
    // Check if the admin login worked, else create a user
    let data = await authRes.json();
    let token = data.token;
    
    if (!token) {
        console.log('Creating ad-hoc testing user...');
        await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Payment QA', email: 'paymentqa@example.com', password: 'password123', phone: '000' })
        });
        const rLogin = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'paymentqa@example.com', password: 'password123' })
        });
        token = (await rLogin.json()).token;
    }
    
    console.log('✅ Token Acquired.');

    console.log('\n--- 2. Creating Payment Intent for Service ID 1 ---');
    const paymentRes = await fetch(`${API_BASE}/payments/create-intent`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ service_id: 1 }) // Haircut
    });

    const paymentData = await paymentRes.json();
    console.log('Payment API Response:', JSON.stringify(paymentData, null, 2));

    if(paymentData.success) {
        console.log('✅ Payment Intent generated successfully.');
        if(paymentData.mock) console.log('✅ Mock fallback behaved correctly.');
        else console.log('✅ Active Stripe intent provided:', paymentData.clientSecret);
    } else {
        console.log('❌ Failed to generate intent.');
    }
  } catch (err) {
    console.error('Test script crashed:', err);
  }
}

testPaymentIntent();
