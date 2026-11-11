const express = require('express');
const { 
  getUserProfile, 
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteInactiveUsers
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Specific literal routes (must come BEFORE parameterized routes in Express)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/inactive')
  .delete(protect, authorize('Admin'), deleteInactiveUsers);

// Root route
router.route('/')
  .get(protect, authorize('Admin'), getUsers);

// Parameterized routes (must come LAST)
router.route('/:id')
  .get(protect, authorize('Admin'), getUserById)
  .put(protect, authorize('Admin'), updateUser)
  .delete(protect, authorize('Admin'), deleteUser);

module.exports = router;
