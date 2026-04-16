const pool = require('../config/db');

// ── SUBMIT A REVIEW ───────────────────────────────────────
const submitReview = async (req, res, next) => {
  try {
    const { rating, comment, appointment_id } = req.body;

    // 1. Validate rating (1–5 only)
    const normalizedRating = parseInt(rating);
    if (isNaN(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.'
      });
    }

    // 2. Get customer_id from logged-in user
    const [custRows] = await pool.query(
      'SELECT id FROM customers WHERE user_id = ?',
      [req.user.id]
    );

    if (!custRows.length) {
      return res.status(401).json({
        success: false,
        message: 'Customer not found for this user.'
      });
    }

    const customer_id = custRows[0].id;

    // 3. Resolve staff_id from appointment (optional)
    let staff_id = null;

    if (appointment_id) {
      const [apptRows] = await pool.query(
        'SELECT staff_id FROM appointments WHERE id = ?',
        [appointment_id]
      );

      if (apptRows.length > 0) {
        staff_id = apptRows[0].staff_id;
      }
    }

    // 4. Insert review
    const [result] = await pool.query(
      `INSERT INTO reviews 
        (customer_id, staff_id, rating, comment, appointment_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        customer_id,
        staff_id,
        normalizedRating,
        comment || null,
        appointment_id || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully (waiting for approval).',
      id: result.insertId
    });

  } catch (err) {
    next(err);
  }
};

// ── GET APPROVED REVIEWS ───────────────────────────────────
const getApprovedReviews = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, u.name, u.email
      FROM reviews r
      JOIN customers c ON r.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE r.is_approved = 1
      ORDER BY r.created_at DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// ── ADMIN: GET ALL REVIEWS ────────────────────────────────
const getAllReviews = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, u.name, u.email
      FROM reviews r
      JOIN customers c ON r.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// ── ADMIN: APPROVE / REJECT REVIEW ─────────────────────────
const updateReviewStatus = async (req, res, next) => {
  try {
    const isApproved =
      req.body.is_approved === true ||
      req.body.is_approved === 1 ||
      req.body.is_approved === "1" ||
      req.body.is_approved === "true";

    await pool.query(
      'UPDATE reviews SET is_approved = ? WHERE id = ?',
      [isApproved ? 1 : 0, req.params.id]
    );

    res.json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'unapproved'}.`
    });
  } catch (err) {
    next(err);
  }
};

// ── ADMIN: DELETE REVIEW ──────────────────────────────────
const deleteReview = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Review deleted.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitReview,
  getApprovedReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview
};