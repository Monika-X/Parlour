const pool = require('../config/db');

// ── GET ALL CUSTOMERS ─────────────────────────────────────
const getAllCustomers = async (req, res, next) => {
  console.log("CRM QUERY LOADED");
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.*, 
        u.name, 
        u.email, 
        u.phone, 
        u.is_active, 
        u.created_at AS joined_at,
        COUNT(a.id) AS totalBookings,
        DATE_FORMAT(MAX(a.appointment_date), '%Y-%m-%d') AS lastVisit
      FROM customers c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN appointments a ON a.customer_id = c.id
      GROUP BY c.id, u.id
      ORDER BY u.name
    `);

    // Add CRM logic (VIP status)
    const enhancedData = rows.map(customer => ({
      ...customer,
      totalBookings: Number(customer.totalBookings),
      isVIP: Number(customer.totalBookings) >= 3
    }));

    res.json({ success: true, count: enhancedData.length, data: enhancedData });
  } catch (err) { next(err); }
};

// ── GET SINGLE CUSTOMER ───────────────────────────────────
const getCustomerById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.name, u.email, u.phone FROM customers c JOIN users u ON c.user_id = u.id WHERE c.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Customer not found.' });

    // recent appointments
    const [appts] = await pool.query(
      `SELECT a.*, s.name AS service_name, u_s.name AS staff_name
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       JOIN staff st ON a.staff_id = st.id JOIN users u_s ON st.user_id = u_s.id
       WHERE a.customer_id = ? ORDER BY a.appointment_date DESC LIMIT 10`,
      [req.params.id]
    );
    rows[0].recent_appointments = appts;
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

// ── UPDATE CUSTOMER ───────────────────────────────────────
const updateCustomer = async (req, res, next) => {
  try {
    const { gender, date_of_birth, address, notes } = req.body;
    await pool.query(
      'UPDATE customers SET gender=?, date_of_birth=?, address=?, notes=? WHERE id=?',
      [gender, date_of_birth, address, notes, req.params.id]
    );
    res.json({ success: true, message: 'Customer profile updated.' });
  } catch (err) { next(err); }
};

// ── DELETE CUSTOMER ───────────────────────────────────────
const deleteCustomer = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT user_id FROM customers WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Customer not found.' });
    await pool.query('DELETE FROM users WHERE id = ?', [rows[0].user_id]);
    res.json({ success: true, message: 'Customer deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getAllCustomers, getCustomerById, updateCustomer, deleteCustomer };
