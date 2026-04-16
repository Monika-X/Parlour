const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllServices, getServiceById, createService,
  updateService, deleteService, getCategories,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public routes
router.get('/',              getAllServices);
router.get('/categories',    getCategories);
router.get('/:id',           getServiceById);

// Admin only
router.post('/', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('duration_min').optional().isInt({ min: 5 }),
], validate, createService);

router.put('/:id',    protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;
