const { ApiResponseModel } = require("../utils/classes");
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Organization = require('../models/Organization');
const { createNotification } = require('./notification.controller');
const { getVehicleForUser } = require('../utils/vehicleAccess');
const { mapOsrmRoutes, pickRoute } = require('../utils/fuelEstimate');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private (Admin/Manager/Driver)
exports.getTrips = async (req, res, next) => {
  let apiResponseModel = new ApiResponseModel();
  try {
    let query;

    if (req.user.role === 'Manager') {
      if (req.user.organization) {
        const vehicles = await Vehicle.find({ organization: req.user.organization }).select('_id');
        const vehicleIds = vehicles.map(v => v._id);
        query = Trip.find({ vehicle: { $in: vehicleIds } });
      } else {
        query = Trip.find();
      }
    } else if (req.user.role === 'Admin') {
      query = Trip.find();
    } else if (req.user.role === 'Driver') {
      query = Trip.find({ driver: req.user._id });
    } else if (req.user.role === 'Individual') {
      const vehicles = await Vehicle.find({ owner: req.user._id }).select('_id');
      const vehicleIds = vehicles.map(v => v._id);
      query = Trip.find({ vehicle: { $in: vehicleIds } });
    }

    const trips = await query
      .populate('vehicle', 'make model licensePlate fuelCapacity fuelType')
      .populate('driver', 'name')
      .sort({ startTime: -1 });

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = trips;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
exports.getTrip = async (req, res, next) => {
  let apiResponseModel = new ApiResponseModel();
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver', 'name email');

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    await getVehicleForUser(trip.vehicle._id, req.user);

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = trip;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    res.status(error.message === 'Trip not found' ? 404 : 403);
    next(error);
  }
};

// @desc    Create trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res, next) => {
  let apiResponseModel = new ApiResponseModel();
  try {
    const { vehicle, startCoordinates, endCoordinates } = req.body;

    if (!vehicle) {
      res.status(400);
      throw new Error('Vehicle ID is required');
    }

    const vehicleDoc = await getVehicleForUser(vehicle, req.user);

    if (req.user.role === 'Driver') {
      req.body.driver = req.user._id;
    } else if (!req.body.driver) {
      req.body.driver = vehicleDoc.driver || req.user._id;
    }

    let cheapestFuel = null;

    if (startCoordinates && endCoordinates) {
      try {
        const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${startCoordinates.lng},${startCoordinates.lat};${endCoordinates.lng},${endCoordinates.lat}?overview=full&geometries=geojson&alternatives=true`;
        const response = await fetch(osrmUrl);

        if (response.ok) {
          const data = await response.json();
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const routes = mapOsrmRoutes(data.routes, vehicleDoc.fuelEfficiency);
            const selected = pickRoute(routes, req.body.routeGeometry);

            if (!selected) {
              res.status(400);
              throw new Error('Vehicle fuel efficiency must be greater than 0 km/liter');
            }

            if (selected.distance < 0.01) {
              res.status(400);
              throw new Error('Start and destination coordinates are too close or identical');
            }

            cheapestFuel = Math.min(...routes.map((route) => route.estimatedFuel));
            req.body.distance = selected.distance;
            req.body.estimatedDuration = selected.estimatedDuration;
            req.body.estimatedFuel = selected.estimatedFuel;
            req.body.routeGeometry = selected.geometry;
          } else {
            res.status(400);
            throw new Error('Could not calculate a route between these points');
          }
        }
      } catch (err) {
        if (err.message === 'Start and destination coordinates are too close or identical' || err.message === 'Could not calculate a route between these points' || err.message === 'Vehicle fuel efficiency must be greater than 0 km/liter') {
          throw err;
        }
        console.error('OSRM Calculation failed:', err);
        res.status(500);
        throw new Error('Routing service unavailable. Cannot calculate distance and fuel securely.');
      }
    } else {
      res.status(400);
      throw new Error('startCoordinates and endCoordinates are required to calculate distance securely');
    }

    const trip = await Trip.create(req.body);
    const responseObj = trip.toObject();

    try {
      if (cheapestFuel != null && req.body.estimatedFuel > cheapestFuel * 1.1) {
        const msg = `This route uses ${req.body.estimatedFuel} L, about ${(((req.body.estimatedFuel / cheapestFuel) - 1) * 100).toFixed(0)}% more than the most fuel-efficient option (${cheapestFuel} L).`;
        responseObj.inefficientRoute = msg;
        await createNotification(req.user._id, 'Inefficient Trip', msg, 'Alert');
      }
    } catch (notifyErr) {
      console.error('Error creating inefficient trip notification:', notifyErr);
    }

    try {
      const org = vehicleDoc.organization ? await Organization.findById(vehicleDoc.organization) : null;
      if (org && org.crisisMode && req.body.endLocation && req.body.startTime) {
        const tripStartTime = new Date(req.body.startTime);
        const threeDaysLater = new Date(tripStartTime.getTime() + (3 * 24 * 60 * 60 * 1000));
        const threeDaysBefore = new Date(tripStartTime.getTime() - (3 * 24 * 60 * 60 * 1000));

        const vehicles = await Vehicle.find({ organization: org._id }).select('_id');
        const vehicleIds = vehicles.map(v => v._id);

        const overlapping = await Trip.findOne({
          _id: { $ne: trip._id },
          vehicle: { $in: vehicleIds },
          endLocation: req.body.endLocation,
          startTime: {
            $gte: threeDaysBefore,
            $lte: threeDaysLater
          }
        });

        if (overlapping) {
          responseObj.suggestion = 'Crisis Mode Alert: Another trip to this destination is scheduled within 3 days. Consider combining trips to conserve fuel!';
          await createNotification(req.user._id, 'Crisis Mode Recommendation', responseObj.suggestion, 'Alert');
        }

        if (req.body.isEssential === false) {
          const skipMsg = 'Crisis Mode: this trip is marked non-essential. Avoid non-essential travel to conserve fuel.';
          responseObj.suggestion = [responseObj.suggestion, skipMsg].filter(Boolean).join(' ');
          await createNotification(req.user._id, 'Crisis Mode Recommendation', skipMsg, 'Alert');
        }
      } else if (req.user.role === 'Individual' && req.body.endLocation && req.body.startTime) {
        const tripStartTime = new Date(req.body.startTime);
        const threeDaysLater = new Date(tripStartTime.getTime() + (3 * 24 * 60 * 60 * 1000));
        const threeDaysBefore = new Date(tripStartTime.getTime() - (3 * 24 * 60 * 60 * 1000));

        const vehicles = await Vehicle.find({ owner: req.user._id }).select('_id');
        const vehicleIds = vehicles.map(v => v._id);

        const overlapping = await Trip.findOne({
          _id: { $ne: trip._id },
          vehicle: { $in: vehicleIds },
          endLocation: req.body.endLocation,
          startTime: {
            $gte: threeDaysBefore,
            $lte: threeDaysLater
          }
        });

        if (overlapping) {
          responseObj.suggestion = 'Trip Optimization Notice: Another trip to this destination is scheduled within 3 days. Consider combining trips to conserve fuel!';
          await createNotification(req.user._id, 'Trip Optimization Notice', responseObj.suggestion, 'Info');
        }
      }
    } catch (crisisErr) {
      console.error('Error creating crisis recommendation:', crisisErr);
    }

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = responseObj;
    return res.status(201).json(apiResponseModel);
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
exports.updateTrip = async (req, res, next) => {
  let apiResponseModel = new ApiResponseModel();
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    await getVehicleForUser(trip.vehicle, req.user);

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
      returnDocument: 'after',
      runValidators: true
    });

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = trip;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private (Admin/Manager/Individual)
exports.deleteTrip = async (req, res, next) => {
  let apiResponseModel = new ApiResponseModel();
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404);
      throw new Error('Trip not found');
    }

    await getVehicleForUser(trip.vehicle, req.user);

    if (req.user.role === 'Driver') {
      res.status(403);
      throw new Error('Drivers cannot delete trips');
    }

    await trip.deleteOne();

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = { success: true, data: {} };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    res.status(400);
    next(error);
  }
};
