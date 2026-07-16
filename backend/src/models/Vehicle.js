const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  licensePlate: {
    type: String,
    required: [true, 'Please add a license plate'],
    unique: true,
    trim: true,
    uppercase: true
  },
  make: {
    type: String,
    required: [true, 'Please add vehicle make (e.g. Toyota)']
  },
  model: {
    type: String,
    required: [true, 'Please add vehicle model (e.g. Corolla)']
  },
  year: {
    type: Number,
    required: [true, 'Please add vehicle year']
  },
  fuelCapacity: {
    type: Number,
    required: [true, 'Please add fuel capacity in liters']
  },
  fuelEfficiency: {
    type: Number,
    default: 8 // default 8 Liters / 100km
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'EV', 'Hybrid'],
    required: [true, 'Please add fuel type']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance'],
    default: 'Active'
  },
  currentOdometer: {
    type: Number,
    default: 0
  },
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization',
    required: true
  },
  driver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null // Can be unassigned initially
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
