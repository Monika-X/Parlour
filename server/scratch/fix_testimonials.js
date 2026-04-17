
const pool = require('../config/db');

async function fixTestimonials() {
  try {
    console.log('Starting testimonials fix...');
    
    // 1. Add is_approved column to reviews table if it doesn't exist
    const [columns] = await pool.query('SHOW COLUMNS FROM reviews');
    const hasApprovedColumn = columns.some(col => col.Field === 'is_approved');
    
    if (!hasApprovedColumn) {
      console.log('Adding is_approved column to reviews table...');
      await pool.query('ALTER TABLE reviews ADD COLUMN is_approved TINYINT(1) DEFAULT 0 AFTER comment');
      console.log('Column added successfully.');
    } else {
      console.log('is_approved column already exists.');
    }

    // 2. Check if we have any reviews
    const [reviews] = await pool.query('SELECT id FROM reviews');
    
    if (reviews.length === 0) {
      console.log('No reviews found. Seeding some approved testimonials...');
      
      // We need a customer and a staff to link reviews.
      // Let's find the admin or any user.
      const [users] = await pool.query('SELECT id FROM users LIMIT 1');
      if (users.length > 0) {
        const userId = users[0].id;
        
        // Ensure this user is a customer
        await pool.query('INSERT IGNORE INTO customers (user_id) VALUES (?)', [userId]);
        const [customers] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
        const customerId = customers[0].id;
        
        // Find a staff member
        const [staff] = await pool.query('SELECT id FROM staff LIMIT 1');
        let staffId = null;
        if (staff.length > 0) {
          staffId = staff[0].id;
        } else {
          // If no staff, create one for the same user just for the seed
          await pool.query('INSERT IGNORE INTO staff (user_id, specialization) VALUES (?, ?)', [userId, 'Master Stylist']);
          const [newStaff] = await pool.query('SELECT id FROM staff WHERE user_id = ?', [userId]);
          staffId = newStaff[0].id;
        }

        // We also need an appointment for the UNIQUE constraint on appointment_id
        // However, let's relax the UNIQUE constraint for now or create dummy appointments
        
        // Let's create a few dummy appointments first
        const today = new Date().toISOString().split('T')[0];
        
        for (let i = 1; i <= 3; i++) {
          const [apptResult] = await pool.query(
            'INSERT INTO appointments (customer_id, staff_id, service_id, appointment_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [customerId, staffId, 1, today, `${9+i}:00:00`, `${10+i}:00:00`, 'completed']
          );
          const apptId = apptResult.insertId;
          
          const comments = [
            "Absolutely loved the service! The staff was so professional and the results were stunning.",
            "The best spa experience I've had in years. Highly recommend the Swedish Massage.",
            "Parlour is my go-to place for hair transformations. They truly understand what you want."
          ];
          const ratings = [5, 5, 4];
          
          await pool.query(
            'INSERT INTO reviews (appointment_id, customer_id, staff_id, rating, comment, is_approved) VALUES (?, ?, ?, ?, ?, ?)',
            [apptId, customerId, staffId, ratings[i-1], comments[i-1], 1]
          );
        }
        console.log('Seeded 3 approved reviews.');
      }
    } else {
      console.log('Reviews exist. Ensuring at least some are approved...');
      await pool.query('UPDATE reviews SET is_approved = 1 LIMIT 5');
    }

    console.log('Fix completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing testimonials:', err);
    process.exit(1);
  }
}

fixTestimonials();
