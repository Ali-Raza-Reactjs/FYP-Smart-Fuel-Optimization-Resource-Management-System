const { ApiResponseModel } = require("../utils/classes");
const Organization = require('../models/Organization');
const User = require('../models/User');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Private/Admin
exports.getOrganizations = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const organizations = await Organization.find().populate('admin', 'name email');
    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = organizations;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Private/Admin
exports.getOrganization = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const organization = await Organization.findById(req.params.id).populate('admin', 'name email');

    if (!organization) {
      res.status(404);
      throw new Error('Organization not found');
    }

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = organization;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Private/Admin
exports.createOrganization = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    // Add user to req.body
    req.body.admin = req.user._id;

    const organization = await Organization.create(req.body);

    // Automatically assign this admin to the newly created organization if they don't have one
    if (!req.user.organization) {
      await User.findByIdAndUpdate(req.user._id, { organization: organization._id });
    }

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = organization;
    return res.status(201).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private/Admin
exports.updateOrganization = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    let organization = await Organization.findById(req.params.id);

    if (!organization) {
      res.status(404);
      throw new Error('Organization not found');
    }

    // Make sure user is organization admin or super admin
    // For this FYP, assuming any Admin role can edit any organization
    if (req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to update this organization');
    }

    organization = await Organization.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = organization;
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private/Admin
exports.deleteOrganization = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      res.status(404);
      throw new Error('Organization not found');
    }

    if (req.user.role !== 'Admin') {
      res.status(403);
      throw new Error('Not authorized to delete this organization');
    }

    await organization.deleteOne();

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = { success: true, data: {} };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle crisis mode for organization
// @route   PUT /api/organizations/:id/crisis
// @access  Private/Admin/Manager
exports.toggleCrisisMode = async (req, res, next) => {
    let apiResponseModel = new ApiResponseModel();
try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      res.status(404);
      throw new Error('Organization not found');
    }

    if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
      res.status(403);
      throw new Error('Not authorized to toggle crisis mode');
    }

    organization.crisisMode = !organization.crisisMode;
    await organization.save();

    apiResponseModel.status = true;
    apiResponseModel.msg = "Success";
    apiResponseModel.data = { success: true, crisisMode: organization.crisisMode };
    return res.status(200).json(apiResponseModel);
  } catch (error) {
    next(error);
  }
};
