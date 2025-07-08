const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      carId,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation,
      notes
    } = req.body;

    // Check if car exists and is available
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    if (!car.isAvailable || !car.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Car is not available for booking'
      });
    }

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    // Validate dates
    if (returnD <= pickup) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be after pickup date'
      });
    }

    if (pickup < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Pickup date cannot be in the past'
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        {
          pickupDate: { $lte: returnD },
          returnDate: { $gte: pickup }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Car is not available for the selected dates'
      });
    }

    // Calculate total days and amount
    const timeDiff = returnD.getTime() - pickup.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalAmount = totalDays * car.pricePerDay;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      car: carId,
      pickupDate: pickup,
      returnDate: returnD,
      pickupLocation,
      returnLocation,
      totalDays,
      pricePerDay: car.pricePerDay,
      totalAmount,
      notes
    });

    // Populate car and user details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('car', 'make model year type licensePlate images')
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .populate('car', 'make model year type licensePlate images location pricePerDay')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, userId, carId } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (userId) {
      query.user = userId;
    }

    if (carId) {
      query.car = carId;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .populate('car', 'make model year type licensePlate location pricePerDay')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car')
      .populate('user', 'name email phone address drivingLicense');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update status with timestamp
    booking.status = status;

    switch (status) {
      case 'confirmed':
        booking.confirmedAt = new Date();
        break;
      case 'completed':
        booking.completedAt = new Date();
        break;
      case 'cancelled':
        booking.cancelledAt = new Date();
        break;
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('car', 'make model year type licensePlate')
      .populate('user', 'name email phone');

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled'
      });
    }

    // Check if it's too late to cancel (within 24 hours of pickup)
    const now = new Date();
    const pickupTime = new Date(booking.pickupDate);
    const timeDiff = pickupTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 24 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking within 24 hours of pickup'
      });
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('car', 'make model year type licensePlate')
      .populate('user', 'name email phone');

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PATCH /api/bookings/:id/payment
// @access  Private/Admin
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    const validPaymentStatuses = ['pending', 'paid', 'refunded', 'failed'];

    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.paymentStatus = paymentStatus;
    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking statistics (Admin)
// @route   GET /api/bookings/stats
// @access  Private/Admin
const getBookingStats = async (req, res, next) => {
  try {
    // Get total bookings by status
    const statusStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Get monthly bookings for current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get total revenue
    const revenueStats = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageBookingValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        statusStats,
        monthlyStats,
        revenue: revenueStats[0] || { totalRevenue: 0, averageBookingValue: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  updatePaymentStatus,
  getBookingStats
};