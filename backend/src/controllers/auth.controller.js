const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { ApiResponseModel } = require("../utils/classes");
const { isSuperAdmin } = require("../utils/adminAccess");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  let apiResponseModel = new ApiResponseModel();
  try {
    const { name, email, password, contactNumber } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email ? email.toLowerCase().trim() : "";

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: "Individual",
      profile: {
        phoneNumber: contactNumber || "",
        address: "",
      },
    });

    if (user) {
      apiResponseModel.status = true;
      apiResponseModel.msg = "Success";
      apiResponseModel.data = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        adminRole: user.role === 'Admin' && isSuperAdmin(user) ? 'superAdmin' : user.adminRole,
        profile: user.profile,
        token: generateToken(user._id),
      };
      return res.status(200).json(apiResponseModel);
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  let apiResponseModel = new ApiResponseModel();
  try {
    const { email, password } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email ? email.toLowerCase().trim() : "";

    // Check for user email
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user) {
      apiResponseModel.msg = "Invalid credentials";
      return res.status(401).json(apiResponseModel);
    }

    if (user.status !== 'Active') {
      apiResponseModel.msg = "This account is inactive. Please contact an administrator.";
      return res.status(401).json(apiResponseModel);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      apiResponseModel.msg = "Invalid credentials";
      return res.status(401).json(apiResponseModel);
    }
    apiResponseModel.status = true;
    apiResponseModel.msg = "Login successful";
    apiResponseModel.data = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      adminRole: user.role === 'Admin' && isSuperAdmin(user) ? 'superAdmin' : user.adminRole,
      token: generateToken(user._id),
    };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    apiResponseModel.msg = error.message;
    return res.status(500).json(apiResponseModel);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  let apiResponseModel = new ApiResponseModel();
  try {
    const { currentPassword, newPassword } = req.body;

    // User is attached to req by the protect middleware
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error("Incorrect current password");
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("New password must be at least 6 characters");
    }

    user.password = newPassword;
    await user.save();

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = {
      success: true,
      message: "Password updated successfully",
    };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  let apiResponseModel = new ApiResponseModel();
  try {
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = {
      success: true,
      message: "Logged out successfully",
    };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};
