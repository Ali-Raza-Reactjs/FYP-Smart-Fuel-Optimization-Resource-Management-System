const mongoose = require('mongoose');

const FuelRecordSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  driver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a date for the fuel record'],
    default: Date.now
  },
  liters: {
    type: Number,
    required: [true, 'Please add fuel volume in liters'],
    min: [0.1, 'Liters must be greater than 0']
  },
  cost: {
    type: Number,
    required: [true, 'Please add the total fuel cost'],
    min: [0, 'Cost cannot be negative']
  },
  odometerReading: {
    type: Number,
    required: [true, 'Please add the odometer reading']
  },
  receiptImage: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FuelRecord', FuelRecordSchema);
