const express = require('express');
const {
  getFuelRecordsByVehicle,
  getFuelRecord,
  createFuelRecord,
  updateFuelRecord,
  deleteFuelRecord
} = require('../controllers/fuel.controller');
const upload = require('../middlewares/upload.middleware');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/vehicle/:vehicleId')
  .get(getFuelRecordsByVehicle);

// Note: upload.single('receiptImage') expects the form-data key to be 'receiptImage'
router.route('/')
  .post(upload.single('receiptImage'), createFuelRecord);

router.route('/:id')
  .get(getFuelRecord)
  .put(authorize('Admin', 'Manager'), upload.single('receiptImage'), updateFuelRecord)
  .delete(authorize('Admin', 'Manager'), deleteFuelRecord);

module.exports = router;
