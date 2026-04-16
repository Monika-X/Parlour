const express = require('express');
const router = express.Router();
const {
  submitReview, getApprovedReviews, getAllReviews, updateReviewStatus, deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public route for homepage
router.get('/approved', getApprovedReviews);

// User review submission (protected)
router.post('/', protect, submitReview);

// Admin routes (fully protected)
router.get('/',      protect, authorize('admin'), getAllReviews);
router.patch('/:id', protect, authorize('admin'), updateReviewStatus);
router.delete('/:id',protect, authorize('admin'), deleteReview);

module.exports = router;
