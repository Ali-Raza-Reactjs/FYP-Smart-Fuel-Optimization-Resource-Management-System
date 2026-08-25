const { ApiResponseModel } = require("../utils/classes");
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const user = await User.findById(req.user._id);

    if (user) {
      apiResponseModel.status = true;
      apiResponseModel.msg = "Success";
      apiResponseModel.data = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      };
      return res.status(200).json(apiResponseModel);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      if (req.body.profile) {
        user.profile = { ...user.profile, ...req.body.profile };
      }
      
      // Also support flat payload structure for phoneNumber and address
      if (req.body.phoneNumber) {
        user.profile.phoneNumber = req.body.phoneNumber;
      }
      if (req.body.address) {
        user.profile.address = req.body.address;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      apiResponseModel.status = true;
      apiResponseModel.msg = "Success";
      apiResponseModel.data = {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile
      };
      return res.status(200).json(apiResponseModel);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const users = await User.find({}).select('-password');
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = users;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user details by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = user;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details (Admin)
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.status = req.body.status || user.status;

    if (req.body.profile) {
      user.profile = { ...user.profile, ...req.body.profile };
    }
    if (req.body.phoneNumber) {
      user.profile.phoneNumber = req.body.phoneNumber;
    }
    if (req.body.address) {
      user.profile.address = req.body.address;
    }

    const updatedUser = await user.save();
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      profile: updatedUser.profile
    };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a specific user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    await user.deleteOne();
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = { success: true, message: 'User deleted successfully' };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all inactive users
// @route   DELETE /api/users/inactive
// @access  Private (Admin)
exports.deleteInactiveUsers = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const result = await User.deleteMany({ status: 'Inactive' });
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = { success: true, message: `${result.deletedCount} inactive users deleted` };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};
