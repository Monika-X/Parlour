const express = require('express');
const router = express.Router();
const { sendReminders } = require('../controllers/reminderController');
const { protect, authorize } = require('../middleware/auth');

// This endpoint can be triggered manually or via a CRON job
router.post('/send-reminders', protect, authorize('admin'), sendReminders);

module.exports = router;
