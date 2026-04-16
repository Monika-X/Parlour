const pool = require('../config/db');

// ── DASHBOARD SUMMARY ─────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [[{ total_appointments }]] = await pool.query('SELECT COUNT(*) AS total_appointments FROM appointments');
    const [[{ total_customers }]]    = await pool.query('SELECT COUNT(*) AS total_customers FROM customers');
    const [[{ total_staff }]]        = await pool.query('SELECT COUNT(*) AS total_staff FROM staff');
    const [[{ total_revenue }]]      = await pool.query(
      "SELECT COALESCE(SUM(total_price),0) AS total_revenue FROM appointments WHERE status = 'completed'"
    );

    // Today's appointment count
    const [[{ todays_appointments }]] = await pool.query(
      "SELECT COUNT(*) AS todays_appointments FROM appointments WHERE appointment_date = CURDATE()"
    );

    // Today's revenue
    const [[{ daily_revenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_price),0) AS daily_revenue FROM appointments
       WHERE status='completed' AND appointment_date = CURDATE()`
    );

    // This month revenue
    const [[{ monthly_revenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_price),0) AS monthly_revenue FROM appointments
       WHERE status='completed' AND MONTH(appointment_date)=MONTH(CURDATE()) AND YEAR(appointment_date)=YEAR(CURDATE())`
    );

    res.json({
      success: true,
      data: { total_appointments, total_customers, total_staff, total_revenue, todays_appointments, monthly_revenue, daily_revenue },
    });
  } catch (err) { next(err); }
};

// ── GET /api/dashboard – dedicated endpoint for frontend dashboard ──
const getDashboardFull = async (req, res, next) => {
  try {
    // Daily bookings count
    const [[{ dailyBookings }]] = await pool.query(
      "SELECT COUNT(*) AS dailyBookings FROM appointments WHERE appointment_date = CURDATE()"
    );

    // Daily revenue (completed only)
    const [[{ dailyRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_price),0) AS dailyRevenue FROM appointments
       WHERE status='completed' AND appointment_date = CURDATE()`
    );

    // Monthly revenue (completed only)
    const [[{ monthlyRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_price),0) AS monthlyRevenue FROM appointments
       WHERE status='completed'
         AND MONTH(appointment_date)=MONTH(CURDATE())
         AND YEAR(appointment_date)=YEAR(CURDATE())`
    );

    // Upcoming appointments today (not cancelled/completed)
    const [upcomingAppointments] = await pool.query(`
      SELECT
        a.id,
        u.name         AS customer_name,
        u.phone        AS customer_phone,
        s.name         AS service_name,
        su.name        AS staff_name,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
        a.start_time,
        a.total_price,
        a.status
      FROM appointments a
      LEFT JOIN customers c  ON a.customer_id  = c.id
      LEFT JOIN users     u  ON c.user_id       = u.id
      LEFT JOIN services  s  ON a.service_id    = s.id
      LEFT JOIN staff     st ON a.staff_id      = st.id
      LEFT JOIN users     su ON st.user_id      = su.id
      WHERE a.appointment_date = CURDATE()
        AND a.status NOT IN ('cancelled', 'no_show', 'completed')
      ORDER BY a.start_time ASC
    `);

    res.json({
      success: true,
      data: {
        dailyBookings:        Number(dailyBookings),
        dailyRevenue:         Number(dailyRevenue),
        monthlyRevenue:       Number(monthlyRevenue),
        upcomingAppointments,
      },
    });
  } catch (err) { next(err); }
};



// ── REVENUE TREND ────────────────────────
const getRevenueTrend = async (req, res, next) => {
  try {
    const { period } = req.query; // 'weekly', 'monthly', 'daily'
    let format = '%Y-%m'; // default monthly
    let interval = '6 MONTH';

    if (period === 'daily') {
      format = '%Y-%m-%d';
      interval = '14 DAY';
    } else if (period === 'weekly') {
      format = '%Y-%u'; // Year-Week
      interval = '12 WEEK';
    }

    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(appointment_date, '${format}') AS month,
             COALESCE(SUM(total_price), 0)    AS revenue,
             COUNT(*)                          AS appointments
      FROM appointments
      WHERE status = 'completed'
        AND appointment_date >= DATE_SUB(CURDATE(), INTERVAL ${interval.split(' ')[0]} ${interval.split(' ')[1]})
      GROUP BY month
      ORDER BY month ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// ── POPULAR SERVICES ──────────────────────────────────────
const getPopularServices = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.name, COUNT(a.id) AS bookings, COALESCE(SUM(a.total_price),0) AS revenue
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      GROUP BY s.id, s.name
      ORDER BY bookings DESC
      LIMIT 8
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// ── PEAK HOURS ───────────────────────────────────────────
const getPeakHours = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT HOUR(start_time) AS hour, COUNT(*) AS count
      FROM appointments
      WHERE status NOT IN ('cancelled', 'no_show')
      GROUP BY hour
      ORDER BY hour ASC
    `);
    
    // Format to 12-hour AM/PM
    const formatted = rows.map(r => {
      const h = r.hour;
      const ampm = h >= 12 ? 'PM' : 'AM';
      let hour12 = h % 12;
      if (hour12 === 0) hour12 = 12;
      return { time: `${hour12}:00 ${ampm}`, count: r.count };
    });

    res.json({ success: true, data: formatted });
  } catch (err) { next(err); }
};

// ── APPOINTMENT STATUS DISTRIBUTION ──────────────────────
const getStatusDistribution = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT status, COUNT(*) AS count FROM appointments GROUP BY status
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// ── TOP STAFF ─────────────────────────────────────────────
const getTopStaff = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.name, COUNT(a.id) AS appointments, COALESCE(SUM(a.total_price),0) AS revenue
      FROM appointments a
      JOIN staff st ON a.staff_id = st.id
      JOIN users  u  ON st.user_id = u.id
      WHERE a.status = 'completed'
      GROUP BY st.id, u.name
      ORDER BY appointments DESC
      LIMIT 5
    `);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { getDashboardStats, getDashboardFull, getRevenueTrend, getPopularServices, getPeakHours, getStatusDistribution, getTopStaff };
