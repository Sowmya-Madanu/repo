const { validationResult } = require('express-validator');
const Car = require('../models/Car');
const Booking = require('../models/Booking');

// @desc    Get all cars with filters
// @route   GET /api/cars
// @access  Public
const getCars = async (req, res, next) => {
  try {
    const {
      location,
      type,
      minPrice,
      maxPrice,
      transmission,
      fuel,
      seats,
      pickupDate,
      returnDate,
      page = 1,
      limit = 10,
      sort = 'createdAt'
    } = req.query;

    // Build query
    let query = { isActive: true };

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    if (transmission) {
      query.transmission = transmission;
    }

    if (fuel) {
      query.fuel = fuel;
    }

    if (seats) {
      query.seats = parseInt(seats);
    }

    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
    }

    // If dates provided, check availability
    if (pickupDate && returnDate) {
      const pickup = new Date(pickupDate);
      const returnD = new Date(returnDate);

      // Find cars that are booked during the requested period
      const bookedCarIds = await Booking.find({
        status: { $in: ['confirmed', 'active'] },
        $or: [
          {
            pickupDate: { $lte: returnD },
            returnDate: { $gte: pickup }
          }
        ]
      }).distinct('car');

      // Exclude booked cars
      query._id = { $nin: bookedCarIds };
    } else {
      // If no dates, only show available cars
      query.isAvailable = true;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const cars = await Car.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Car.countDocuments(query);

    res.json({
      success: true,
      count: cars.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      cars
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
const getCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.json({
      success: true,
      car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new car
// @route   POST /api/cars
// @access  Private/Admin
const createCar = async (req, res, next) => {
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

    const car = await Car.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private/Admin
const updateCar = async (req, res, next) => {
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

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.json({
      success: true,
      message: 'Car updated successfully',
      car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Check if car has active bookings
    const activeBookings = await Booking.find({
      car: req.params.id,
      status: { $in: ['confirmed', 'active'] }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete car with active bookings'
      });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Car deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle car availability
// @route   PATCH /api/cars/:id/availability
// @access  Private/Admin
const toggleAvailability = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    car.isAvailable = !car.isAvailable;
    await car.save();

    res.json({
      success: true,
      message: `Car ${car.isAvailable ? 'made available' : 'made unavailable'}`,
      car
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get car availability for specific dates
// @route   POST /api/cars/:id/check-availability
// @access  Public
const checkAvailability = async (req, res, next) => {
  try {
    const { pickupDate, returnDate } = req.body;
    const carId = req.params.id;

    if (!pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and return dates are required'
      });
    }

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    if (returnD <= pickup) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be after pickup date'
      });
    }

    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
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

    const isAvailable = !conflictingBooking && car.isAvailable && car.isActive;

    res.json({
      success: true,
      available: isAvailable,
      car: {
        id: car._id,
        make: car.make,
        model: car.model,
        pricePerDay: car.pricePerDay
      },
      ...(conflictingBooking && {
        message: 'Car is not available for the selected dates'
      })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cars by location
// @route   GET /api/cars/locations/:location
// @access  Public
const getCarsByLocation = async (req, res, next) => {
  try {
    const { location } = req.params;
    const { pickupDate, returnDate } = req.query;

    let query = {
      location: { $regex: location, $options: 'i' },
      isActive: true,
      isAvailable: true
    };

    // If dates provided, check availability
    if (pickupDate && returnDate) {
      const pickup = new Date(pickupDate);
      const returnD = new Date(returnDate);

      const bookedCarIds = await Booking.find({
        status: { $in: ['confirmed', 'active'] },
        $or: [
          {
            pickupDate: { $lte: returnD },
            returnDate: { $gte: pickup }
          }
        ]
      }).distinct('car');

      query._id = { $nin: bookedCarIds };
    }

    const cars = await Car.find(query).sort('pricePerDay');

    res.json({
      success: true,
      count: cars.length,
      cars
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  toggleAvailability,
  checkAvailability,
  getCarsByLocation
};