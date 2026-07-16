const express = require('express');
const {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
} = require('../controllers/budget.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Only Admin and Manager can access budgets
router.use(protect);
router.use(authorize('Admin', 'Manager'));

router.route('/')
  .get(getBudgets)
  .post(createBudget);

router.route('/:id')
  .get(getBudget)
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;
