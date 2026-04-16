const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

const {
  getAllStaff,
  getStaffById,
  getStaffSchedule,
  updateStaffSchedule,
  createStaff,
  updateStaff,
  deleteStaff
} = require("../controllers/staffController");

// ── PUBLIC (needed by booking UI) ─────────────────────────
router.get("/", getAllStaff);
router.get("/by-service", getAllStaff);
router.get("/:id", getStaffById);
router.get("/:id/schedule", getStaffSchedule);

// ── ADMIN ONLY ────────────────────────────────────────────
router.put("/:id/schedule", protect, authorize('admin'), updateStaffSchedule);
router.post("/", protect, authorize('admin'), createStaff);
router.put("/:id", protect, authorize('admin'), updateStaff);
router.delete("/:id", protect, authorize('admin'), deleteStaff);

module.exports = router;