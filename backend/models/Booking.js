const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car is required']
  },
  pickupDate: {
    type: Date,
    required: [true, 'Pickup date is required']
  },
  returnDate: {
    type: Date,
    required: [true, 'Return date is required']
  },
  pickupLocation: {
    type: String,
    required: [true, 'Pickup location is required'],
    trim: true
  },
  returnLocation: {
    type: String,
    required: [true, 'Return location is required'],
    trim: true
  },
  totalDays: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'online'],
    default: 'card'
  },
  notes: {
    type: String,
    trim: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  confirmedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Validate that return date is after pickup date
bookingSchema.pre('save', function(next) {
  if (this.returnDate <= this.pickupDate) {
    return next(new Error('Return date must be after pickup date'));
  }
  
  // Calculate total days if not provided
  if (!this.totalDays) {
    const timeDiff = this.returnDate.getTime() - this.pickupDate.getTime();
    this.totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  
  // Calculate total amount if not provided
  if (!this.totalAmount && this.pricePerDay) {
    this.totalAmount = this.totalDays * this.pricePerDay;
  }
  
  next();
});

// Index for better query performance
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ car: 1, pickupDate: 1, returnDate: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);