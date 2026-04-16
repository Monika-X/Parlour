const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getDashboardFull, getRevenueTrend,
  getPopularServices, getPeakHours, getStatusDistribution, getTopStaff,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard',       protect, authorize('admin'), getDashboardStats);
router.get('/dashboard-full',  protect, authorize('admin'), getDashboardFull);
router.get('/revenue',         protect, authorize('admin'), getRevenueTrend);
router.get('/services',        protect, authorize('admin'), getPopularServices);
router.get('/peak-hours',      protect, authorize('admin'), getPeakHours);
router.get('/status',          protect, authorize('admin'), getStatusDistribution);
router.get('/top-staff',       protect, authorize('admin'), getTopStaff);

module.exports = router;
