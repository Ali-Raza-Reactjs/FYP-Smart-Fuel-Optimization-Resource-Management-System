const Vehicle = require('../models/Vehicle');

// @desc    Get optimized route details (distance, duration, fuel, geometry)
// @route   POST /api/routes/optimize
// @access  Private
exports.optimizeRoute = async (req, res, next) => {
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

    // 1. Fetch vehicle to get fuel efficiency
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }

    // Default to 8 L/100km if not set on older vehicle records
    const efficiency = vehicle.fuelEfficiency || 8;

    // 2. Call OSRM Public API
    // Format: /route/v1/driving/{longitude},{latitude};{longitude},{latitude}
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${startCoordinates.lng},${startCoordinates.lat};${endCoordinates.lng},${endCoordinates.lat}?overview=full&geometries=geojson`;
    
    const response = await fetch(osrmUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch route from routing service');
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      res.status(400);
      throw new Error('Could not calculate a route between these points');
    }

    const route = data.routes[0];
    
    // Distance comes in meters, duration in seconds
    const distanceKm = route.distance / 1000;
    const durationMinutes = route.duration / 60;

    // 3. Calculate Fuel
    const estimatedFuel = (distanceKm * efficiency) / 100;

    res.status(200).json({
      distance: Number(distanceKm.toFixed(2)),
      estimatedDuration: Math.round(durationMinutes),
      estimatedFuel: Number(estimatedFuel.toFixed(2)),
      geometry: JSON.stringify(route.geometry)
    });
  } catch (error) {
    next(error);
  }
};
