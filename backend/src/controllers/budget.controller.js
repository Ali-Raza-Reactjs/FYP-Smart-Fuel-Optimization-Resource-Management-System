const { ApiResponseModel } = require("../utils/classes");
const Budget = require('../models/Budget');
const FuelRecord = require('../models/FuelRecord');
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');

const getBudgetFilter = (user) => {
  if (user.role === 'Individual') {
    return { owner: user._id };
  }
  if (user.role === 'Admin') {
    return { organization: { $exists: true, $ne: null } };
  }
  return { organization: user.organization };
};

const getBudgetVehicleIds = async (budget, user) => {
  if (budget.organization) {
    const vehicles = await Vehicle.find({ organization: budget.organization }).select('_id');
    return vehicles.map(v => v._id);
  }
  if (budget.owner) {
    const vehicles = await Vehicle.find({ owner: budget.owner }).select('_id');
    return vehicles.map(v => v._id);
  }
  if (user.role === 'Individual') {
    const vehicles = await Vehicle.find({ owner: user._id }).select('_id');
    return vehicles.map(v => v._id);
  }
  return [];
};

const canAccessBudget = (budget, user) => {
  if (user.role === 'Admin') return true;
  if (budget.owner && budget.owner.toString() === user._id.toString()) return true;
  if (budget.organization && user.organization && budget.organization.toString() === user.organization.toString()) {
    return user.role === 'Manager' || user.role === 'Admin';
  }
  return false;
};

const calculateActualSpend = async (vehicleIds, month, year, includeMaintenance = true) => {
  if (!vehicleIds.length) return 0;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const fuelAgg = await FuelRecord.aggregate([
    {
      $match: {
        vehicle: { $in: vehicleIds },
        date: { $gte: startDate, $lt: endDate }
      }
    },
    { $group: { _id: null, total: { $sum: '$cost' } } }
  ]);
  const fuelCost = fuelAgg.length > 0 ? fuelAgg[0].total : 0;

  if (!includeMaintenance) return fuelCost;

  const maintAgg = await Maintenance.aggregate([
    {
      $match: {
        vehicle: { $in: vehicleIds },
        date: { $gte: startDate, $lt: endDate }
      }
    },
    { $group: { _id: null, total: { $sum: '$cost' } } }
  ]);
  return fuelCost + (maintAgg.length > 0 ? maintAgg[0].total : 0);
};

exports.getBudgets = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const budgets = await Budget.find(getBudgetFilter(req.user))
      .populate('organization', 'name')
      .sort({ year: -1, month: -1 });
    const includeMaintenance = req.user.role !== 'Individual';

    const enrichedBudgets = await Promise.all(budgets.map(async (budget) => {
      const vehicleIds = await getBudgetVehicleIds(budget, req.user);
      const actualSpend = await calculateActualSpend(vehicleIds, budget.month, budget.year, includeMaintenance);
      return {
        ...budget.toObject(),
        actualSpend
      };
    }));

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = enrichedBudgets;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

exports.getBudget = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    if (!canAccessBudget(budget, req.user)) {
      res.status(403);
      throw new Error('Not authorized to access this budget');
    }

    const vehicleIds = await getBudgetVehicleIds(budget, req.user);
    const actualSpend = await calculateActualSpend(
      vehicleIds,
      budget.month,
      budget.year,
      req.user.role !== 'Individual'
    );

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = {
      ...budget.toObject(),
      actualSpend
    };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.createBudget = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    if (req.user.role === 'Individual') {
      req.body.owner = req.user._id;
      delete req.body.organization;
    } else {
      const organizationId = req.user.organization || req.body.organization;
      if (!organizationId) {
        res.status(400);
        throw new Error('Select an organization before creating a budget');
      }
      req.body.organization = organizationId;
      delete req.body.owner;
    }

    const existing = await Budget.findOne(
      req.body.owner
        ? { owner: req.body.owner, month: req.body.month, year: req.body.year }
        : { organization: req.body.organization, month: req.body.month, year: req.body.year }
    );

    if (existing) {
      res.status(400);
      throw new Error('Budget already exists for this month and year');
    }

    const budget = await Budget.create(req.body);
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = budget;
    return res.status(201).json(apiResponseModel);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.updateBudget = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    if (!canAccessBudget(budget, req.user)) {
      res.status(403);
      throw new Error('Not authorized to update this budget');
    }

    delete req.body.owner;
    delete req.body.organization;

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = budget;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

exports.deleteBudget = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    if (!canAccessBudget(budget, req.user)) {
      res.status(403);
      throw new Error('Not authorized to delete this budget');
    }

    await budget.deleteOne();

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = { success: true, data: {} };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    res.status(400);
    next(error);
  }
};
