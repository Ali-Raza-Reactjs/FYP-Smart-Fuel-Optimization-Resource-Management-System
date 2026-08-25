const { ApiResponseModel } = require("../utils/classes");
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    let queryObj = {};

    if (req.user.role === 'Individual') {
      queryObj.owner = req.user._id;
    } else if (req.user.role === 'Driver') {
      queryObj.driver = req.user._id;
    } else if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      if (req.user.organization) {
        queryObj.organization = req.user.organization;
      }
    }

    // Support admin searching by user/registration number
    if (req.query.search && (req.user.role === 'Admin' || req.user.role === 'Manager')) {
      const searchRegex = new RegExp(req.query.search, 'i');
      
      // Find matching users (owners or drivers)
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      // Search filters
      queryObj.$or = [
        { registrationNumber: searchRegex },
        { licensePlate: searchRegex },
        { vehicleName: searchRegex },
        { make: searchRegex },
        { model: searchRegex },
        { owner: { $in: userIds } },
        { driver: { $in: userIds } }
      ];
    }

    const vehicles = await Vehicle.find(queryObj)
      .populate('organization', 'name')
      .populate('driver', 'name email')
      .populate('owner', 'name email profile.phoneNumber');

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = vehicles;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicle = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('organization', 'name')
      .populate('driver', 'name email profile.phoneNumber');

    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }

    // Access control: Drivers can only view their own assigned vehicle
    if (req.user.role === 'Driver' && vehicle.driver?._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this vehicle');
    }

    // Access control: Individual users can only view their own vehicles
    if (req.user.role === 'Individual' && vehicle.owner?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this vehicle');
    }

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = vehicle;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Admin/Manager/Individual)
exports.createVehicle = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    // Check if user has an organization (exempting Admin and Individual roles)
    if (!req.user.organization && req.user.role !== 'Admin' && req.user.role !== 'Individual') {
      res.status(400);
      throw new Error('User must belong to an organization to add a vehicle');
    }

    // Default organization to the user's organization if not provided
    if (!req.body.organization && req.user.organization) {
      req.body.organization = req.user.organization;
    }

    // Set owner to creator if not specified
    req.body.owner = req.body.owner || req.user._id;

    const vehicle = await Vehicle.create(req.body);
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = vehicle;
    return res.status(201).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Admin/Manager/Individual)
exports.updateVehicle = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }

    if (req.user.role === 'Driver') {
      res.status(403);
      throw new Error('Not authorized to update this vehicle');
    }

    // Security for Individual users
    if (req.user.role === 'Individual' && vehicle.owner?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this vehicle');
    }

    // Security: Ensure Admin/Manager can only modify vehicles within their own organization
    if (req.user.role !== 'Admin' && req.user.organization && vehicle.organization && vehicle.organization.toString() !== req.user.organization.toString()) {
      res.status(403);
      throw new Error('Not authorized to update a vehicle outside your organization');
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = vehicle;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Admin/Manager/Individual)
exports.deleteVehicle = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }

    if (req.user.role === 'Driver') {
      res.status(403);
      throw new Error('Not authorized to delete this vehicle');
    }

    // Security for Individual users
    if (req.user.role === 'Individual' && vehicle.owner?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this vehicle');
    }

    // Security: Ensure Admin/Manager can only delete vehicles within their own organization
    if (req.user.role !== 'Admin' && req.user.organization && vehicle.organization && vehicle.organization.toString() !== req.user.organization.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete a vehicle outside your organization');
    }

    const Trip = require('../models/Trip');
    const FuelRecord = require('../models/FuelRecord');

    // Perform cascade delete using a session if replica set is available, otherwise normal deleteMany
    // Since we don't know if replica set is active, we'll do sequential deleteMany
    await Trip.deleteMany({ vehicle: req.params.id });
    await FuelRecord.deleteMany({ vehicle: req.params.id });

    await vehicle.deleteOne();

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = { success: true, data: {} };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Get drivers for assignment (Helper for the frontend)
// @route   GET /api/vehicles/drivers/available
// @access  Private (Admin/Manager)
exports.getAvailableDrivers = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    // Find all users with role 'Driver'
    let query = { role: 'Driver' };
    
    // Scope to organization if applicable
    if (req.user.organization) {
      query.$or = [
        { organization: req.user.organization },
        { organization: null },
        { organization: { $exists: false } }
      ];
    }
    
    const drivers = await User.find(query).select('name email');
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = drivers;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};
