const Organization = require('../models/Organization');
const User = require('../models/User');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Private/Admin
exports.getOrganizations = async (req, res, next) => {
  try {
    const organizations = await Organization.find().populate('admin', 'name email');
    res.status(200).json(organizations);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Private/Admin
exports.getOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id).populate('admin', 'name email');

    if (!organization) {
      res.status(404);
      throw new Error('Organization not found');
    }

    res.status(200).json(organization);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new organization
// @route   POST /api/organizations
// @access  Private/Admin
exports.createOrganization = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.admin = req.user._id;

    const organization = await Organization.create(req.body);

    // Automatically assign this admin to the newly created organization if they don't have one
    if (!req.user.organization) {
      await User.findByIdAndUpdate(req.user._id, { organization: organization._id });
    }

    res.status(201).json(organization);
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private/Admin
exports.updateOrganization = async (req, res, next) => {
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
      new: true,
      runValidators: true
    });

    res.status(200).json(organization);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private/Admin
exports.deleteOrganization = async (req, res, next) => {
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

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle crisis mode for organization
// @route   PUT /api/organizations/:id/crisis
// @access  Private/Admin/Manager
exports.toggleCrisisMode = async (req, res, next) => {
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

    res.status(200).json({ success: true, crisisMode: organization.crisisMode });
  } catch (error) {
    next(error);
  }
};
