const pool = require("../config/db");

// ── GET ALL STAFF (WITH SERVICE FILTER) ───────────────────
const getAllStaff = async (req, res, next) => {
  try {
    const { service_id } = req.query;

    console.log("[STAFF DEBUG] Received service_id:", service_id, "| type:", typeof service_id, "| isValid:", service_id && !isNaN(service_id));

    let params = [];

    let query = `
      SELECT DISTINCT st.*, u.name, u.email, u.phone, u.avatar, u.is_active
      FROM staff st
      JOIN users u ON st.user_id = u.id
    `;

    if (service_id && !isNaN(service_id)) {
      query += `
        JOIN staff_services ss ON st.id = ss.staff_id
        WHERE ss.service_id = ?
      `;
      params.push(Number(service_id));
    }

    query += ` ORDER BY u.name`;

    const [rows] = await pool.query(query, params);

    console.log("[STAFF DEBUG] Staff found:", rows.length, "for service_id:", service_id || "ALL");

    for (const member of rows) {
      const [svcs] = await pool.query(
        `SELECT s.id, s.name 
         FROM staff_services ss 
         JOIN services s ON ss.service_id = s.id 
         WHERE ss.staff_id = ?`,
        [member.id]
      );
      member.services = svcs;

      const [schedule] = await pool.query(
        `SELECT * FROM staff_schedules WHERE staff_id = ? ORDER BY day_of_week`,
        [member.id]
      );
      member.schedule = schedule;
    }

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

// ── GET STAFF BY ID ───────────────────────────────────────
const getStaffById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT st.*, u.name, u.email, u.phone, u.avatar 
       FROM staff st 
       JOIN users u ON st.user_id = u.id 
       WHERE st.id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Staff not found."
      });
    }

    const [svcs] = await pool.query(
      `SELECT s.id, s.name 
       FROM staff_services ss 
       JOIN services s ON ss.service_id = s.id 
       WHERE ss.staff_id = ?`,
      [req.params.id]
    );

    rows[0].services = svcs;

    const [schedule] = await pool.query(
      `SELECT * FROM staff_schedules 
       WHERE staff_id = ? 
       ORDER BY day_of_week`,
      [req.params.id]
    );

    rows[0].schedule = schedule;

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── STAFF SCHEDULE ────────────────────────────────────────
const getStaffSchedule = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM staff_schedules 
       WHERE staff_id = ? 
       ORDER BY day_of_week`,
      [req.params.id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE SCHEDULE ────────────────────────────────────────
const updateStaffSchedule = async (req, res, next) => {
  try {
    const { schedule } = req.body;

    if (!Array.isArray(schedule)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule data"
      });
    }

    for (const day of schedule) {
      await pool.query(
        `INSERT INTO staff_schedules 
         (staff_id, day_of_week, start_time, end_time, is_off)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
         start_time=VALUES(start_time),
         end_time=VALUES(end_time),
         is_off=VALUES(is_off)`,
        [
          req.params.id,
          day.day_of_week,
          day.start_time,
          day.end_time,
          day.is_off ? 1 : 0
        ]
      );
    }

    res.json({
      success: true,
      message: "Schedule updated"
    });
  } catch (err) {
    next(err);
  }
};

// ── CREATE STAFF ──────────────────────────────────────────
const createStaff = async (req, res, next) => {
  try {
    const bcrypt = require("bcryptjs");

    const {
      name,
      email,
      specialization,
      experience_yrs,
      bio,
      service_ids,
      password
    } = req.body;

    let [userRows] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    let user_id;

    if (!userRows.length) {
      const pass = password || "Staff@123";
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(pass, salt);

      const [userResult] = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashed, "staff"]
      );

      user_id = userResult.insertId;
    } else {
      user_id = userRows[0].id;

      await pool.query(
        "UPDATE users SET role='staff' WHERE id=?",
        [user_id]
      );
    }

    const [result] = await pool.query(
      "INSERT INTO staff (user_id, specialization, experience_yrs, bio) VALUES (?, ?, ?, ?)",
      [user_id, specialization, experience_yrs || 0, bio]
    );

    const staffId = result.insertId;

    if (service_ids && service_ids.length) {
      const vals = service_ids.map(id => [staffId, id]);

      await pool.query(
        "INSERT INTO staff_services (staff_id, service_id) VALUES ?",
        [vals]
      );
    }

    for (let i = 0; i < 7; i++) {
      await pool.query(
        "INSERT IGNORE INTO staff_schedules (staff_id, day_of_week, start_time, end_time, is_off) VALUES (?, ?, ?, ?, ?)",
        [staffId, i, "09:00:00", "18:00:00", 0]
      );
    }

    res.status(201).json({
      success: true,
      message: "Staff created",
      id: staffId
    });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE STAFF ──────────────────────────────────────────
const updateStaff = async (req, res, next) => {
  try {
    const {
      name,
      specialization,
      experience_yrs,
      bio,
      is_available,
      service_ids
    } = req.body;

    await pool.query(
      `UPDATE staff 
       SET specialization=?, experience_yrs=?, bio=?, is_available=? 
       WHERE id=?`,
      [
        specialization,
        experience_yrs,
        bio,
        is_available ?? 1,
        req.params.id
      ]
    );

    if (name) {
      await pool.query(
        `UPDATE users u 
         JOIN staff s ON s.user_id = u.id 
         SET u.name=? 
         WHERE s.id=?`,
        [name, req.params.id]
      );
    }

    if (service_ids !== undefined) {
      await pool.query(
        "DELETE FROM staff_services WHERE staff_id=?",
        [req.params.id]
      );

      if (service_ids.length) {
        const vals = service_ids.map(id => [req.params.id, id]);

        await pool.query(
          "INSERT INTO staff_services (staff_id, service_id) VALUES ?",
          [vals]
        );
      }
    }

    res.json({
      success: true,
      message: "Staff updated"
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE STAFF ──────────────────────────────────────────
const deleteStaff = async (req, res, next) => {
  try {
    await pool.query(
      "DELETE FROM staff WHERE id=?",
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Staff deleted"
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  getStaffSchedule,
  updateStaffSchedule,
  createStaff,
  updateStaff,
  deleteStaff
};