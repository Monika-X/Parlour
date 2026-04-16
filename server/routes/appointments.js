const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllAppointments, getAppointmentById, getAvailableSlots, createAppointment,
  updateAppointmentStatus, rescheduleAppointment, rescheduleMyAppointment, deleteAppointment, getMyAppointments, cancelMyAppointment
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Customer – own appointments
router.get('/my', protect, getMyAppointments);
router.patch('/my/:id/cancel', protect, cancelMyAppointment);
router.put('/my/:id/reschedule', protect, [
  body('date').isDate().withMessage('Valid date required (YYYY-MM-DD)'),
  body('time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Valid time required (HH:MM or HH:MM:SS)'),
  body('staffId').isInt().withMessage('Valid staffId is required')
], validate, rescheduleMyAppointment);

// Admin / Staff – all appointments
router.get('/', protect, authorize('admin', 'staff'), getAllAppointments);

// Get available slots (public or auth)
router.get('/available', getAvailableSlots);

// Create (any logged-in user)
router.post('/',
  protect,   // ✅ FIRST AUTH
  [
    body('staff_id').isInt().withMessage('staff_id required'),
    body('service_id').isInt().withMessage('service_id required'),
    body('appointment_date').isDate().withMessage('Valid date required (YYYY-MM-DD)'),
    body('start_time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Valid time required (HH:MM or HH:MM:SS)'),
  ],
  validate,
  createAppointment
);

// Get single
router.get('/:id', protect, getAppointmentById);

// Update status
router.patch('/:id/status', protect, authorize('admin', 'staff'), [
  body('status').notEmpty().withMessage('Status is required'),
], validate, updateAppointmentStatus);

// Reschedule
router.put('/:id/reschedule', protect, authorize('admin', 'staff'), [
  body('date').isDate().withMessage('Valid date required (YYYY-MM-DD)'),
  body('time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Valid time required (HH:MM or HH:MM:SS)'),
  body('staffId').isInt().withMessage('Valid staffId is required')
], validate, rescheduleAppointment);

// Delete
router.delete('/:id', protect, authorize('admin'), deleteAppointment);

module.exports = router;
