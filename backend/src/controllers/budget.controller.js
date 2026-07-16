const Budget = require('../models/Budget');
const FuelRecord = require('../models/FuelRecord');
const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');

// Helper to calculate actual spend for a specific month/year/org
const calculateActualSpend = async (orgId, month, year) => {
  // 1. Get all vehicles for this org
  const vehicles = await Vehicle.find({ organization: orgId }).select('_id');
  const vehicleIds = vehicles.map(v => v._id);

  if (vehicleIds.length === 0) return 0;

  // Create date range for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // 2. Aggregate Fuel Costs
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

  // 3. Aggregate Maintenance Costs
  const maintAgg = await Maintenance.aggregate([
    { 
      $match: { 
        vehicle: { $in: vehicleIds },
        date: { $gte: startDate, $lt: endDate }
      }
    },
    { $group: { _id: null, total: { $sum: '$cost' } } }
  ]);
  const maintCost = maintAgg.length > 0 ? maintAgg[0].total : 0;

  return fuelCost + maintCost;
};

// @desc    Get all budgets for org with actual spend
// @route   GET /api/budgets
// @access  Private (Admin/Manager)
exports.getBudgets = async (req, res, next) => {
  try {
    const orgId = req.user.organization;
    const budgets = await Budget.find({ organization: orgId }).sort({ year: -1, month: -1 });

    // Calculate actual spend for each budget dynamically
    const enrichedBudgets = await Promise.all(budgets.map(async (budget) => {
      const actualSpend = await calculateActualSpend(orgId, budget.month, budget.year);
      return {
        ...budget.toObject(),
        actualSpend
      };
    }));

    res.status(200).json(enrichedBudgets);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private (Admin/Manager)
exports.getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    if (budget.organization.toString() !== req.user.organization.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this budget');
    }

    const actualSpend = await calculateActualSpend(budget.organization, budget.month, budget.year);

    res.status(200).json({
      ...budget.toObject(),
      actualSpend
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private (Admin/Manager)
exports.createBudget = async (req, res, next) => {
  try {
    req.body.organization = req.user.organization;

    // Check if budget already exists for this month/year
    const existing = await Budget.findOne({
      organization: req.body.organization,
      month: req.body.month,
      year: req.body.year
    });

    if (existing) {
      res.status(400);
      throw new Error('Budget already exists for this month and year');
    }

    const budget = await Budget.create(req.body);
    res.status(201).json(budget);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private (Admin/Manager)
exports.updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    if (budget.organization.toString() !== req.user.organization.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this budget');
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(budget);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private (Admin/Manager)
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    if (budget.organization.toString() !== req.user.organization.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this budget');
    }

    await budget.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400);
    next(error);
  }
};
