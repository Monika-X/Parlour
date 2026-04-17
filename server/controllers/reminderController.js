const pool = require('../config/db');
const { sendNotification } = require('../utils/notificationService');

/**
 * ── SEND APPOINTMENT REMINDERS ─────────────────────────────
 * Finds all 'confirmed' or 'pending' appointments for tomorrow
 * and sends an automated reminder.
 */
const sendReminders = async (req, res, next) => {
  try {
    // Get tomorrow's date in YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Fetch appointments for tomorrow
    const [reminders] = await pool.query(`
      SELECT a.id, a.start_time, a.appointment_date,
             u.email, u.phone, u.name as customer_name,
             s.name as service_name
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN services s ON a.service_id = s.id
      WHERE DATE(a.appointment_date) = ?
      AND a.status IN ('pending', 'confirmed')
    `, [tomorrowStr]);

    let sentCount = 0;
    for (const appt of reminders) {
      await sendNotification({
        to: { email: appt.email, phone: appt.phone },
        subject: 'Friendly Reminder: Your Appointment Tomorrow! - Parlour',
        message: `Hi ${appt.customer_name},\n\nJust a friendly reminder of your appointment at Parlour Salon & Spa tomorrow!\n\nService: ${appt.service_name}\nTime: ${appt.start_time}\n\nWe can't wait to see you!`,
        type: 'all'
      });
      sentCount++;
    }

    if (res) {
      return res.json({ 
        success: true, 
        message: `Successfully processed ${reminders.length} reminders.`,
        sent: sentCount
      });
    } else {
      console.log(`[CRON] Successfully processed ${reminders.length} reminders.`);
    }
  } catch (err) {
    if (res) return next(err);
    console.error('Reminder Job Error:', err.message);
  }
};

module.exports = { sendReminders };
