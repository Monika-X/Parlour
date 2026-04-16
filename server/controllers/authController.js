const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── REGISTER ─────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check existing
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    // SECURITY: Force 'customer' role — admin accounts must be created manually in the DB
    const safeRole = 'customer';

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, phone || null, safeRole]
    );

    const userId = result.insertId;

    // Auto-create customer profile
    if (safeRole === 'customer') {
      await pool.query('INSERT IGNORE INTO customers (user_id) VALUES (?)', [userId]);
    }

    const token = jwt.sign(
      { id: userId, name, email, role: safeRole },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: { id: userId, name, email, role: safeRole, phone },
    });
  } catch (err) { next(err); }
};

// ── LOGIN ─────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    if (!rows.length) {
      console.warn(`[Login Failed] Email not found or inactive: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.warn(`[Login Failed] Invalid password for: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    console.log(`[Login Success] User: ${email} | Role: ${user.role}`);

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) { next(err); }
};

// ── GET PROFILE ───────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar, u.created_at,
              c.date_of_birth, c.gender, c.address, c.notes
       FROM users u
       LEFT JOIN customers c ON u.id = c.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

// ── UPDATE PROFILE ────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, date_of_birth, gender, address, notes } = req.body;
    
    // Update basic user info
    await pool.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, req.user.id]);
    
    // Auto-create or Update customer profile
    if (req.user.role === 'customer') {
      const [custRows] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (!custRows.length) {
        await pool.query(
          'INSERT INTO customers (user_id, date_of_birth, gender, address, notes) VALUES (?, ?, ?, ?, ?)',
          [req.user.id, date_of_birth || null, gender || null, address || null, notes || null]
        );
      } else {
        await pool.query(
          'UPDATE customers SET date_of_birth = ?, gender = ?, address = ?, notes = ? WHERE user_id = ?',
          [date_of_birth || null, gender || null, address || null, notes || null, req.user.id]
        );
      }
    }
    
    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) { next(err); }
};

module.exports = { register, login, getProfile, updateProfile };
