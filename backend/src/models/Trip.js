const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
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
  startLocation: {
    type: String,
    required: [true, 'Please add a start location']
  },
  startCoordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  endLocation: {
    type: String,
    required: [true, 'Please add an end location']
  },
  endCoordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  routeGeometry: {
    type: String
  },
  startTime: {
    type: Date,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: Date
  },
  distance: {
    type: Number,
    required: [true, 'Please add trip distance in kilometers']
  },
  estimatedFuel: {
    type: Number, // In Liters
    required: [true, 'Estimated fuel is required']
  },
  estimatedDuration: {
    type: Number // In Minutes
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Transit', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trip', TripSchema);
