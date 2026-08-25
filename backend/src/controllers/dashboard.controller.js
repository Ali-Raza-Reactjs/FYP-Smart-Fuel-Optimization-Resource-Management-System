const { ApiResponseModel } = require("../utils/classes");
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const FuelRecord = require('../models/FuelRecord');
const Maintenance = require('../models/Maintenance');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const { role, organization, _id } = req.user;
    let data = {};

    if (role === 'Admin' || role === 'Manager' || role === 'Individual') {
      let vehicleIds = [];
      let totalVehicles = 0;
      let activeVehicles = 0;
      let totalDrivers = 0;

      if (role === 'Admin') {
        const vehicles = await Vehicle.find().select('_id status');
        vehicleIds = vehicles.map(v => v._id);
        totalVehicles = vehicles.length;
        activeVehicles = vehicles.filter(v => v.status === 'Active').length;
        totalDrivers = await User.countDocuments({ role: 'Driver' });
      } else if (role === 'Individual') {
        const vehicles = await Vehicle.find({ owner: _id }).select('_id status');
        vehicleIds = vehicles.map(v => v._id);
        totalVehicles = vehicles.length;
        activeVehicles = vehicles.filter(v => v.status === 'Active').length;
        totalDrivers = 0;
      } else if (role === 'Manager') {
        if (!organization) {
          apiResponseModel.status = true;
          apiResponseModel.msg = "Success";
          apiResponseModel.data = {
            hasOrganization: false,
            totalVehicles: 0,
            activeVehicles: 0,
            totalDrivers: 0,
            activeTrips: 0,
            currentMonthSpend: 0,
            historicalSpend: []
          };
          return res.status(200).json(apiResponseModel);
        }
        const vehicles = await Vehicle.find({ organization }).select('_id status');
        vehicleIds = vehicles.map(v => v._id);
        totalVehicles = vehicles.length;
        activeVehicles = vehicles.filter(v => v.status === 'Active').length;
        totalDrivers = await User.countDocuments({ organization, role: 'Driver' });
      }

      // 3. Get active trips
      const activeTrips = await Trip.countDocuments({ vehicle: { $in: vehicleIds }, status: 'In Transit' });

      // 4. Get Current Spend (Fuel + Maintenance) within date range
      const now = new Date();
      
      let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      let endDate = now;

      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
        // Include the entire end day
        endDate.setHours(23, 59, 59, 999);
      }
      
      const fuelAgg = await FuelRecord.aggregate([
        { $match: { vehicle: { $in: vehicleIds }, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$cost' } } }
      ]);
      const currentMonthFuel = fuelAgg.length > 0 ? fuelAgg[0].total : 0;

      const maintAgg = await Maintenance.aggregate([
        { $match: { vehicle: { $in: vehicleIds }, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$cost' } } }
      ]);
      const currentMonthMaint = maintAgg.length > 0 ? maintAgg[0].total : 0;

      const currentMonthSpend = currentMonthFuel + currentMonthMaint;

      // 5. Historical Spend Data (Last 6 Months) for Charts
      let historicalSpend = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const fAgg = await FuelRecord.aggregate([
          { $match: { vehicle: { $in: vehicleIds }, date: { $gte: start, $lt: end } } },
          { $group: { _id: null, total: { $sum: '$cost' } } }
        ]);
        const mAgg = await Maintenance.aggregate([
          { $match: { vehicle: { $in: vehicleIds }, date: { $gte: start, $lt: end } } },
          { $group: { _id: null, total: { $sum: '$cost' } } }
        ]);
        
        const monthName = start.toLocaleString('default', { month: 'short' });
        historicalSpend.push({
          name: monthName,
          fuel: fAgg.length > 0 ? fAgg[0].total : 0,
          maintenance: mAgg.length > 0 ? mAgg[0].total : 0
        });
      }

      // 6. Get Latest Planned Trip
      const latestTrip = await Trip.findOne({ vehicle: { $in: vehicleIds }, status: 'Scheduled' })
        .sort({ createdAt: -1 })
        .populate('driver', 'name')
        .populate('vehicle', 'licensePlate make model');

      data = {
        totalVehicles,
        activeVehicles,
        totalDrivers,
        activeTrips,
        currentMonthSpend,
        historicalSpend,
        latestTrip
      };

    } else if (role === 'Driver') {
      // Logic for Driver Dashboard
      // 1. Assigned Vehicle
      const assignedVehicle = await Vehicle.findOne({ driver: _id }).select('make model licensePlate');

      // 2. Upcoming / Active Trips
      const trips = await Trip.find({ driver: _id, status: { $in: ['Scheduled', 'In Transit'] } }).sort('startTime').limit(5);

      // 3. Fuel Logged this month
      const now = new Date();
      
      let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      let endDate = now;

      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
      }
      
      const fuelAgg = await FuelRecord.aggregate([
        { $match: { driver: _id, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, totalLiters: { $sum: '$liters' }, totalCost: { $sum: '$cost' } } }
      ]);
      
      const monthlyFuel = fuelAgg.length > 0 ? fuelAgg[0] : { totalLiters: 0, totalCost: 0 };

      data = {
        assignedVehicle,
        trips,
        monthlyFuel
      };
    }

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = data;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};
