const pool = require('../config/db');

// ── GET ALL SERVICES ──────────────────────────────────────
const getAllServices = async (req, res, next) => {
  try {
    const { category_id, active } = req.query;
    let sql = `
      SELECT s.*, c.name AS category_name, c.icon AS category_icon
      FROM services s
      LEFT JOIN service_categories c ON s.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (category_id) { sql += ' AND s.category_id = ?'; params.push(category_id); }
    if (active !== undefined) { sql += ' AND s.is_active = ?'; params.push(Number(active)); }
    sql += ' ORDER BY c.name, s.name';

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) { next(err); }
};

// ── GET SINGLE SERVICE ────────────────────────────────────
const getServiceById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, c.name AS category_name
       FROM services s
       LEFT JOIN service_categories c ON s.category_id = c.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

// ── CREATE SERVICE ────────────────────────────────────────
const createService = async (req, res, next) => {
  try {
    const { category_id, name, description, price, duration_min, image } = req.body;

    // 1. Basic validation
    if (!name || name.trim() === '') return res.status(400).json({ success: false, message: 'Service name is required.' });
    if (price === undefined || price === null || isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number.' });
    }
    if (duration_min === undefined || duration_min === null || !Number.isInteger(Number(duration_min)) || Number(duration_min) <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be a positive integer.' });
    }

    // 2. Check for duplicate name (case-insensitive)
    const [existing] = await pool.query('SELECT id FROM services WHERE LOWER(name) = LOWER(?)', [name.trim()]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Service name already exists.' });

    const [result] = await pool.query(
      'INSERT INTO services (category_id, name, description, price, duration_min, image) VALUES (?, ?, ?, ?, ?, ?)',
      [category_id, name.trim(), description, price, duration_min, image || null]
    );
    res.status(201).json({ success: true, message: 'Service created.', id: result.insertId });
  } catch (err) { next(err); }
};

// ── UPDATE SERVICE ────────────────────────────────────────
const updateService = async (req, res, next) => {
  try {
    const { category_id, name, description, price, duration_min, image, is_active } = req.body;
    const serviceId = req.params.id;

    // 1. Basic validation
    if (!name || name.trim() === '') return res.status(400).json({ success: false, message: 'Service name is required.' });
    if (price === undefined || price === null || isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number.' });
    }
    if (duration_min === undefined || duration_min === null || !Number.isInteger(Number(duration_min)) || Number(duration_min) <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be a positive integer.' });
    }

    // 2. Check for duplicate name (excluding self)
    const [existing] = await pool.query('SELECT id FROM services WHERE LOWER(name) = LOWER(?) AND id != ?', [name.trim(), serviceId]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Service name already exists.' });

    await pool.query(
      'UPDATE services SET category_id=?, name=?, description=?, price=?, duration_min=?, image=?, is_active=? WHERE id=?',
      [category_id, name.trim(), description, price, duration_min, image, is_active ?? 1, serviceId]
    );
    res.json({ success: true, message: 'Service updated.' });
  } catch (err) { next(err); }
};

// ── DELETE SERVICE ────────────────────────────────────────
const deleteService = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Service deleted.' });
  } catch (err) { next(err); }
};

// ── GET ALL CATEGORIES ────────────────────────────────────
const getCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM service_categories ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService, getCategories };
