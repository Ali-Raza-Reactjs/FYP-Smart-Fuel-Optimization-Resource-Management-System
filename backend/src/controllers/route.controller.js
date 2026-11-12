const { ApiResponseModel } = require("../utils/classes");
const Vehicle = require('../models/Vehicle');
const { mapOsrmRoutes, pickRoute } = require('../utils/fuelEstimate');

// @desc    Get optimized route details (distance, duration, fuel, geometry)
// @route   POST /api/routes/optimize
// @access  Private
exports.optimizeRoute = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const { startCoordinates, endCoordinates, vehicleId } = req.body;

    if (!startCoordinates || !endCoordinates) {
      res.status(400);
      throw new Error('Please provide both start and end coordinates');
    }

    if (!vehicleId) {
      res.status(400);
      throw new Error('Please provide a vehicle ID to calculate fuel consumption');
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }

    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${startCoordinates.lng},${startCoordinates.lat};${endCoordinates.lng},${endCoordinates.lat}?overview=full&geometries=geojson&alternatives=true`;

    const response = await fetch(osrmUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch route from routing service');
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      res.status(400);
      throw new Error('Could not calculate a route between these points');
    }

    const routes = mapOsrmRoutes(data.routes, vehicle.fuelEfficiency);
    const recommended = pickRoute(routes);

    if (!recommended) {
      res.status(400);
      throw new Error('Vehicle fuel efficiency must be greater than 0 km/liter');
    }

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = {
      distance: recommended.distance,
      estimatedDuration: recommended.estimatedDuration,
      estimatedFuel: recommended.estimatedFuel,
      geometry: recommended.geometry,
      routes
    };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};
