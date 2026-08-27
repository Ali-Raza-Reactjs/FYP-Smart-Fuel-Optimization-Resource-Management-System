const Vehicle = require('../models/Vehicle');

const getVehicleForUser = async (vehicleId, user) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  const userId = user._id.toString();
  const ownerId = vehicle.owner?.toString();
  const driverId = vehicle.driver?.toString();
  const organizationId = vehicle.organization?.toString();
  const userOrganizationId = user.organization?.toString();

  const hasAccess = user.role === 'Admin'
    || (user.role === 'Individual' && ownerId === userId)
    || (user.role === 'Driver' && driverId === userId)
    || (user.role === 'Manager' && (!userOrganizationId || organizationId === userOrganizationId));

  if (!hasAccess) {
    const error = new Error('Not authorized to access this vehicle');
    error.statusCode = 403;
    throw error;
  }

  return vehicle;
};

module.exports = { getVehicleForUser };
