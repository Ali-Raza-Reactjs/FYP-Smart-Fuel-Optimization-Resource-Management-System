const express = require('express');
const {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  toggleCrisisMode
} = require('../controllers/org.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

// Manager and Admin can toggle crisis mode
router.put('/:id/crisis', authorize('Admin', 'Manager'), toggleCrisisMode);

// Only Admins can manage organizations for now
router.use(authorize('Admin'));

router.route('/')
  .get(getOrganizations)
  .post(createOrganization);

router.route('/:id')
  .get(getOrganization)
  .put(updateOrganization)
  .delete(deleteOrganization);

module.exports = router;
