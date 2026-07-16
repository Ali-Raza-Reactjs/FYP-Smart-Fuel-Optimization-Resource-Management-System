const express = require('express');
const {
  getMaintenanceLogsByVehicle,
  getMaintenanceLog,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog
} = require('../controllers/maintenance.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/vehicle/:vehicleId')
  .get(getMaintenanceLogsByVehicle);

router.route('/')
  .post(authorize('Admin', 'Manager'), createMaintenanceLog);

router.route('/:id')
  .get(getMaintenanceLog)
  .put(authorize('Admin', 'Manager'), updateMaintenanceLog)
  .delete(authorize('Admin', 'Manager'), deleteMaintenanceLog);

module.exports = router;
