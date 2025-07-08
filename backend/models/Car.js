const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: [true, 'Car make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Manufacturing year is required'],
    min: 1980,
    max: new Date().getFullYear() + 1
  },
  type: {
    type: String,
    required: [true, 'Car type is required'],
    enum: ['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'truck', 'van']
  },
  transmission: {
    type: String,
    required: [true, 'Transmission type is required'],
    enum: ['manual', 'automatic']
  },
  fuel: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: ['petrol', 'diesel', 'electric', 'hybrid']
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: 2,
    max: 8
  },
  color: {
    type: String,
    required: [true, 'Car color is required'],
    trim: true
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: 0
  },
  location: {
    type: String,
    required: [true, 'Car location is required'],
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    trim: true
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: 0
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better search performance
carSchema.index({ location: 1, isAvailable: 1, isActive: 1 });
carSchema.index({ type: 1, pricePerDay: 1 });

module.exports = mongoose.model('Car', carSchema);