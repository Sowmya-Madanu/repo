const express = require('express');
const { body } = require('express-validator');
const {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  toggleAvailability,
  checkAvailability,
  getCarsByLocation
} = require('../controllers/carController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const carValidation = [
  body('make')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Make must be between 2 and 30 characters'),
  body('model')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Model must be between 2 and 50 characters'),
  body('year')
    .isInt({ min: 1980, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be a valid year'),
  body('type')
    .isIn(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'truck', 'van'])
    .withMessage('Type must be a valid car type'),
  body('transmission')
    .isIn(['manual', 'automatic'])
    .withMessage('Transmission must be manual or automatic'),
  body('fuel')
    .isIn(['petrol', 'diesel', 'electric', 'hybrid'])
    .withMessage('Fuel must be a valid fuel type'),
  body('seats')
    .isInt({ min: 2, max: 8 })
    .withMessage('Seats must be between 2 and 8'),
  body('color')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Color must be between 3 and 20 characters'),
  body('licensePlate')
    .trim()
    .isLength({ min: 3, max: 15 })
    .withMessage('License plate must be between 3 and 15 characters'),
  body('pricePerDay')
    .isFloat({ min: 0 })
    .withMessage('Price per day must be a positive number'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('mileage')
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

const updateCarValidation = [
  body('make')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Make must be between 2 and 30 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Model must be between 2 and 50 characters'),
  body('year')
    .optional()
    .isInt({ min: 1980, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be a valid year'),
  body('type')
    .optional()
    .isIn(['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'truck', 'van'])
    .withMessage('Type must be a valid car type'),
  body('transmission')
    .optional()
    .isIn(['manual', 'automatic'])
    .withMessage('Transmission must be manual or automatic'),
  body('fuel')
    .optional()
    .isIn(['petrol', 'diesel', 'electric', 'hybrid'])
    .withMessage('Fuel must be a valid fuel type'),
  body('seats')
    .optional()
    .isInt({ min: 2, max: 8 })
    .withMessage('Seats must be between 2 and 8'),
  body('color')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Color must be between 3 and 20 characters'),
  body('licensePlate')
    .optional()
    .trim()
    .isLength({ min: 3, max: 15 })
    .withMessage('License plate must be between 3 and 15 characters'),
  body('pricePerDay')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price per day must be a positive number'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Mileage must be a positive number'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

const checkAvailabilityValidation = [
  body('pickupDate')
    .isISO8601()
    .withMessage('Pickup date must be a valid date'),
  body('returnDate')
    .isISO8601()
    .withMessage('Return date must be a valid date')
];

// Public routes
// @route   GET /api/cars
// @desc    Get all cars with filters
// @access  Public
router.get('/', optionalAuth, getCars);

// @route   GET /api/cars/locations/:location
// @desc    Get cars by location
// @access  Public
router.get('/locations/:location', getCarsByLocation);

// @route   GET /api/cars/:id
// @desc    Get single car
// @access  Public
router.get('/:id', getCar);

// @route   POST /api/cars/:id/check-availability
// @desc    Check car availability for specific dates
// @access  Public
router.post('/:id/check-availability', checkAvailabilityValidation, checkAvailability);

// Admin only routes
// @route   POST /api/cars
// @desc    Create new car
// @access  Private/Admin
router.post('/', authenticate, authorize('admin'), carValidation, createCar);

// @route   PUT /api/cars/:id
// @desc    Update car
// @access  Private/Admin
router.put('/:id', authenticate, authorize('admin'), updateCarValidation, updateCar);

// @route   DELETE /api/cars/:id
// @desc    Delete car
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), deleteCar);

// @route   PATCH /api/cars/:id/availability
// @desc    Toggle car availability
// @access  Private/Admin
router.patch('/:id/availability', authenticate, authorize('admin'), toggleAvailability);

module.exports = router;