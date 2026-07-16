const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Organization = require('../models/Organization');

// Helper to check access
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

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private (Admin/Manager/Driver)
exports.getTrips = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'Admin' || req.user.role === 'Manager') {
      if (req.user.organization) {
        // Find all vehicles for the org, then find trips for those vehicles
        const vehicles = await Vehicle.find({ organization: req.user.organization }).select('_id');
        const vehicleIds = vehicles.map(v => v._id);
        query = Trip.find({ vehicle: { $in: vehicleIds } });
      } else {
        query = Trip.find();
      }
    } else if (req.user.role === 'Driver') {
      query = Trip.find({ driver: req.user._id });
    }

    const trips = await query
      .populate('vehicle', 'make model licensePlate fuelCapacity fuelType')
      .populate('driver', 'name')
      .sort({ startTime: -1 });

    res.status(200).json(trips);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
exports.getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver', 'name email');

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    await checkVehicleAccess(trip.vehicle._id, req.user);

    res.status(200).json(trip);
  } catch (error) {
    res.status(error.message === 'Trip not found' ? 404 : 403);
    next(error);
  }
};

// @desc    Create trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res, next) => {
  try {
    const { vehicle, startCoordinates, endCoordinates } = req.body;
    
    if (!vehicle) {
      res.status(400);
      throw new Error('Vehicle ID is required');
    }

    const vehicleDoc = await checkVehicleAccess(vehicle, req.user);
    
    // Assign driver
    if (req.user.role === 'Driver') {
      req.body.driver = req.user._id;
    } else if (!req.body.driver) {
      req.body.driver = vehicleDoc.driver || req.user._id;
    }

    // SERVER-SIDE ROUTE CALCULATION (Overrides client-provided values)
    if (startCoordinates && endCoordinates) {
      try {
        const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${startCoordinates.lng},${startCoordinates.lat};${endCoordinates.lng},${endCoordinates.lat}?overview=full&geometries=geojson`;
        const response = await fetch(osrmUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const distanceKm = route.distance / 1000;
            const durationMinutes = route.duration / 60;
            
            // Check for identical start and dest (Test 30)
            if (distanceKm < 0.01) {
              res.status(400);
              throw new Error('Start and destination coordinates are too close or identical');
            }

            const efficiency = vehicleDoc.fuelEfficiency || 8;
            const estimatedFuel = (distanceKm * efficiency) / 100;

            // Override client data
            req.body.distance = Number(distanceKm.toFixed(2));
            req.body.estimatedDuration = Math.round(durationMinutes);
            req.body.estimatedFuel = Number(estimatedFuel.toFixed(2));
            req.body.routeGeometry = JSON.stringify(route.geometry);
          } else {
            res.status(400);
            throw new Error('Could not calculate a route between these points');
          }
        }
      } catch (err) {
        if (err.message === 'Start and destination coordinates are too close or identical' || err.message === 'Could not calculate a route between these points') {
          throw err;
        }
        console.error('OSRM Calculation failed:', err);
        // Fallback to client data if OSRM is down, or we could strict enforce and fail.
        // The prompt says: "Remove any reliance on client-supplied fields - ignore them even if present"
        // So we MUST fail if we can't calculate.
        res.status(500);
        throw new Error('Routing service unavailable. Cannot calculate distance and fuel securely.');
      }
    } else {
       res.status(400);
       throw new Error('startCoordinates and endCoordinates are required to calculate distance securely');
    }

    const trip = await Trip.create(req.body);

    const responseObj = trip.toObject();

    // Crisis mode check
    const org = await Organization.findById(vehicleDoc.organization);
    if (org && org.crisisMode && req.body.endLocation && req.body.startTime) {
      const tripStartTime = new Date(req.body.startTime);
      const threeDaysLater = new Date(tripStartTime.getTime() + (3 * 24 * 60 * 60 * 1000));
      const threeDaysBefore = new Date(tripStartTime.getTime() - (3 * 24 * 60 * 60 * 1000));
      
      const vehicles = await Vehicle.find({ organization: org._id }).select('_id');
      const vehicleIds = vehicles.map(v => v._id);

      const overlapping = await Trip.findOne({
        _id: { $ne: trip._id },
        vehicle: { $in: vehicleIds },
        endLocation: req.body.endLocation, // Naive string match for simplicity as requested
        startTime: {
          $gte: threeDaysBefore,
          $lte: threeDaysLater
        }
      });

      if (overlapping) {
        responseObj.suggestion = 'Combine trips! Another trip to this destination is scheduled within 3 days.';
      }
    }

    res.status(201).json(responseObj);
  } catch (error) {
    // Keep the status set in the try block if it exists
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
exports.updateTrip = async (req, res, next) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    await checkVehicleAccess(trip.vehicle, req.user);

    // Drivers can only update the status of their trips
    if (req.user.role === 'Driver') {
      const allowedUpdates = ['status', 'endTime'];
      const updates = Object.keys(req.body);
      const isValidOperation = updates.every(update => allowedUpdates.includes(update));
      
      if (!isValidOperation) {
        res.status(403);
        throw new Error('Drivers can only update trip status and end time');
      }
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(trip);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private (Admin/Manager)
exports.deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    await checkVehicleAccess(trip.vehicle, req.user);

    if (req.user.role === 'Driver') {
      res.status(403);
      throw new Error('Drivers cannot delete trips');
    }

    await trip.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400);
    next(error);
  }
};
