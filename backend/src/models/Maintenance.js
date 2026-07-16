const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a maintenance date'],
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Please add a description of the maintenance']
  },
  cost: {
    type: Number,
    required: [true, 'Please add the maintenance cost']
  },
  performedBy: {
    type: String,
    required: [true, 'Please specify who performed the maintenance (e.g. workshop name)']
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed'],
    default: 'Completed'
  },
  odometerReading: {
    type: Number,
    required: [true, 'Please add the odometer reading at the time of maintenance']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
