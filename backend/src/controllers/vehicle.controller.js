const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private (Admin/Manager/Driver)
exports.getVehicles = async (req, res, next) => {
  try {
    let query;

    // If user is Admin, they might want to see all vehicles or just their org's vehicles
    // For simplicity, we'll scope it to their organization if they have one.
    // If user is Driver, they only see vehicles assigned to them.
    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      if (req.user.organization) {
        query = Vehicle.find({ organization: req.user.organization });
      } else {
        query = Vehicle.find(); // Super admin without specific org sees all
      }
    } else if (req.user.role === 'Driver') {
      query = Vehicle.find({ driver: req.user._id });
    }

    const vehicles = await query.populate('organization', 'name').populate('driver', 'name email');
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicle = async (req, res, next) => {
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

    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Admin/Manager)
exports.createVehicle = async (req, res, next) => {
  try {
    // Check if user has an organization
    if (!req.user.organization && req.user.role !== 'Admin') {
      res.status(400);
      throw new Error('User must belong to an organization to add a vehicle');
    }

    // Default organization to the user's organization if not provided
    if (!req.body.organization) {
      req.body.organization = req.user.organization;
    }

    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Admin/Manager)
exports.updateVehicle = async (req, res, next) => {
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

    // Security: Ensure Admin/Manager can only modify vehicles within their own organization
    if (req.user.organization && vehicle.organization.toString() !== req.user.organization.toString()) {
      res.status(403);
      throw new Error('Not authorized to update a vehicle outside your organization');
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Admin/Manager)
exports.deleteVehicle = async (req, res, next) => {
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

    // Security: Ensure Admin/Manager can only delete vehicles within their own organization
    if (req.user.organization && vehicle.organization.toString() !== req.user.organization.toString()) {
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

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get drivers for assignment (Helper for the frontend)
// @route   GET /api/vehicles/drivers/available
// @access  Private (Admin/Manager)
exports.getAvailableDrivers = async (req, res, next) => {
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
    res.status(200).json(drivers);
  } catch (error) {
    next(error);
  }
};
