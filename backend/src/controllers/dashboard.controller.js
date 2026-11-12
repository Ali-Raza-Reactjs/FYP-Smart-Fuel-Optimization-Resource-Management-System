const { ApiResponseModel } = require("../utils/classes");
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const FuelRecord = require('../models/FuelRecord');
const Maintenance = require('../models/Maintenance');
const Organization = require('../models/Organization');
const Budget = require('../models/Budget');
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const { role, organization, _id } = req.user;
    let data = {};

    if (role === 'Admin' || role === 'Manager' || role === 'Individual') {
      let vehicles = [];
      let totalDrivers = 0;
      let crisisMode = false;

      if (role === 'Admin') {
        vehicles = await Vehicle.find().select('_id status make model licensePlate vehicleName');
        totalDrivers = await User.countDocuments({ role: 'Driver' });
      } else if (role === 'Individual') {
        vehicles = await Vehicle.find({ owner: _id }).select('_id status make model licensePlate vehicleName');
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
            historicalSpend: [],
            perVehicle: [],
            currentBudget: null,
            crisisMode: false
          };
          return res.status(200).json(apiResponseModel);
        }
        vehicles = await Vehicle.find({ organization }).select('_id status make model licensePlate vehicleName');
        totalDrivers = await User.countDocuments({ organization, role: 'Driver' });
        const org = await Organization.findById(organization).select('crisisMode');
        crisisMode = Boolean(org?.crisisMode);
      }

      if (role === 'Admin' && organization) {
        const org = await Organization.findById(organization).select('crisisMode');
        crisisMode = Boolean(org?.crisisMode);
      }

      let vehicleIds = vehicles.map(v => v._id);
      if (req.query.vehicleId && mongoose.Types.ObjectId.isValid(req.query.vehicleId)) {
        const allowed = vehicleIds.some(id => id.toString() === req.query.vehicleId);
        if (allowed) {
          vehicleIds = [new mongoose.Types.ObjectId(req.query.vehicleId)];
        }
      }

      const totalVehicles = vehicles.length;
      const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
      const activeTrips = await Trip.countDocuments({ vehicle: { $in: vehicleIds }, status: 'In Transit' });

      const now = new Date();
      let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      let endDate = now;

      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
      }

      const fuelAgg = await FuelRecord.aggregate([
        { $match: { vehicle: { $in: vehicleIds }, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$cost' }, liters: { $sum: '$liters' } } }
      ]);
      const currentMonthFuel = fuelAgg.length > 0 ? fuelAgg[0].total : 0;
      const currentMonthLiters = fuelAgg.length > 0 ? fuelAgg[0].liters : 0;

      const maintAgg = await Maintenance.aggregate([
        { $match: { vehicle: { $in: vehicleIds }, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$cost' } } }
      ]);
      const currentMonthMaint = maintAgg.length > 0 ? maintAgg[0].total : 0;
      const currentMonthSpend = currentMonthFuel + currentMonthMaint;

      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const [fuelHist, maintHist, perVehicleAgg] = await Promise.all([
        FuelRecord.aggregate([
          { $match: { vehicle: { $in: vehicleIds }, date: { $gte: sixMonthsAgo } } },
          { $group: {
            _id: { y: { $year: '$date' }, m: { $month: '$date' } },
            fuel: { $sum: '$cost' },
            fuelLiters: { $sum: '$liters' }
          } }
        ]),
        Maintenance.aggregate([
          { $match: { vehicle: { $in: vehicleIds }, date: { $gte: sixMonthsAgo } } },
          { $group: {
            _id: { y: { $year: '$date' }, m: { $month: '$date' } },
            maintenance: { $sum: '$cost' }
          } }
        ]),
        FuelRecord.aggregate([
          { $match: { vehicle: { $in: vehicleIds }, date: { $gte: startDate, $lte: endDate } } },
          { $group: {
            _id: '$vehicle',
            cost: { $sum: '$cost' },
            liters: { $sum: '$liters' }
          } }
        ])
      ]);

      const fuelMap = new Map(fuelHist.map(row => [`${row._id.y}-${row._id.m}`, row]));
      const maintMap = new Map(maintHist.map(row => [`${row._id.y}-${row._id.m}`, row]));
      const historicalSpend = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${start.getFullYear()}-${start.getMonth() + 1}`;
        const monthName = start.toLocaleString('default', { month: 'short' });
        historicalSpend.push({
          name: monthName,
          fuel: fuelMap.get(key)?.fuel || 0,
          fuelLiters: fuelMap.get(key)?.fuelLiters || 0,
          maintenance: maintMap.get(key)?.maintenance || 0
        });
      }

      const vehicleLabel = (id) => {
        const v = vehicles.find(item => item._id.toString() === id.toString());
        if (!v) return 'Unknown';
        return v.licensePlate || v.vehicleName || `${v.make || ''} ${v.model || ''}`.trim() || 'Vehicle';
      };

      const perVehicle = perVehicleAgg.map(row => ({
        name: vehicleLabel(row._id),
        cost: row.cost,
        liters: row.liters
      }));

      const latestTrip = await Trip.findOne({ vehicle: { $in: vehicleIds }, status: 'Scheduled' })
        .sort({ createdAt: -1 })
        .populate('driver', 'name')
        .populate('vehicle', 'licensePlate make model');

      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      let budgetFilter = null;
      if (role === 'Individual') {
        budgetFilter = { owner: _id, month, year };
      } else if (organization) {
        budgetFilter = { organization, month, year };
      } else if (role === 'Admin') {
        budgetFilter = { organization: { $exists: true, $ne: null }, month, year };
      }

      let currentBudget = null;
      if (budgetFilter) {
        const budget = await Budget.findOne(budgetFilter);
        if (budget) {
          currentBudget = {
            totalLimit: budget.totalLimit,
            alertThreshold: budget.alertThreshold,
            actualSpend: currentMonthSpend,
            percentUsed: budget.totalLimit ? (currentMonthSpend / budget.totalLimit) * 100 : 0
          };
        }
      }

      data = {
        totalVehicles,
        activeVehicles,
        totalDrivers,
        activeTrips,
        currentMonthSpend,
        currentMonthLiters,
        historicalSpend,
        perVehicle,
        latestTrip,
        currentBudget,
        crisisMode,
        vehicles: vehicles.map(v => ({
          _id: v._id,
          label: v.licensePlate || v.vehicleName || `${v.make || ''} ${v.model || ''}`.trim()
        }))
      };

    } else if (role === 'Driver') {
      const assignedVehicle = await Vehicle.findOne({ driver: _id }).select('make model licensePlate');
      const trips = await Trip.find({ driver: _id, status: { $in: ['Scheduled', 'In Transit'] } }).sort('startTime').limit(5);

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
