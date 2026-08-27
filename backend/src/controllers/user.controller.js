const { ApiResponseModel } = require("../utils/classes");
const User = require('../models/User');
const { isSuperAdmin } = require('../utils/adminAccess');

exports.createAdmin = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const { name, email, password, contactNumber } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    if (!name || !normalizedEmail || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required');
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const admin = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'Admin',
      adminRole: 'supportAdmin',
      profile: { phoneNumber: contactNumber || '', address: '' }
    });

    apiResponseModel.status = true;
    apiResponseModel.msg = 'Success';
    apiResponseModel.data = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      adminRole: admin.adminRole,
      status: admin.status,
      profile: admin.profile
    };
    return res.status(201).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

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
        adminRole: user.role === 'Admin' && isSuperAdmin(user) ? 'superAdmin' : user.adminRole,
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
    const rawRoles = req.query.role ?? req.query['role[]'];
    const requestedRoles = Array.isArray(rawRoles)
      ? rawRoles
      : rawRoles ? [rawRoles] : ['Individual'];
    const query = requestedRoles.includes('Admin')
      ? {
        $or: [
          { role: { $in: requestedRoles.filter(role => role !== 'Admin') } },
          { role: 'Admin', adminRole: 'supportAdmin' }
        ]
      }
      : { role: { $in: requestedRoles } };

  const users = await User.find(query).select('-password');
    const data = users.map(user => {
      const userData = user.toObject();
      if (isSuperAdmin(user)) userData.adminRole = 'superAdmin';
      return userData;
    });
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = data;
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

    const nextRole = req.body.role || user.role;
    const nextStatus = req.body.status || user.status;
    if (user.role === 'Admin' && user.status === 'Active' && (nextRole !== 'Admin' || nextStatus !== 'Active')) {
      const activeAdminCount = await User.countDocuments({ role: 'Admin', status: 'Active' });
      if (activeAdminCount <= 1) {
        res.status(400);
        throw new Error('At least one active Admin must remain in the system');
      }
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.status = req.body.status || user.status;

    if (user.role === 'Admin' && !isSuperAdmin(req.user)) {
      res.status(403);
      throw new Error('Only a Super Admin can manage administrator accounts');
    }

    if (user.role === 'Admin' && req.body.adminRole) {
      const configuredAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
      if (req.body.adminRole === 'superAdmin' && user.email?.toLowerCase() !== configuredAdminEmail) {
        res.status(400);
        throw new Error('Only the primary Admin can have the Super Admin role');
      }
      user.adminRole = req.body.adminRole;
    }

    if (req.body.profile) {
      user.profile = { ...user.profile, ...req.body.profile };
    }
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
      adminRole: updatedUser.role === 'Admin' && isSuperAdmin(updatedUser) ? 'superAdmin' : updatedUser.adminRole,
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

    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own account');
    }

    if (user.role === 'Admin' && !isSuperAdmin(req.user)) {
      res.status(403);
      throw new Error('Only a Super Admin can manage administrator accounts');
    }

    if (user.status !== 'Inactive') {
      res.status(400);
      throw new Error('Only inactive users can be deleted');
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
    const query = isSuperAdmin(req.user)
      ? { status: 'Inactive' }
      : { status: 'Inactive', role: { $ne: 'Admin' } };
    const result = await User.deleteMany(query);
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = { success: true, message: `${result.deletedCount} inactive users deleted` };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};
