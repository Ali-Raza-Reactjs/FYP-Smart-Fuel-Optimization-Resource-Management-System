const express = require('express');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableDrivers
} = require('../controllers/vehicle.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/drivers/available')
  .get(authorize('Admin', 'Manager'), getAvailableDrivers);

router.route('/')
  .get(getVehicles)
  .post(authorize('Admin', 'Manager', 'Individual'), createVehicle);

router.route('/:id')
  .get(getVehicle)
  .put(authorize('Admin', 'Manager', 'Individual'), updateVehicle)
  .delete(authorize('Admin', 'Manager', 'Individual'), deleteVehicle);

module.exports = router;
