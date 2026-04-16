const express = require('express');
const router = express.Router();
const {
  getAllCustomers, getCustomerById, updateCustomer, deleteCustomer,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',    protect, authorize('admin'),         getAllCustomers);
router.get('/:id', protect, authorize('admin','staff'), getCustomerById);
router.put('/:id', protect, authorize('admin'),         updateCustomer);
router.delete('/:id', protect, authorize('admin'),      deleteCustomer);

module.exports = router;
