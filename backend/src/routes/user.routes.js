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

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin User Management routes
router.route('/')
  .get(protect, authorize('Admin'), getUsers);

router.route('/inactive')
  .delete(protect, authorize('Admin'), deleteInactiveUsers);

router.route('/:id')
  .get(protect, authorize('Admin'), getUserById)
  .put(protect, authorize('Admin'), updateUser)
  .delete(protect, authorize('Admin'), deleteUser);

module.exports = router;
