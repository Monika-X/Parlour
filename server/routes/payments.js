const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createPaymentIntent } = require('../controllers/paymentController');

router.post('/create-intent', protect, [
  body('service_id').isInt({ min: 1 }).withMessage('Valid service_id is required'),
], validate, createPaymentIntent);

module.exports = router;
