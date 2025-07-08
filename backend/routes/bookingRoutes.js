const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  updatePaymentStatus,
  getBookingStats
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createBookingValidation = [
  body('carId')
    .isMongoId()
    .withMessage('Car ID must be a valid MongoDB ObjectId'),
  body('pickupDate')
    .isISO8601()
    .withMessage('Pickup date must be a valid date'),
  body('returnDate')
    .isISO8601()
    .withMessage('Return date must be a valid date'),
  body('pickupLocation')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Pickup location must be between 2 and 100 characters'),
  body('returnLocation')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Return location must be between 2 and 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled'])
    .withMessage('Status must be a valid booking status')
];

const cancelBookingValidation = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason must be less than 200 characters')
];

const updatePaymentValidation = [
  body('paymentStatus')
    .isIn(['pending', 'paid', 'refunded', 'failed'])
    .withMessage('Payment status must be valid'),
  body('paymentMethod')
    .optional()
    .isIn(['card', 'cash', 'online'])
    .withMessage('Payment method must be valid')
];

// User routes
// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', authenticate, createBookingValidation, createBooking);

// @route   GET /api/bookings/my-bookings
// @desc    Get user's bookings
// @access  Private
router.get('/my-bookings', authenticate, getMyBookings);

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', authenticate, getBooking);

// @route   PATCH /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.patch('/:id/cancel', authenticate, cancelBookingValidation, cancelBooking);

// Admin routes
// @route   GET /api/bookings
// @desc    Get all bookings (Admin)
// @access  Private/Admin
router.get('/', authenticate, authorize('admin'), getAllBookings);

// @route   GET /api/bookings/stats
// @desc    Get booking statistics (Admin)
// @access  Private/Admin
router.get('/stats', authenticate, authorize('admin'), getBookingStats);

// @route   PATCH /api/bookings/:id/status
// @desc    Update booking status (Admin)
// @access  Private/Admin
router.patch('/:id/status', authenticate, authorize('admin'), updateStatusValidation, updateBookingStatus);

// @route   PATCH /api/bookings/:id/payment
// @desc    Update payment status (Admin)
// @access  Private/Admin
router.patch('/:id/payment', authenticate, authorize('admin'), updatePaymentValidation, updatePaymentStatus);

module.exports = router;