const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  vehicleName: {
    type: String,
    required: [true, 'Please add a vehicle name']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Please add a registration number'],
    unique: true,
    trim: true,
    uppercase: true
  },
  manufacturer: {
    type: String,
    required: [true, 'Please add a manufacturer/company']
  },
  modelYear: {
    type: Number,
    required: [true, 'Please add a model year']
  },
  fuelCapacity: {
    type: Number,
    required: [true, 'Please add fuel capacity in liters']
  },
  fuelEfficiency: {
    type: Number,
    required: [true, 'Please add fuel efficiency in km/liter']
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric'],
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
    required: false
  },
  driver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please add an owner']
  },
  // Backward compatibility fields for other features
  licensePlate: {
    type: String,
    trim: true,
    uppercase: true
  },
  make: {
    type: String
  },
  model: {
    type: String
  },
  year: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-sync fields for compatibility
VehicleSchema.pre('validate', function(next) {
  if (this.registrationNumber) this.licensePlate = this.registrationNumber;
  if (this.manufacturer) this.make = this.manufacturer;
  if (this.vehicleName) this.model = this.vehicleName;
  if (this.modelYear) this.year = this.modelYear;
  if (typeof next === 'function') {
    next();
  }
});

VehicleSchema.index({ owner: 1 });
VehicleSchema.index({ organization: 1 });

module.exports = mongoose.model('Vehicle', VehicleSchema);
