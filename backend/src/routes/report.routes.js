const express = require('express');
const { exportFinancialReport } = require('../controllers/report.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin', 'Manager'));

router.route('/export')
  .get(exportFinancialReport);

module.exports = router;
