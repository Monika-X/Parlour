const pool = require('../config/db');
const { transporter, sendNotification } = require('../utils/notificationService');

// ── GET ALL APPOINTMENTS ──────────────────────────────────
const getAllAppointments = async (req, res, next) => {
  try {
    const { status, date, customer_id, staff_id } = req.query;
    let sql = `
      SELECT a.id, a.customer_id, a.staff_id, a.service_id, 
             DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
             a.start_time, a.end_time, a.status, a.total_price, a.notes,
             u_c.name AS customer_name, u_c.phone AS customer_phone,
             u_s.name AS staff_name,
             s.name   AS service_name, s.duration_min
      FROM   appointments a
      JOIN   customers c  ON a.customer_id = c.id
      JOIN   users u_c    ON c.user_id     = u_c.id
      JOIN   staff st     ON a.staff_id    = st.id
      JOIN   users u_s    ON st.user_id    = u_s.id
      JOIN   services s   ON a.service_id  = s.id
      WHERE 1=1
    `;
    const params = [];
    if (status) { sql += ' AND a.status = ?'; params.push(status); }
    if (date) { sql += ' AND a.appointment_date = ?'; params.push(date); }
    if (customer_id) { sql += ' AND a.customer_id = ?'; params.push(customer_id); }
    if (staff_id) { sql += ' AND a.staff_id = ?'; params.push(staff_id); }
    sql += ' ORDER BY a.appointment_date DESC, a.start_time ASC';

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) { next(err); }
};

// ── GET SINGLE APPOINTMENT ────────────────────────────────
const getAppointmentById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.customer_id, a.staff_id, a.service_id, 
               DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
               a.start_time, a.status,
               u_c.name AS customer_name, u_s.name AS staff_name, s.name AS service_name
       FROM appointments a
       JOIN customers c ON a.customer_id = c.id JOIN users u_c ON c.user_id = u_c.id
       JOIN staff st ON a.staff_id = st.id       JOIN users u_s ON st.user_id = u_s.id
       JOIN services s ON a.service_id = s.id
       WHERE a.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

// ── GET AVAILABLE SLOTS ──────────────────────────────────
const getAvailableSlots = async (req, res) => {
  const { staff_id, date, service_id } = req.query;
  const SLOT_DURATION = 30;

  const allSlots = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30",
    "19:00"
  ];

  // Helper: convert time string "HH:MM" → minutes from midnight
  const toMin = (t) => {
    if (!t) return 0;
    const [h, m] = t.substring(0, 5).split(':').map(Number);
    return h * 60 + m;
  };

  try {
    let qualifiedStaffIds = [];
    
    // Normalize staff_id (handle "null" string, null, 0, or undefined)
    const normalizedStaffId = (staff_id === 'null' || !staff_id || Number(staff_id) === 0) ? null : Number(staff_id);

    if (normalizedStaffId === null) {
      // Any Stylist: Find all staff who provide this service
      const [staff] = await pool.query(
        'SELECT staff_id FROM staff_services WHERE service_id = ?',
        [service_id]
      );
      qualifiedStaffIds = staff.map(s => s.staff_id);
    } else {
      // Specific Stylist: Ensure they actually exist
      const [exists] = await pool.query('SELECT id FROM staff WHERE id = ?', [normalizedStaffId]);
      if (exists.length === 0) {
        qualifiedStaffIds = []; // No such staff exists
      } else {
        qualifiedStaffIds = [normalizedStaffId];
      }
    }

    if (qualifiedStaffIds.length === 0) {
      return res.json({ success: true, data: allSlots.map(s => ({ time: s, available: false })) });
    }

    // GET ALL BOOKINGS for these staff members on this date
    const [bookings] = await pool.query(
      `SELECT staff_id, start_time, end_time 
       FROM appointments
       WHERE staff_id IN (?)
       AND DATE(appointment_date) = DATE(?)
       AND status NOT IN ('cancelled','no_show')`,
      [qualifiedStaffIds, date]
    );

    // Build a map of staff_id -> Set of booked slots
    const staffBookings = {};
    qualifiedStaffIds.forEach(sid => staffBookings[sid] = new Set());

    bookings.forEach(b => {
      const start = toMin(b.start_time);
      const end = toMin(b.end_time);

      allSlots.forEach(slot => {
        const slotStart = toMin(slot);
        const slotEnd = slotStart + SLOT_DURATION;
        if (slotStart < end && slotEnd > start) {
          staffBookings[b.staff_id]?.add(slot);
        }
      });
    });

    const result = allSlots.map(slot => {
      const isAnyStaffFree = qualifiedStaffIds.some(sid => !staffBookings[sid].has(slot));
      return {
        time: slot,
        available: isAnyStaffFree
      };
    });

    // Deduplicate and Sort
    const uniqueResults = Array.from(new Map(result.map(item => [item.time, item])).values())
      .sort((a, b) => a.time.localeCompare(b.time));

    return res.json({ success: true, data: uniqueResults });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Error fetching availability' });
  }
};

// ── CREATE APPOINTMENT ────────────────────────────────────
const createAppointment = async (req, res, next) => {
  try {
    // 1. Sanitize & Parse Types (Security Fix: Use authenticated user ID)
    const customer_id = req.user.id;
    const staff_id = Number(req.body.staff_id || 0); // 0 = Any Stylist
    const service_id = Number(req.body.service_id);
    const { notes } = req.body;
    
    // Format date and time
    const appointment_date = req.body.appointment_date.split('T')[0];
    let start_time = req.body.start_time;
    if (start_time.length === 5) start_time += ':00'; // Ensure HH:mm:ss

    // 2. Idempotency Check: Prevent duplicate bookings in a short window
    const [existing] = await pool.query(
      `SELECT id FROM appointments 
       WHERE customer_id = (SELECT id FROM customers WHERE user_id = ?)
       AND service_id = ? 
       AND appointment_date = ? 
       AND start_time = ?
       AND created_at > NOW() - INTERVAL 1 MINUTE`,
      [customer_id, service_id, appointment_date, start_time]
    );

    if (existing.length > 0) {
      console.warn(`🕒 Duplicate booking attempt blocked for user ${customer_id}`);
      return res.status(409).json({ 
        success: false, 
        message: 'A duplicate booking was detected. Please check your dashboard.' 
      });
    }

    // --- PART 2: BACKEND TIME VALIDATION ---
    const now = new Date();
    const bookingDateTime = new Date(`${appointment_date}T${start_time}`);
    if (bookingDateTime < now) {
      console.warn(`❌ Past-time booking attempt blocked: ${appointment_date} ${start_time}`);
      return res.status(400).json({
        success: false,
        message: "Cannot book past time slots"
      });
    }

    const [custRows] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [customer_id]);
    let resolvedCustomerId;
    if (!custRows.length) {
      const [ins] = await pool.query('INSERT IGNORE INTO customers (user_id) VALUES (?)', [customer_id]);
      resolvedCustomerId = ins.insertId || customer_id;
    } else {
      resolvedCustomerId = custRows[0].id;
    }

    const [userInfo] = await pool.query('SELECT name, email, phone FROM users WHERE id = ?', [customer_id]);
    const user = userInfo[0] || {};

    const [svc] = await pool.query('SELECT name, price, duration_min FROM services WHERE id = ?', [service_id]);
    if (!svc.length) return res.status(404).json({ success: false, message: 'Service not found.' });
    const { name: serviceName, price, duration_min } = svc[0];

    const [startH, startM] = start_time.split(':').map(Number);
    const endDate = new Date(0, 0, 0, startH, startM + duration_min);
    const end_time = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00`;

    let finalStaffId = Number(staff_id);
    if (finalStaffId === 0) {
      const [qualified] = await pool.query('SELECT staff_id FROM staff_services WHERE service_id = ?', [service_id]);
      if (!qualified.length) return res.status(400).json({ success: false, message: 'No staff available for this service.' });

      let foundStaff = null;
      for (const row of qualified) {
        const [overlap] = await pool.query(
          `SELECT id FROM appointments 
           WHERE appointment_date = ? AND staff_id = ? AND status NOT IN ('cancelled', 'no_show')
           AND (start_time < ? AND end_time > ?)`,
          [appointment_date, row.staff_id, end_time, start_time]
        );
        if (overlap.length === 0) { foundStaff = row.staff_id; break; }
      }
      if (!foundStaff) return res.status(409).json({ success: false, message: 'No stylists are available at this time.' });
      finalStaffId = foundStaff;
    } else {
      const [staffRows] = await pool.query('SELECT id FROM staff WHERE id = ?', [finalStaffId]);
      if (!staffRows.length) return res.status(404).json({ success: false, message: 'Staff not found.' });
      const [overlap] = await pool.query(
        `SELECT id FROM appointments 
         WHERE appointment_date = ? AND staff_id = ? AND status NOT IN ('cancelled', 'no_show')
         AND (start_time < ? AND end_time > ?)`,
        [appointment_date, finalStaffId, end_time, start_time]
      );
    }

    const { payment_intent_id } = req.body;

    const [result] = await pool.query(
      `INSERT INTO appointments (customer_id, staff_id, service_id, appointment_date, start_time, end_time, status, total_price, notes, payment_intent_id)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)`,
      [resolvedCustomerId, finalStaffId, service_id, appointment_date, start_time, end_time, price, req.body.notes || null, payment_intent_id || null]
    );

    // --- PART 1: EMAIL FIX (PARALLEL & EXPLICIT) ---
    const [staffInfo] = await pool.query(
      'SELECT u.name FROM staff s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
      [finalStaffId]
    );
    const staffName = staffInfo[0]?.name || 'Our Specialist';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@parlour.com';

    // Fetch customer details explicitly from users table
    const [userRows] = await pool.query(
      "SELECT email, name, phone FROM users WHERE id = ?",
      [customer_id]
    );
    const customerEmail = userRows?.[0]?.email?.trim();
    const customerName = userRows?.[0]?.name || 'Valued Client';
    const customerPhone = userRows?.[0]?.phone;

    // --- FIX WRONG EMAIL DATE (Dynamic Formatting) ---
    const formattedDate = new Date(appointment_date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const formattedTime = start_time.slice(0, 5);

    console.log("Customer ID:", customer_id);
    console.log("Customer Email:", customerEmail);
    console.log("Email Date:", appointment_date);
    console.log("Email Time:", start_time);

    // Trigger emails in parallel - background execution
    (async () => {
      try {
        const emailTasks = [];

        // 📧 Customer Confirmation (Direct Object)
        if (customerEmail && customerEmail.includes("@")) {
          const customerMailOptions = {
            from: `"Parlour Salon & Spa" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: "Your Appointment is Confirmed 💇‍♀️",
            text: `Hi ${customerName},\n\nYour appointment for ${serviceName} with ${staffName} is confirmed!\n\n📅 Date: ${formattedDate}\n⏰ Time: ${formattedTime}\n\nWe look forward to seeing you at Parlour.`,
            html: `
              <div style="font-family:Arial;padding:20px;border:1px solid #eee">
                <h2 style="color:#c9a05a">Parlour Salon & Spa</h2>
                <p>Hi ${customerName},<br><br>Your appointment for <b>${serviceName}</b> with <b>${staffName}</b> is confirmed!<br><br>📅 <b>Date:</b> ${formattedDate}<br>⏰ <b>Time:</b> ${formattedTime}<br><br>We look forward to seeing you at Parlour.</p>
                <hr/><small>This is an automated email. Please do not reply.</small>
              </div>
            `
          };
          console.log("📧 Sending to customer:", customerEmail);
          emailTasks.push(transporter.sendMail(customerMailOptions).then(() => {
            console.log("Email sent to customer:", customerEmail);
          }));
        } else {
          console.log("⚠️ Invalid customer email, skipping email sending");
        }

        // 📧 Admin Notification (Direct Object)
        const adminMailOptions = {
          from: `"Parlour Salon & Spa" <${process.env.EMAIL_USER}>`,
          to: adminEmail,
          subject: "New Appointment Booked",
          text: `New booking received!\n\nCustomer: ${customerName}\nService: ${serviceName}\nDate: ${formattedDate}\nTime: ${formattedTime}\nStaff: ${staffName}`,
          html: `
            <div style="font-family:Arial;padding:20px;border:1px solid #eee">
              <h2 style="color:#c9a05a">New Booking Alert</h2>
              <p>A new booking has been received:<br><br>👤 <b>Customer:</b> ${customerName}<br>✂️ <b>Service:</b> ${serviceName}<br>📅 <b>Date:</b> ${formattedDate}<br>⏰ <b>Time:</b> ${formattedTime}<br>💇‍♂️ <b>Staff:</b> ${staffName}</p>
              <hr/><small>Admin notification system</small>
            </div>
          `
        };

        console.log("📧 Sending to admin:", adminMailOptions.to);
        emailTasks.push(transporter.sendMail(adminMailOptions).then(() => {
          console.log("Email sent to admin:", adminMailOptions.to);
        }));

        await Promise.all(emailTasks);

        // Notify via SMS if phone exists (Optional/Secondary)
        if (customerPhone) {
          await sendNotification({
            to: { phone: customerPhone },
            message: `Hi ${customerName}, your appointment for ${serviceName} is confirmed for ${formattedDate} at ${formattedTime}.`,
            type: 'sms'
          });
        }
      } catch (err) {
        console.error("Email/Notification error:", err.message);
      }
    })();

    res.status(201).json({ success: true, message: 'Appointment booked.', id: result.insertId });
  } catch (err) { next(err); }
};

// ── UPDATE APPOINTMENT STATUS ─────────────────────────────
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);

    // Send Status Update Notification
    const [info] = await pool.query(`
      SELECT u.email, u.phone, u.name, s.name as service_name
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id JOIN users u ON c.user_id = u.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (info.length) {
      const user = info[0];
      await sendNotification({
        to: { email: user.email, phone: user.phone },
        subject: `Appointment ${status.toUpperCase()} - Parlour`,
        message: `Hi ${user.name},\n\nYour appointment for ${user.service_name} has been updated to: ${status.toUpperCase()}.\n\nThank you for choosing Parlour.`,
        type: 'all'
      });
    }

    res.json({ success: true, message: 'Appointment status updated.' });
  } catch (err) { next(err); }
};

// ── INTERNAL HELPER FOR RESCHEDULE ────────────────────────
const performReschedule = async (apptId, { date: inputDate, time, staffId }, isAdmin = false, userId = null) => {
  const date = inputDate.split('T')[0];

  // 1. Get current appointment
  const [apptRows] = await pool.query(`SELECT *, DATE_FORMAT(appointment_date, '%Y-%m-%d') as appointment_date FROM appointments WHERE id = ?`, [apptId]);
  if (!apptRows.length) throw new Error('Appointment not found.');
  const appt = apptRows[0];

  // 2. Auth Check (if not admin)
  if (!isAdmin) {
    const [cust] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
    if (!cust.length || appt.customer_id !== cust[0].id) throw new Error('You do not own this appointment.');
    if (!['pending', 'confirmed'].includes(appt.status)) throw new Error('Only pending or confirmed appointments can be rescheduled.');
  }

  // 3. Date Validation (Today or Future only)
  // Get today in YYYY-MM-DD format (server local time)
  const todayObj = new Date();
  const todayStr = todayObj.getFullYear() + '-' + String(todayObj.getMonth() + 1).padStart(2, '0') + '-' + String(todayObj.getDate()).padStart(2, '0');

  if (date < todayStr) throw new Error('Cannot reschedule to a past date.');

  // 4. Resolve Duration & End Time
  const [svc] = await pool.query('SELECT duration_min FROM services WHERE id = ?', [appt.service_id]);
  if (!svc.length) throw new Error('Service not found.');
  const duration_min = svc[0].duration_min;
  const [h, m] = time.split(':').map(Number);
  const end = new Date(0, 0, 0, h, m + duration_min);
  const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}:00`;
  const startTime = `${time}:00`;

  let finalStaffId = Number(staffId);

  // 5. Check Availability
  if (finalStaffId === 0) {
    const [qualified] = await pool.query('SELECT staff_id FROM staff_services WHERE service_id = ?', [appt.service_id]);
    if (!qualified.length) throw new Error('No staff available for this service.');

    let foundStaff = null;
    for (const row of qualified) {
      const [overlap] = await pool.query(
        `SELECT id FROM appointments 
         WHERE appointment_date = ? AND staff_id = ? AND status NOT IN ('cancelled', 'no_show') AND id != ?
         AND (start_time < ? AND end_time > ?)`,
        [date, row.staff_id, apptId, endTime, startTime]
      );
      if (overlap.length === 0) { foundStaff = row.staff_id; break; }
    }
    if (!foundStaff) throw new Error('No stylists are available at this time.');
    finalStaffId = foundStaff;
  } else {
    const [overlap] = await pool.query(
      `SELECT id FROM appointments 
       WHERE appointment_date = ? AND staff_id = ? AND status NOT IN ('cancelled', 'no_show') AND id != ?
       AND (start_time < ? AND end_time > ?)`,
      [date, finalStaffId, apptId, endTime, startTime]
    );
    if (overlap.length > 0) throw new Error('Time slot already booked for the selected staff member.');
  }

  // 6. Update
  await pool.query(
    'UPDATE appointments SET appointment_date = ?, start_time = ?, end_time = ?, staff_id = ? WHERE id = ?',
    [date, startTime, endTime, finalStaffId, apptId]
  );

  // 7. Notification
  const [info] = await pool.query(`
    SELECT u.email, u.phone, u.name, s.name as service_name
    FROM appointments a
    JOIN customers c ON a.customer_id = c.id JOIN users u ON c.user_id = u.id
    JOIN services s ON a.service_id = s.id
    WHERE a.id = ?
  `, [apptId]);

  if (info.length) {
    const user = info[0];
    await sendNotification({
      to: { email: user.email, phone: user.phone },
      subject: 'Appointment Rescheduled - Parlour',
      message: `Hi ${user.name},\n\nYour appointment for ${user.service_name} has been rescheduled.\n\n📅 New Date: ${date}\n⏰ New Time: ${startTime}\n\nSee you then!`,
      type: 'all'
    });
  }

  return true;
};

// ── ADMIN RESCHEDULE ──────────────────────────────────────
const rescheduleAppointment = async (req, res, next) => {
  try {
    await performReschedule(req.params.id, req.body, true);
    res.json({ success: true, message: 'Appointment rescheduled successfully.' });
  } catch (err) { res.status(err.message.includes('booked') ? 409 : 400).json({ success: false, message: err.message }); }
};

// ── USER RESCHEDULE ───────────────────────────────────────
const rescheduleMyAppointment = async (req, res, next) => {
  try {
    await performReschedule(req.params.id, req.body, false, req.user.id);
    res.json({ success: true, message: 'Appointment rescheduled successfully.' });
  } catch (err) { res.status(err.message.includes('booked') ? 409 : 400).json({ success: false, message: err.message }); }
};

// ── DELETE APPOINTMENT ────────────────────────────────────
const deleteAppointment = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Appointment deleted.' });
  } catch (err) { next(err); }
};

// ── CANCEL MY APPOINTMENT ─────────────────────────────────
const cancelMyAppointment = async (req, res, next) => {
  try {
    const [cust] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (!cust.length) return res.status(403).json({ success: false, message: 'Not authorized.' });

    const [appt] = await pool.query('SELECT customer_id, status FROM appointments WHERE id = ?', [req.params.id]);
    if (!appt.length) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    if (appt[0].customer_id !== cust[0].id) {
      return res.status(403).json({ success: false, message: 'You do not own this appointment.' });
    }

    if (appt[0].status !== 'pending' && appt[0].status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Only pending or confirmed appointments can be cancelled.' });
    }

    await pool.query("UPDATE appointments SET status = 'cancelled' WHERE id = ?", [req.params.id]);

    // Notification
    const [info] = await pool.query(`
      SELECT u.email, u.phone, u.name, s.name as service_name, DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as date
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id JOIN users u ON c.user_id = u.id
      JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (info.length) {
      const user = info[0];
      await sendNotification({
        to: { email: user.email, phone: user.phone },
        subject: 'Appointment Cancelled - Parlour',
        message: `Hi ${user.name},\n\nYour appointment for ${user.service_name} on ${user.date} has been CANCELLED as requested.\n\nWe hope to see you again soon!`,
        type: 'all'
      });
    }

    res.json({ success: true, message: 'Appointment cancelled.' });
  } catch (err) { next(err); }
};

// ── GET MY APPOINTMENTS (customer) ────────────────────────
const getMyAppointments = async (req, res, next) => {
  try {
    const [cust] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (!cust.length) return res.json({ success: true, data: [] });

    const [rows] = await pool.query(
      `SELECT a.id, a.customer_id, a.staff_id, a.service_id, 
              DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
              a.start_time, a.status, a.total_price,
              u_s.name AS staff_name, s.name AS service_name, s.price
       FROM appointments a
       JOIN staff st ON a.staff_id = st.id JOIN users u_s ON st.user_id = u_s.id
       JOIN services s ON a.service_id = s.id
       WHERE a.customer_id = ?
       ORDER BY a.appointment_date DESC, a.start_time DESC`,
      [cust[0].id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = {
  getAllAppointments, getAppointmentById, getAvailableSlots, createAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
  rescheduleMyAppointment,
  deleteAppointment,
  getMyAppointments, cancelMyAppointment
};
