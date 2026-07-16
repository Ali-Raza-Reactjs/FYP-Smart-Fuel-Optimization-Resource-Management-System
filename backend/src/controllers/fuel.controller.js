const FuelRecord = require('../models/FuelRecord');
const Vehicle = require('../models/Vehicle');
const Budget = require('../models/Budget');
const User = require('../models/User');
const Maintenance = require('../models/Maintenance');
const Notification = require('../models/Notification');
const { createNotification } = require('./notification.controller');
const fs = require('fs');
const path = require('path');

// Helper to check if user has access to a vehicle
const checkVehicleAccess = async (vehicleId, user) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  if (user.role === 'Admin' || user.role === 'Manager') {
    if (user.organization && vehicle.organization.toString() !== user.organization.toString()) {
      throw new Error('Not authorized to access this vehicle');
    }
  } else if (user.role === 'Driver') {
    if (vehicle.driver?.toString() !== user._id.toString()) {
      throw new Error('Not authorized to access this vehicle');
    }
  }

  return vehicle;
};

// @desc    Get fuel records for a vehicle (including basic analytics)
// @route   GET /api/fuel/vehicle/:vehicleId
// @access  Private
exports.getFuelRecordsByVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    await checkVehicleAccess(vehicleId, req.user);

    const mongoose = require('mongoose');
    const records = await FuelRecord.find({ vehicle: new mongoose.Types.ObjectId(vehicleId) })
      .populate('driver', 'name')
      .sort({ date: -1 });

    // Calculate Basic Analytics
    let totalCost = 0;
    let totalLiters = 0;
    records.forEach(record => {
      totalCost += record.cost;
      totalLiters += record.liters;
    });

    res.status(200).json({
      records,
      analytics: {
        totalCost,
        totalLiters,
        recordCount: records.length
      }
    });
  } catch (error) {
    res.status(403);
    next(error);
  }
};

// @desc    Get single fuel record
// @route   GET /api/fuel/:id
// @access  Private
exports.getFuelRecord = async (req, res, next) => {
  try {
    const record = await FuelRecord.findById(req.params.id).populate('driver', 'name');

    if (!record) {
      res.status(404);
      throw new Error('Fuel record not found');
    }

    await checkVehicleAccess(record.vehicle, req.user);

    res.status(200).json(record);
  } catch (error) {
    res.status(error.message === 'Fuel record not found' ? 404 : 403);
    next(error);
  }
};

// @desc    Create fuel record
// @route   POST /api/fuel
// @access  Private
exports.createFuelRecord = async (req, res, next) => {
  try {
    const { vehicle } = req.body;
    
    if (!vehicle) {
      res.status(400);
      throw new Error('Vehicle ID is required');
    }

    const vehicleDoc = await checkVehicleAccess(vehicle, req.user);
    
    // Automatically set driver to the currently logged in user if they are a Driver
    if (req.user.role === 'Driver') {
      req.body.driver = req.user._id;
    } else if (!req.body.driver) {
      req.body.driver = vehicleDoc.driver || req.user._id;
    }

    // Handle receipt upload
    if (req.file) {
      req.body.receiptImage = `/uploads/receipts/${req.file.filename}`;
    }

    const record = await FuelRecord.create(req.body);
    
    // Update vehicle's current odometer reading
    if (req.body.odometerReading > vehicleDoc.currentOdometer) {
      vehicleDoc.currentOdometer = req.body.odometerReading;
      await vehicleDoc.save();
    }

    // CHECK BUDGET AND TRIGGER NOTIFICATION
    try {
      const recordDate = new Date(req.body.date || Date.now());
      const month = recordDate.getMonth() + 1;
      const year = recordDate.getFullYear();

      const budget = await Budget.findOne({
        organization: vehicleDoc.organization,
        month,
        year
      });

      if (budget) {
        const FuelAgg = await FuelRecord.aggregate([
          { $match: { date: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) } } },
          { $lookup: { from: 'vehicles', localField: 'vehicle', foreignField: '_id', as: 'v' } },
          { $unwind: '$v' },
          { $match: { 'v.organization': vehicleDoc.organization } },
          { $group: { _id: null, total: { $sum: '$cost' } } }
        ]);
        const fuelTotal = FuelAgg.length > 0 ? FuelAgg[0].total : 0;

        const MaintAgg = await Maintenance.aggregate([
          { $match: { date: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) } } },
          { $lookup: { from: 'vehicles', localField: 'vehicle', foreignField: '_id', as: 'v' } },
          { $unwind: '$v' },
          { $match: { 'v.organization': vehicleDoc.organization } },
          { $group: { _id: null, total: { $sum: '$cost' } } }
        ]);
        const maintTotal = MaintAgg.length > 0 ? MaintAgg[0].total : 0;

        const actualSpend = fuelTotal + maintTotal;
        const spendPercentage = (actualSpend / budget.totalLimit) * 100;

        if (spendPercentage >= budget.alertThreshold) {
          const title = spendPercentage >= 100 ? 'Budget Exceeded!' : 'Budget Warning';
          const msg = `Your ${month}/${year} budget has reached ${spendPercentage.toFixed(1)}% of its limit ($${budget.totalLimit}).`;
          const notifType = spendPercentage >= 100 ? 'Alert' : 'Info';

          const managers = await User.find({
            organization: vehicleDoc.organization,
            role: { $in: ['Admin', 'Manager'] }
          });

          for (const manager of managers) {
            // Deduplication: only send if no identical unread notification exists for this user this month
            const existingNotif = await Notification.findOne({
              user: manager._id,
              title,
              isRead: false,
              createdAt: { $gte: new Date(year, month - 1, 1) }
            });

            if (!existingNotif) {
              await createNotification(manager._id, title, msg, notifType);
            }
          }
        }
      }
    } catch (notifyErr) {
      console.error('Error triggering budget notification:', notifyErr);
    }

    res.status(201).json(record);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Update fuel record
// @route   PUT /api/fuel/:id
// @access  Private (Admin/Manager)
exports.updateFuelRecord = async (req, res, next) => {
  try {
    let record = await FuelRecord.findById(req.params.id);

    if (!record) {
      res.status(404);
      throw new Error('Fuel record not found');
    }

    await checkVehicleAccess(record.vehicle, req.user);

    if (req.user.role === 'Driver') {
      res.status(403);
      throw new Error('Drivers cannot update fuel records once submitted. Please contact a manager.');
    }

    // Handle receipt upload (if new file uploaded, old one isn't strictly deleted here for simplicity, but could be)
    if (req.file) {
      req.body.receiptImage = `/uploads/receipts/${req.file.filename}`;
    }

    record = await FuelRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(record);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Delete fuel record
// @route   DELETE /api/fuel/:id
// @access  Private (Admin/Manager)
exports.deleteFuelRecord = async (req, res, next) => {
  try {
    const record = await FuelRecord.findById(req.params.id);

    if (!record) {
      res.status(404);
      throw new Error('Fuel record not found');
    }

    await checkVehicleAccess(record.vehicle, req.user);

    if (req.user.role === 'Driver') {
      res.status(403);
      throw new Error('Drivers cannot delete fuel records.');
    }

    // Remove the file if it exists
    if (record.receiptImage) {
      const filePath = path.join(__dirname, '../../', record.receiptImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await record.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400);
    next(error);
  }
};
