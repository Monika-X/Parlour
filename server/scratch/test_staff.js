const http = require('http');

async function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    console.log('--- Fetching all staff ---');
    const allStaff = await get('http://localhost:5000/api/staff');
    console.log('Total staff:', allStaff.count);

    console.log('\n--- Fetching staff for service_id = 1 ---');
    const filteredStaff = await get('http://localhost:5000/api/staff?service_id=1');
    console.log('Staff for service 1:', filteredStaff.count);
    
    if (filteredStaff.count <= allStaff.count) {
        console.log('\n✅ Verification successful!');
    } else {
        console.log('\n❌ Verification failed: filtered count is greater than total count.');
    }
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

run();
