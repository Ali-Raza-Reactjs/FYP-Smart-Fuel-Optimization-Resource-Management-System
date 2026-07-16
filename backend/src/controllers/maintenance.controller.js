const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');

// Helper to check if user has access to a vehicle
const checkVehicleAccess = async (vehicleId, user) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  // Admin/Manager can see if it belongs to their org
  if (user.role === 'Admin' || user.role === 'Manager') {
    if (user.organization && vehicle.organization.toString() !== user.organization.toString()) {
      throw new Error('Not authorized to access this vehicle');
    }
  } 
  // Driver can only see if assigned to them
  else if (user.role === 'Driver') {
    if (vehicle.driver?.toString() !== user._id.toString()) {
      throw new Error('Not authorized to access this vehicle');
    }
  }

  return vehicle;
};

// @desc    Get maintenance logs for a vehicle
// @route   GET /api/maintenance/vehicle/:vehicleId
// @access  Private (Admin/Manager/Driver)
exports.getMaintenanceLogsByVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    
    // Check access
    await checkVehicleAccess(vehicleId, req.user);

    const logs = await Maintenance.find({ vehicle: vehicleId }).sort({ date: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(403);
    next(error);
  }
};

// @desc    Get single maintenance log
// @route   GET /api/maintenance/:id
// @access  Private
exports.getMaintenanceLog = async (req, res, next) => {
  try {
    const log = await Maintenance.findById(req.params.id);

    if (!log) {
      res.status(404);
      throw new Error('Maintenance log not found');
    }

    await checkVehicleAccess(log.vehicle, req.user);

    res.status(200).json(log);
  } catch (error) {
    res.status(error.message === 'Maintenance log not found' ? 404 : 403);
    next(error);
  }
};

// @desc    Create maintenance log
// @route   POST /api/maintenance
// @access  Private (Admin/Manager)
exports.createMaintenanceLog = async (req, res, next) => {
  try {
    const { vehicle } = req.body;
    
    if (!vehicle) {
      res.status(400);
      throw new Error('Vehicle ID is required');
    }

    await checkVehicleAccess(vehicle, req.user);

    const log = await Maintenance.create(req.body);
    res.status(201).json(log);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Update maintenance log
// @route   PUT /api/maintenance/:id
// @access  Private (Admin/Manager)
exports.updateMaintenanceLog = async (req, res, next) => {
  try {
    let log = await Maintenance.findById(req.params.id);

    if (!log) {
      res.status(404);
      throw new Error('Maintenance log not found');
    }

    await checkVehicleAccess(log.vehicle, req.user);

    log = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(log);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Delete maintenance log
// @route   DELETE /api/maintenance/:id
// @access  Private (Admin/Manager)
exports.deleteMaintenanceLog = async (req, res, next) => {
  try {
    const log = await Maintenance.findById(req.params.id);

    if (!log) {
      res.status(404);
      throw new Error('Maintenance log not found');
    }

    await checkVehicleAccess(log.vehicle, req.user);

    await log.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400);
    next(error);
  }
};
