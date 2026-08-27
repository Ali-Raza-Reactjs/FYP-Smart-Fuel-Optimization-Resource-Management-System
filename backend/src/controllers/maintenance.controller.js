const { ApiResponseModel } = require("../utils/classes");
const Maintenance = require('../models/Maintenance');
const { getVehicleForUser } = require('../utils/vehicleAccess');

// @desc    Get maintenance logs for a vehicle
// @route   GET /api/maintenance/vehicle/:vehicleId
// @access  Private (Admin/Manager/Driver)
exports.getMaintenanceLogsByVehicle = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const { vehicleId } = req.params;
    
    // Check access
    await getVehicleForUser(vehicleId, req.user);

    const logs = await Maintenance.find({ vehicle: vehicleId }).sort({ date: -1 });
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = logs;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    res.status(403);
    next(error);
  }
};

// @desc    Get single maintenance log
// @route   GET /api/maintenance/:id
// @access  Private
exports.getMaintenanceLog = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const log = await Maintenance.findById(req.params.id);

    if (!log) {
      res.status(404);
      throw new Error('Maintenance log not found');
    }

    await getVehicleForUser(log.vehicle, req.user);

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = log;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    res.status(error.message === 'Maintenance log not found' ? 404 : 403);
    next(error);
  }
};

// @desc    Create maintenance log
// @route   POST /api/maintenance
// @access  Private (Admin/Manager)
exports.createMaintenanceLog = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const { vehicle } = req.body;
    
    if (!vehicle) {
      res.status(400);
      throw new Error('Vehicle ID is required');
    }

    await getVehicleForUser(vehicle, req.user);

    const log = await Maintenance.create(req.body);
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = log;
    return res.status(201).json(apiResponseModel);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Update maintenance log
// @route   PUT /api/maintenance/:id
// @access  Private (Admin/Manager)
exports.updateMaintenanceLog = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    let log = await Maintenance.findById(req.params.id);

    if (!log) {
      res.status(404);
      throw new Error('Maintenance log not found');
    }

    await getVehicleForUser(log.vehicle, req.user);

    log = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = log;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Delete maintenance log
// @route   DELETE /api/maintenance/:id
// @access  Private (Admin/Manager)
exports.deleteMaintenanceLog = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const log = await Maintenance.findById(req.params.id);

    if (!log) {
      res.status(404);
      throw new Error('Maintenance log not found');
    }

    await getVehicleForUser(log.vehicle, req.user);

    await log.deleteOne();

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = { success: true, data: {} };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    res.status(400);
    next(error);
  }
};
